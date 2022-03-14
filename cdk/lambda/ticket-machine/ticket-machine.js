// deploy test
const AWS = require('aws-sdk');
const utils = require('./utils.js');
const logic = require('./ticket-machine-logic');
var cacheFactory = require('./cache');

const region  = process.env.region;
const account = process.env.account;

var cache = cacheFactory();


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
	getOIDCConfig
}