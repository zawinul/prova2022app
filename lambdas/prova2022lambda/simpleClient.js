const http = require('http');
const https = require('https');


function log(x) { console.log(x);};

function doRequest(url, options, data) {
	if (!options) 
		options = {};


	log({ doRequest: { url, options, data } });

	return new Promise((resolve, reject) => {
		log('starting promise');
		function onRes(res) {
			log({res});
			res.setEncoding("utf8");
			let responseBody = "";

			res.on("data", (chunk) => {
				log({chunk});
				responseBody += chunk;
			});

			res.on("end", () => {
				log('res end');
				resolve(responseBody);
			});
		}
		var req = url ? https.request(url, options, onRes) : https.request(options, onRes); 

		req.on("error", (err) => {
			log({err});
			reject(err);
		});
		req.end();
	});
}

async function prova() {
	var options = {
		host: 'numbersapi.com',
		path: '/random/math',
		//port: 80,
		//timeout: 2
	};

	var options = {
		host: "bittrex.com",
		path: "/api/v1.1/public/getmarketsummaries"

	};
	var output = await doRequest(null, options);
	return output;
}

exports.handler =  (event, context) => {

	let statusCode = '200';
	let origin = '*';
	const headers = {
		// 'Content-Type': 'application/json',
		"Access-Control-Allow-Origin": origin,
		// "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
		// //'Access-Control-Expose-Headers': 'Content-Type, Origin, Access-Control-Request-Method, Access-Control-Allow-Origin,Authorization',
		// 'Access-Control-Allow-Headers': 'Content-Type, Origin, Access-Control-Request-Method, Access-Control-Allow-Origin,Authorization',
		'Access-Control-Allow-Credentials': true
	};
	var output = '?';
	try {
		output = await prova();
		log('after prova');
	}catch(e) {
		log({getUserInfoCall: e});
	}
	//logbuf = logbuf.map(x=>(!x || typeof(x)=='string')?x:JSON.stringify(x,null,2));
	var body = JSON.stringify({ 
		output, 
		event, 
		context
	},null,2);

	var ret = {
		statusCode,
		body,
		headers
	};
	log('Return:', JSON.stringify(ret, null, 2));
	return ret;

};
