const lambda = require('./index.js');
const event = require('./test-event.json');

async function main() {
	var context = {};
	var ret = await lambda.handler(event, context);
	console.log(JSON.stringify({RISULTATO:ret},null,2)); 
}

main().then(console.log, console.log);