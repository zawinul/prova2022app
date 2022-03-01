const https = require('https');

const tojson = x=>JSON.stringify(x,null,2);
function setupLogObj() {
	var l = console.log;
	console.log = function() {
		var arr = [];
		for(var i=0; i<arguments.length; i++) {
			let x = arguments[i];
			arr.push(typeof(x)=='object' ? tojson(x) : x);
		}
		l.apply(console, arr);
	};
}



function doHttpsRequest(url, options, dataToSend) {
	if (!options)
		options = {};


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
			//console.log({dataToSend});
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

module.exports = {
	setupLogObj,
	doHttpsRequest,
	tojson,
	atob,
	btoa
}