

exports.main = async (event, context) => {
	logevent(event);
	let headers = getOuputHeaders(event);
	return {
		statusCode: 200,
		body: "ok from default lambda integration",
		headers
	};
};

function getOuputHeaders(event) {
	let headers = {
		'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
		'Access-Control-Allow-Headers': 'Content-Type, Origin, Access-Control-Request-Method, Access-Control-Allow-Origin,Authorization',
		'Access-Control-Allow-Credentials': true,
		'Access-Control-Allow-Origin': '*'
	};
	if (event.headers && event.headers.origin) {
		headers["Access-Control-Allow-Origin"] = event.headers.origin;
		console.log('Access-Control-Allow-Origin = '+event.headers.origin);
	}
	return headers;
}


function logevent(event) {
	let clone = JSON.parse(JSON.stringify(event));
	// remove something to make it more readable
	delete clone.multiValueHeaders;
	delete clone.requestContext;
	delete clone.multiValueQueryStringParameters;
	console.log(JSON.stringify(clone,null,2));
}
