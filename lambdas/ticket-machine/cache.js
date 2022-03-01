	const AWS = require('aws-sdk');
	const utils = require('./utils.js');

	const KEYFIELD = 'key';
	const VALUEFIELD = 'value';
	const EXPIREFIELD = 'expire';
	const TABLENAME = 'public-cache';

	function init(config) {
		var cfg = Object.assign({}, config);
		var dbclient;

		function getClient() {
			if (!dbclient)
				dbclient = new AWS.DynamoDB(cfg);

			return dbclient;
		}

		async function set(key, value, timeToLiveMs) {

			await deleteExistingItem(key);

			try {
				var Item = {};
				Item[KEYFIELD] = { S: key };
				Item[VALUEFIELD] = { S: JSON.stringify(value) };
				if (timeToLiveMs) {
					var expireTimestamp = (new Date()).getTime() + timeToLiveMs;
					Item[EXPIREFIELD] = { "N": expireTimestamp.toString() }
					Item['readable-expire'] = { "S": new Date(expireTimestamp).toString() }
				}
				var params = {
					Item,
					TableName: TABLENAME
				}
				await getClient().putItem(params).promise();
				return true;
			} catch (err) {
				console.log({err});
				return false;
			}
		}

		async function deleteExistingItem(key) {
			try {
				var params = { Key: {}, TableName: TABLENAME };
				params.Key[KEYFIELD] = { S: key };
				await getClient().deleteItem(params).promise();
				return true;
			} catch (err) {
				console.log({err});
				return false;
			}
		}

		async function get(key) {
			try {
				var params = { Key: {}, TableName: TABLENAME };
				params.Key[KEYFIELD] = { S: key };
				var data = await getClient().getItem(params).promise();
				var expire = (data.Item.expire ? data.Item.expire.N-0 : 0);
				var now = new Date().getTime();
				if (expire>0 && expire < now) {
					await deleteExistingItem(key);
					return null;
				}
				var value = data.Item.value.S;
				return JSON.parse(value);
			} 
			catch (err) {
				console.log({err});
				return null;
			}
		}

		async function clean() {
			var now = new Date().getTime();

		}

		async function reset() {

		}

		return {
			get, set, clean, reset
		}
	}

	module.exports = init;