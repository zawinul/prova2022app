// deploy test
const AWS = require('aws-sdk');
const querystring = require('querystring');
const jose = require('jose');

const utils = require('./utils.js');
const logic = require('./ticket-machine-logic');
var cacheFactory = require('./cache');

const region  = process.env.region;
const account = process.env.account;

var cache = cacheFactory();

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

async function loginSetCode(id, href) {
	console.log(`loginSetCode(${id}, ${href})`)
	let cacheKey = 'auth-state-'+id;
	console.log('cacheKey = '+cacheKey);
	let cacheElement = await cache.get(cacheKey);
	console.log(JSON.stringify({cacheElement},null,2))
	if (!cacheElement)
		throw "invalid session";

	let  {
		state,
		provider,
		callback,
		codeVerifier
	} = cacheElement;

	let u = new URL(href);
	let ustate = u.searchParams.get('state');
	let code = u.searchParams.get('code');
	console.log('state='+state);
	console.log('code='+code);
	if (ustate!=state)
		throw "wrong state";

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

	cache.set(cacheKey, cacheElement, cacheElement.expire);
	// attenzione: non e' detto che debba scadere. Da ripensare

	// verifica del token
	let verified = false;
	for(let i=0; i<providerInfo.cert.keys.length;i++) {
		let k = providerInfo.cert.keys[i];
		console.log(i+': k='+JSON.stringify(k));
		let jk =  await jose.importJWK(k);
		console.log(i+': jk='+JSON.stringify(jk));
		try {
			console.log('before verify '+i);
			let data = await jose.jwtVerify(cacheElement.id_token,jk);
			console.log('after verify '+i);
			console.log(JSON.stringify({verified:data},null,2));
			verified = true;
		} catch(e) {
			console.log("err i="+i+": "+e);
		}
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
	let inforesp = await inforeq;
	inforesp = JSON.parse(inforesp);
	console.log(inforesp);
	return inforesp;

}

async function getProviderInfo(provider) {
	let desc = oidcProvider[provider];
	let infoKey = 'providerInfo.'+provider;
	let providerInfo = await cache.get(infoKey);
	if (!providerInfo) {
		console.log('provider info not in cache')
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
		await cache.set(infoKey, providerInfo, 1000*3600);
	}
	if (typeof (providerInfo)=='string')
		providerInfo = JSON.parse(providerInfo);

	return providerInfo;
}

async function getLoginParameters(provider,callback) {
	console.log('getLoginParameters-2');
	let desc = oidcProvider[provider];
	let providerInfo = await getProviderInfo(provider);

	
	let codeVerifier = utils.generateRandomString(100);
	let id = utils.generateRandomString(20);
	let challenge = await utils.generateCodeChallenge(codeVerifier);
	console.log({ codeVerifier, challenge });

	let stateObj = {
		seed: utils.generateRandomString(100),
		provider
	};
	let state = utils.btoa(JSON.stringify(stateObj));
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
	await cache.set(cacheKey, obj, 24*60*60*1000);
	return {
		url,
		id
	}
}

function getAccessTokenPayload(access_token) {
	var x = access_token.split('.')[1];
	var y = utils.atob(x);
	var z = JSON.parse(y);
	return z;
}


function getAccessTokenIssuer(access_token) {
	return getAccessTokenPayload(access_token).iss;
}



function getAccessTokenExpireTimestamp(access_token) {
	var seconds = getAccessTokenPayload(access_token).exp;
	var d = new Date(seconds*1000);
	return d.getTime();
}

async function verifyToken(token) {
	return true;
}

async function getAccessTokenFromCode(code, state, provider) {
	
}

async function getUserInfo(access_token) {
	//console.log('GET USER INFO '+access_token);
	try {
		var expireTimestamp = getAccessTokenExpireTimestamp(access_token);
		//console.log({expireTimestamp});
		if (expireTimestamp<utils.now()) {
			console.log('expired');
			return { error: 'token expired'};
		}
		console.log('cerco userinfo in cache');
		var userinfoCacheKey = 'userinfo:'+access_token;
		var userinfo = await cache.get(userinfoCacheKey);
		//console.log({userinfo});
		if (userinfo)
			return userinfo;

		var issuer = getAccessTokenIssuer(access_token);
		var cacheKey = 'config:'+issuer;
		console.log('cerco config in cache');
		var config = await cache.get(cacheKey);
		if (!config) {
			//console.log({config});
			var configUrl = issuer + '/.well-known/openid-configuration';
			var response = await utils.doHttpsRequest(configUrl, {});
			var config = JSON.parse(response);
			// refreshiamo una volta all'ora
			console.log('set config in cache');
			await cache.set(cacheKey, config, 1000*3600);
		}
		var endpoint = config.userinfo_endpoint;

		var	Authorization = 'Bearer ' + access_token;
		var response = await utils.doHttpsRequest(endpoint, {
			headers: {
				Authorization
			}
		});
		userinfo = JSON.parse(response);
		var ttl = expireTimestamp-utils.now();
		await cache.set(userinfoCacheKey, userinfo, ttl);
		//console.log({userinfo});
		return userinfo;
	} catch (e) {
		console.log({error:e})
		//console.log({error:e.stack})
		return JSON.stringify(e);
	}
}

async function getCredentials(access_token, sessionName, source, extraInfo) {
	//console.log({getCredentials:{access_token, sessionName, source}});
	sessionName = sessionName || 'session'+Math.random();

	let userinfo = {};
	userinfo = await getUserInfo(access_token);
	var roles = JSON.parse(process.env.roles);

	var role = await logic.selectRole(roles, userinfo, source, extraInfo);
	console.log(`role arn = ${role}`);

	var params = {
		RoleArn: role,
		RoleSessionName: sessionName,
		DurationSeconds: 900
	};
	var sts = await getSTS();
	var assumeRoleData = await sts.assumeRole(params).promise();
	
	return {
		role: role.split(':role/')[1],
		region,
		userinfo,
		credentials: assumeRoleData.Credentials
	};
}



async function getSTS() {
	

	const sts = new AWS.STS({
		endpoint:`https://sts.${region}.amazonaws.com`,
		region
	});
	
	return sts;
}

async function getOIDCConfig(issuer) {
	var configUrl = issuer + '/.well-known/openid-configuration';
	var response = await utils.doHttpsRequest(configUrl, {});
	var config = JSON.parse(response);
	return config;
}



module.exports = {
	verifyToken,
	getCredentials,
	getUserInfo,
	getOIDCConfig,
	getLoginParameters,
	loginSetCode
		
}