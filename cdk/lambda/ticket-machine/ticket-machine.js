// deploy test
const AWS = require('aws-sdk');
//const querystring = require('querystring');
const jose = require('node-jose');

const utils = require('./ticket-machine-utils.js');
const logic = require('./ticket-machine-logic');

const region  = process.env.region;
const account = process.env.account;
const sessionDuration = 60*60*1000;
const providerInfoRetention = 60*60*1000;

// TODO: spostare in configurazione
const oidcProvider = {
	cognito: {
		base: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_SgNY6TTJQ',
		scope: 'openid aws.cognito.signin.user.admin email phone profile',
		clientId: '3u600gkmd1kp54tc454a0c441m'
	},
	google: {
		// https://console.cloud.google.com/apis/credentials?project=api-project-181501718002
		base: 'https://accounts.google.com/',
		scope: "openid email profile",
		clientId: '181501718002-t1f3557f4k5aiaa85fplvs2v43kbkgl5.apps.googleusercontent.com',
		clientSecret: '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'
	}
};


async function getProviderInfo(provider) {
	console.log('getProviderInfo '+provider);
	let desc = oidcProvider[provider];
	let infoKey = 'providerInfo.'+provider;
	let providerInfo = await utils.cacheGet(infoKey);
	if (!providerInfo) {
		console.log('provider info not in cache');
		let configUrl = desc.base + '/.well-known/openid-configuration';
		providerInfo = await utils.doHttpsRequest(configUrl);
		providerInfo = JSON.parse(providerInfo);
		console.log(JSON.stringify({providerInfo},null,2));

		let certurl = providerInfo.jwks_uri;
		console.log('certurl='+certurl);
		let certdata = await utils.doHttpsRequest(certurl);
		console.log('certdata='+certdata);
		providerInfo.cert = JSON.parse(certdata);
	
		console.log(JSON.stringify({providerInfo},null,2));
		await utils.cacheSet(infoKey, providerInfo, providerInfoRetention);
	}
	if (typeof (providerInfo)=='string')
		providerInfo = JSON.parse(providerInfo);

	return providerInfo;
}

async function getLoginParameters(provider, origin) {
	console.log('getLoginParameters-2');
	const apiURL=process.env.apiURL;
	console.log('apiURL='+apiURL);

	let desc = oidcProvider[provider];
	let providerInfo = await getProviderInfo(provider);
	if (!providerInfo)
		throw "cannot fine providerInfo for provider="+provider;

	let codeVerifier = utils.generateRandomString(100);
	let id = utils.generateRandomString(20);
	let challenge = await utils.generateCodeChallenge(codeVerifier);
	console.log({ codeVerifier, challenge });

	let stateObj = {
		origin,
		id
	};
	let state = utils.btoa(JSON.stringify(stateObj));
	let callback=apiURL+'login-cb-page';
	let params = {
		state,
		client_id: desc.clientId,
		scope: desc.scope,
		response_type: 'code',
		redirect_uri: callback,
		access_type: 'offline',
		code_challenge: challenge,
		code_challenge_method: 'S256'
	};
	let search = new URLSearchParams(params);
	let url = providerInfo.authorization_endpoint + '?' + search.toString();
	
	let cacheKey = 'auth-state-'+id;
	let obj = {
		id,
		provider,
		callback,
		challenge,
		state,
		codeVerifier
	};
	await utils.cacheSet(cacheKey, obj, sessionDuration);
	return {
		url,
		id
	};
}


async function getCredentials(localToken, sessionName, extraInfo) {
	sessionName = sessionName || 'session'+Math.random();
	let cacheKey = 'auth-state-'+localToken;
	let cacheElement = utils.cacheGet(cacheKey);

	let userinfo = cacheElement.userinfo;
	var roles = JSON.parse(process.env.roles);

	var role = await logic.selectRole(roles, userinfo, extraInfo);
	console.log(`role arn = ${role}`);

	var params = {
		RoleArn: role,
		RoleSessionName: sessionName,
		DurationSeconds: 900
	};
	var sts = await _getSTS();
	var assumeRoleData = await sts.assumeRole(params).promise();
	
	return {
		role: role.split(':role/')[1],
		region,
		userinfo,
		credentials: assumeRoleData.Credentials
	};
}
async function logout(sessionId) {
	console.log('logout '+sessionId);
	let cacheKey = 'auth-state-'+sessionId;
	console.log('cacheKey = '+cacheKey);
	await utils.cacheDelete(cacheKey);
	console.log('ora non dovresti più poter effettuare chiamate con '+sessionId);
	return {ok:true};
}

