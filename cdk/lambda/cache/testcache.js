const AWS = require('aws-sdk');

const TABLENAME = 'T9312-TMCACHE';

async function main() {
	var now = new Date().getTime();
	console.log('start ' + now);
	let dbclient = new AWS.DynamoDB({ region: 'eu-south-1' });
	let ids = [];
	var params = {
		ExpressionAttributeNames: {
			"#A": "key",
			"#B": "expire"
		},
		ExpressionAttributeValues: {
			":a": {
				N: now + ''
			}
		},
		//Limit: '20',
		FilterExpression: "attribute_exists(expire) and expire < :a",
		ProjectionExpression: "#A,#B",
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
				"key": {
					S: id
				}
			},
			TableName: TABLENAME,
			//ReturnValues: "ALL_OLD"
		};
		let resp = await dbclient.deleteItem(delparams).promise();
		//console.log(resp);
	}
	return "OK";
}



main().then(console.log, console.log);