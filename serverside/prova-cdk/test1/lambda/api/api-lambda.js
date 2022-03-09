
exports.main = async (event, context) => {

	console.log({ inputEvent:event });
	var origin = '*';
	if (event.headers && event.headers.origin)
		origin = event.headers.origin;

	console.log('origin=' + origin);
	let statusCode = '200';
	const headers = {
		"Access-Control-Allow-Origin": origin,
		'Access-Control-Allow-Credentials': true
	};

	console.log('VERSIONE 0.7');

	var ret = {
		statusCode,
		body: JSON.stringify({event,context},null,2),
		headers
	};
	return ret;

};
