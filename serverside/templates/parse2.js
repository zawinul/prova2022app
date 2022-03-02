const YAML = require('yaml');
const fs =  require('fs');
const path =  require('path');

var outlines = [];

Array.prototype.contains = function(x) { return this.indexOf(x)>=0; }

async function main() {
	var fpath = path.join(__dirname, 'consumer-template.yaml');
	var y1 = fs.readFileSync(fpath, {encoding:'UTF8'});
	var obj = YAML.parse(y1, null, {
		logLevel:'error'
	});
	//console.log(json);
	outlines.push('prova')
	await parse(obj);
	var content = outlines.join('\n');
	var outpath = path.join(__dirname, 'consumer-tree.md').toString();
	fs.writeFileSync( outpath, content, {encoding:'UTF8'});
	return "ok";
}


async function parse(x) {
	var res = x.Resources;
	var resnames = [];
	var restypes = {};

	// var enabled = [
	// 	'Api', 
	// 	'Function',
	// 	'Role', 
	// 	'ManagedPolicy',
	// 	'Policy',
	// 	'User', 
	// 	'Authorizer',
	// 	'Integration',
	// 	'Permission'
	// ];

	var used = [];

	for(var resname in res) {
		var type = res[resname].Type.trim();
		type = type.split(':');
		type = type[type.length-1];

		if (!restypes[type]) 
			restypes[type] = [];
		
		restypes[type].push(resname);
		resnames.push(resname);
	} 

	for(var type in restypes) {
		outlines.push('* '+type);
		for(var resource of restypes[type]) {
			outlines.push('\t* '+resource);
			var j = JSON.stringify(res[resource]);
			for(var target in res) {
				if (j.indexOf(target)>=0)
					outlines.push('\t\t* '+target);
			}
		}
	}
}
main().then(console.log, console.log);

