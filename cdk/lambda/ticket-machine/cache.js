	const AWS = require('aws-sdk');

	const TABLENAME = process.env.cacheTableName;

	
	function init() {
		const region  = process.env.region;
		const account = process.env.account;
		var dbclient, docdbclient;

		function getClient() {
			if (!dbclient)
				dbclient = new AWS.DynamoDB({region});

			return dbclient;
		}

		function getDocClient() {
			if (!dbclient)
				dbclient = new AWS.DynamoDB({region});

			if (!docdbclient)
			docdbclient = new AWS.DynamoDB.DocumentClient({service:dbclient });
			return docdbclient;
		}

		async function set(key, value, timeToLiveMs) {

			await deleteExistingItem(key);
			let Item = {
				key,
				value
			};

			if (timeToLiveMs) {
				var expireTimestamp = (new Date()).getTime() + timeToLiveMs;
				Item.expire = expireTimestamp;
				Item['readable-expire'] = new Date(expireTimestamp).toString();
			}
			var params = {
				TableName : TABLENAME,
				Item	
			};
			try {
				console.log('before cache put');
				await getDocClient().put(params).promise();
				console.log('after cache put');

				return true;
			} catch(e) {
				console.log({cachePutError:e});
				return false;
			}
		}

		async function deleteExistingItem(key) {
			try {
				var params = { Key: {}, TableName: TABLENAME };
				params.Key.key = { S: key };
				await getClient().deleteItem(params).promise();
				return true;
			} catch (err) {
				console.log({err});
				return false;
			}
		}

		async function get(key) {
			var params = {
				TableName : TABLENAME,
				Key: { key:key }
			};
			console.log('par='+JSON.stringify(params))
			let data;
			try {
				console.log('before cache get');
				data = await getDocClient().get(params).promise();
				console.log('after cache get');
				console.log(JSON.stringify({getdata:data}));
			}catch(e) {
				console.log({cacheGetError:e});
				return false;
			}
			if (!data)
				return null;

			var now = new Date().getTime();
			if (data.Item && data.Item.expire && data.Item.expire>0 && data.Item.expire<now){
				await deleteExistingItem(key);
				return null;
			}
			return data.Item.value;
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