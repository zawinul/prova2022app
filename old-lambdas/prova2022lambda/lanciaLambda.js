const lambda = require('./prova2022lambda.js');
async function main()  {
	var event = {};
	var context = {};
	var ret = await lambda.handler(event, context);
	console.log(JSON.stringify(ret, null, 2));
}

main().then(data=>console.log({data}), error=>console.log({error}));