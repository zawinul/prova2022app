const AWS = require('aws-sdk');

const TABLENAME = process.env.cacheTableName;


function init() {
	const region = process.env.region;
	const account = process.env.account;
	var dbclient, docdbclient;

	function _getClient() {
		if (!dbclient)
			dbclient = new AWS.DynamoDB({ region });

		return dbclient;
	}

	function _getDocClient() {
		if (!dbclient)
			dbclient = new AWS.DynamoDB({ region });

		if (!docdbclient)
			docdbclient = new AWS.DynamoDB.DocumentClient({ service: dbclient });
		return docdbclient;
	}

	async function set(key, value, timeToLiveMs) {

		await _deleteExistingItem(key);
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
			TableName: TABLENAME,
			Item
		};
		try {
			console.log('before cache put');
			await _getDocClient().put(params).promise();
			console.log('after cache put');

			return true;
		} catch (e) {
			console.log({ cachePutError: e });
			return false;
		}
	}

	async function _deleteExistingItem(key) {
		try {
			var params = { Key: {}, TableName: TABLENAME };
			params.Key.key = { S: key };
			await _getClient().deleteItem(params).promise();
			return true;
		} catch (err) {
			console.log({ err });
			return false;
		}
	}

	async function _delete(key) {
		console.log('delete '+key);
		let ok = await _deleteExistingItem(key);
		console.log('delete ok = '+ok);
		return ok;
	}

	async function get(key) {
		var params = {
			TableName: TABLENAME,
			Key: { key: key }
		};
		console.log('par=' + JSON.stringify(params))
		let data;
		try {
			console.log('before cache get');
			data = await _getDocClient().get(params).promise();
			console.log('after cache get');
			console.log(JSON.stringify({ getdata: data, asBoolean:!!data }));
		} catch (e) {
			console.log({ cacheGetError: e });
			return false;
		}
		if (!data || !data.Item)
			return null;

		var now = new Date().getTime();
		if (data.Item.expire && data.Item.expire > 0 && data.Item.expire < now) {
			await _deleteExistingItem(key);
			return null;
		}
		return data.Item.value;
	}

	async function clean() {
		var now = new Date().getTime();
		console.log('start ' + now);
		let dbclient = new AWS.DynamoDB({ region: 'eu-south-1' });
		let ids = [];
		var params = {
			ExpressionAttributeNames: {
				"#A": "key"
			},
			ExpressionAttributeValues: {
				":a": {
					N: now + ''
				}
			},
			//Limit: '20',
			FilterExpression: "attribute_exists(expire) and expire < :a",
			ProjectionExpression: "#A",
			TableName: TABLENAME
		};
		while (true) {
			let data = await dbclient.scan(params).promise();
			if (data && data.Items)
				data.Items.map(item => ids.push(item.key.S));
			if (!data.LastEvaluatedKey)
				break;
			params.ExclusiveStartKey = data.LastEvaluatedKey;
		}
	
		console.log(ids.length + ' elements to delete');
		for (let id of ids) {
			console.log('delete '+id);
			let delparams = {
				Key: {
					"key": {S: id}
				},
				TableName: TABLENAME
			};
			await dbclient.deleteItem(delparams).promise();
		}
	}

	async function reset() {
		return true;
	}

	async function changeExpiration(key, timestamp) {
		var getParams = {
			TableName: TABLENAME,
			Key: { key: key }
		};
		console.log('par=' + JSON.stringify(getParams))
		let data;
		try {
			// console.log('before cache get');
			data = await _getDocClient().get(getParams).promise();
			// console.log('after cache get');
			// console.log(JSON.stringify({getdata:data}));
		} catch (e) {
			console.log({ cacheGetError: e });
			return false;
		}
		if (!data)
			return null;

		var now = new Date().getTime();

		if (!data.Item) { // non si puo' prolungare se gia' expired
			return false;
		}
		data.Item.expire = timestamp;
		let readableExp = new Date(timestamp).toString();
		data.Item['readable-expire'] = readableExp;
		var setParams = {
			TableName: TABLENAME,
			Item: data.Item
		};
		try {
			await _getDocClient().put(params).promise();
			console.log('exp(' + key + ') = ' + readableExp);
			return true;
		} catch (e) {
			console.log({ cachePutError: e });
			return false;
		}
	}

	return {
		get, 
		set, 
		clean, 
		reset, 
		changeExpiration, 
		delete: _delete
	}
}

module.exports = init;