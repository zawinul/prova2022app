var utils = require('./utils');
utils.setupLogObj();

var cacheFactory = require('./cache');
var cache = cacheFactory({
	region : 'eu-south-1'
});

async function main() {
	await cache.set('pippo', {pippovalue:42});
	await cache.set('pluto', {plutovalue:42}, 1000);
	await cache.set('paperino', {paperinovalue:42}, 60000);
	console.log('pre wait');
	var t = new Promise(resolve=>setTimeout(resolve,3000));
	await t;
	console.log('post wait');
	var pippo = await cache.get('pippo');
	var pluto = await cache.get('pluto');
	var paperino = await cache.get('paperino');
	console.log({ pippo, pluto, paperino});
}

main().then(console.log, console.log);