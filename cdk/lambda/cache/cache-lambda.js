
//const AWS = require('aws-sdk');

const cacheFactory = require('./cache.js');

let actions = {}



actions.clean = async function(event) {
	var result = await cache.clean();
	return { statusCode: 200, body: result};
}

actions.get = async function(event) {
	var value = await cache.get(event.key);
	return { statusCode: 200, body: value };
}

actions.set = async function(event) {
	var result = cache.set(event.key, event.value, event.timeToLiveMs);
	return { statusCode: 200, body: result};
}



actions.reset = async function(event) {
	var result = await cache.reset();
	return { statusCode: 200, body: result};
}

actions.changeExpiration = async function(event) {
	var result = cache.changeExpiration(event.key, event.timestamp);
	return { statusCode: 200, body: result};
}


let cache = cacheFactory();

exports.main = async (event, context) => {
	console.log(JSON.stringify({lambdaevent:event},null,2));
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
