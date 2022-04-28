
//const AWS = require('aws-sdk');

const cacheFactory = require('./cache.js');

let actions = {}



actions.clean = async function(event) {
	var result = await cache.clean();
	return result;
}

actions.get = async function(event) {
	var result = await cache.get(event.key);
	return result;
}

actions.set = async function(event) {
	var result = cache.set(event.key, event.value, event.timeToLiveMs);
	return result;
}

actions.reset = async function(event) {
	var result = await cache.reset();
	return result;
}

actions.delete = async function(event) {
	var result = await cache.delete(event.key);
	return result;
}

actions.changeExpiration = async function(event) {
	var result = cache.changeExpiration(event.key, event.timestamp);
	return result;
}


let cache = cacheFactory();

exports.main = async (event, context) => {
	console.log(JSON.stringify({cacheLambdaEvent:event}));
	try {
		let ret = actions[event.function](event);
		return ret;
	}
	catch(err) {
		console.log(err);
		if (err.stack)
			console.log(err.stack.split('\n'));
		return { statusCode: 500, body: err };
	}
};