async function getLoginCallbackPage(code, state) {
	try {

		console.log('getLoginCallbackPage code='+code+', state='+state);
		let obj = JSON.parse(utils.atob(state));
		let { origin, id} = obj;
		let cacheKey = 'auth-state-'+id;
		console.log('cacheKey = '+cacheKey);
		let cacheElement = await utils.cacheGet(cacheKey);

		console.log(JSON.stringify({cacheGetResult:{cacheElement}},null,2));
		if (!cacheElement)
			throw "invalid session 2";
		
		let  {
			//state,
			provider,
			callback,
			codeVerifier
		} = cacheElement;

		let desc = oidcProvider[provider];
		if (!desc)
			throw "Unknown provider";

		let providerInfo = await getProviderInfo(provider);
		let endpoint = providerInfo.token_endpoint;
		var params = {
			grant_type: 'authorization_code',
			client_id: desc.clientId,
			code,
			code_verifier: codeVerifier,
			redirect_uri: callback // non penso che serva
		};
		if (desc.clientSecret)
			params.client_secret = desc.clientSecret;
		
		console.log({params});
		let req = utils.doHttpsRequest(endpoint,{method:'POST'}, params);
		let resp = await(req);
		resp = JSON.parse(resp);
		console.log(JSON.stringify(resp,null,2));
			
		cacheElement.expire = (new Date()).getTime()+resp.expires_in*1000;
		console.log('scadenza: '+new Date(cacheElement.expire));
		cacheElement.id_token = resp.id_token;
		cacheElement.access_token = resp.access_token;
		console.log('access_token='+cacheElement.access_token);
		console.log('id_token='+cacheElement.id_token);

		utils.cacheSet(cacheKey, cacheElement, cacheElement.expire);
		// attenzione: non e' detto che debba scadere. Da ripensare

		// verifica del token
		let verified = false;
		jks = JSON.stringify(providerInfo.cert);
		console.log('jks='+jks);
		let ks = await jose.JWK.asKeyStore(jks);
		console.log('ks='+JSON.stringify(ks));
		try {
			console.log('verify access token '+resp.access_token);
			let result = await jose.JWS.createVerify(ks).verify(resp.access_token);
			console.log('signature verification is ok');
			verified=true;
		}catch(e) {
			console.log('access token verification failed: '+e);
		}
		try {
			console.log('verify id token '+resp.id_token);
			let result = await jose.JWS.createVerify(ks).verify(resp.id_token);
			console.log('signature verification is ok');
			verified=true;
		}catch(e) {
			console.log('id token verification failed: '+e);
		}
		if (!verified)
			throw "invalid access_token";


		let url = providerInfo.userinfo_endpoint;
		let inforeq = utils.doHttpsRequest(url, {
			method: 'GET',
			dataType: "jsonp",
			headers: {
				Authorization: 'Bearer ' + cacheElement.access_token
			}
		});
		let userinfo = await inforeq;
		userinfo = JSON.parse(userinfo);
		console.log(userinfo);
		cacheElement.userinfo = userinfo;
		utils.cacheSet(cacheKey, cacheElement, sessionDuration);
			
		return `<!DOCTYPE html>
			<html>
			<body>wait...</body>
			<script>
				var obj = {
					type: 'authCallback',
					sid: '${id}',
					user: ${JSON.stringify(userinfo,null,2)},
					expire: ${cacheElement.expire}
				};
				if (window.opener) {
					window.opener.postMessage(JSON.stringify(obj), "${origin}");
					setTimeout(()=>window.close(), 1);
				}
				if (window.parent && !(window===window.parent))
					window.parent.postMessage(JSON.stringify(obj), "${origin}");
			</script>
			</html>`;
	}
	catch(e2) {
		console.log(e2);
		return `<!DOCTYPE html>
			<html>
			<body><h3>Error: ${e2}</h3></body>
			</html>`;

	}
}

async function _getSTS() {
	

	const sts = new AWS.STS({
		endpoint:`https://sts.${region}.amazonaws.com`,
		region
	});
	
	return sts;
}


async function sessionRefresh(id) {

}

async function sessionSet(id, key, value) {
	// return previous value
} 

async function sessionGet(id, key) {

} 


module.exports = {
	getCredentials,
	//getOIDCConfig,
	getLoginParameters,
	//loginSetCode,
	getLoginCallbackPage,
	logout,
	sessionRefresh,
	sessionSet,
	sessionGet
};