const https = require('https');
const crypto = require('crypto');
const querystring = require('querystring');
const jose = require('jose');
 
const tojson = x=>JSON.stringify(x,null,2);

function now() {
	return new Date().getTime();
}

function doHttpsRequest(url, options, dataToSend) {
	if (!options)
		options = {};
	if (!options.headers)
		options.headers = {};
		
	if (dataToSend) {
		if (typeof (dataToSend)!='string') {
			options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
			dataToSend = new URLSearchParams(dataToSend).toString();
		}
		options.headers['Content-Length'] = dataToSend.length;
	}
	//console.log({ doRequest: { url, options, data: dataToSend } });

	return new Promise((resolve, reject) => {
		function onRes(res) {
			res.setEncoding("utf8");
			let responseBody = "";

			res.on("data", (chunk) => {
				responseBody += chunk;
			});

			res.on("end", () => {
				//console.log({responseBody});
				resolve(responseBody);
			});
		}

		let req = url ? https.request(url, options, onRes) : https.request(options, onRes);

		req.on("error", (error) => {
			console.log({ error });
			reject(error);
		});
		if (dataToSend) {
			req.write(dataToSend);
		}
		req.end();
	});
}

function btoa(x) {
	return Buffer.from(x).toString('base64');
}

function atob(x) {
	return Buffer.from(x, 'base64').toString();
}

function generateRandomString(length) {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
}

async function generateCodeChallenge(codeVerifier) {
	const hash = crypto.createHash('sha256').update(codeVerifier).digest('base64')
	.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

	return hash;
}	
	

module.exports = {
	doHttpsRequest,
	tojson,
	atob,
	btoa,
	now,
	generateRandomString,
	generateCodeChallenge
};