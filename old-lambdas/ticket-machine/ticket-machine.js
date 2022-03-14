// deploy test
const AWS = require('aws-sdk');
const utils = require('./utils.js');
const logic = require('./ticket-machine-logic');
var cacheFactory = require('./cache');
var cache = cacheFactory({
	region : 'eu-south-1'
});



const default_region = 'eu-south-1';
function getAccessTokenPayload(access_token) {
	var x = access_token.split('.')[1];
	var y = utils.atob(x);
	var z = JSON.parse(y);
	return z;
}


function getAccessTokenIssuer(access_token) {
	return getAccessTokenPayload(access_token).iss;
}

function now() {
	return new Date().getTime();
}

function getAccessTokenExpireTimestamp(access_token) {
	var seconds = getAccessTokenPayload(access_token).exp;
	var d = new Date(seconds*1000);
	return d.getTime();
}

async function verifyToken(token) {
	return true;
}

async function getUserInfo(access_token) {
	console.log('GET USER INFO '+access_token);
	try {
		var expireTimestamp = getAccessTokenExpireTimestamp(access_token);
		console.log({expireTimestamp});
		if (expireTimestamp<now()) {
			console.log('expired');
			return { error: 'token expired'};
		}
		console.log('cerco userinfo in cache');
		var userinfoCacheKey = 'userinfo:'+access_token;
		var userinfo = await cache.get(userinfoCacheKey);
		console.log({userinfo});
		if (userinfo)
			return userinfo;

		var issuer = getAccessTokenIssuer(access_token);
		var cacheKey = 'config:'+issuer;
		console.log('cerco config in cache');
		var config = await cache.get(cacheKey);
		if (!config) {
			console.log({config});
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
		var ttl = expireTimestamp-now();
		await cache.set(userinfoCacheKey, userinfo, ttl);
		//console.log({userinfo});
		return userinfo;
	} catch (e) {
		console.log({error:e})
		console.log({error:e.stack})
		return JSON.stringify(e);
	}
}

async function getCredentials(access_token, region, sessionName, source) {
	console.log({getCredentials:{access_token, region, sessionName, source}});
	var userinfo = {};
	userinfo = await getUserInfo(access_token);
	var account = '071979381930'; // da parametrizzare
	var role = await logic.selectRole(userinfo, source);
	var RoleArn = `arn:aws:iam::${account}:role/${role}`;

	var params = {
		RoleArn,
		RoleSessionName: sessionName,
		DurationSeconds: 900
	};
	var sts = await getSTS(region);
	var assumeRoleData = await sts.assumeRole(params).promise();
	
	return {
		role: RoleArn,
		region,
		userinfo,
		credentials: assumeRoleData.Credentials
	};
}

async function getSTS(region) {
	console.log('get STS ver 2');
	if (!region)
		region = default_region;
	
	var ssm = new AWS.SSM({
		apiVersion: '2014-11-06',
		//region: 'eu-south-1'
	});

	console.log('get parameters');
	var get1 = ssm.getParameter({Name: 'ticketMachineUserKeyId'});
	var resp1 = await get1.promise();
	var ticketMachineUserKeyId = resp1.Parameter.Value;

	var get2 = ssm.getParameter({Name: 'ticketMachineUserSecretAccessKey'});
	var resp2 = await get2.promise();
	var ticketMachineUserSecretAccessKey = resp2.Parameter.Value;
	

	console.log({ticketMachineUserKeyId});


	const sts = new AWS.STS({
		params: {
			prova123: '1 2 3 prova'
		},
		// accessKeyId: adminWithoutMFAKeyId,
		// secretAccessKey: adminWithoutMFASecretAccessKey,
		accessKeyId: ticketMachineUserKeyId,
		secretAccessKey: ticketMachineUserSecretAccessKey,

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
	getOIDCConfig
}