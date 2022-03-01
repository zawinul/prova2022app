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
	var json = JSON.stringify(obj, null,2);
	//console.log(json);
	outlines.push('prova')
	outlines.push('```mermaid')
	outlines.push('flowchart TD');
	await parse(obj);
	outlines.push('```');
	outlines.push('');
	var content = outlines.join('\n');
	var outpath = path.join(__dirname, 'consumer-template.md').toString();
	fs.writeFileSync( outpath, content, {encoding:'UTF8'});
	return "ok";
}

async function parse(x) {
	var res = x.Resources;
	var resnames = [];
	var restypes = {};

	var enabled = [
		'Api', 
		'Function',
		'Role', 
		// 'ManagedPolicy',
		// 'Policy',
		// 'User', 
		'Authorizer',
		'Integration',
		// 'Permission'
	];

	var sort = [
		// ['Authorizer', 'Api'],
		// ['Integration', 'Api'],
		// ['Permission', 'Api'],
		// ['Api', 'Function'],
		// ['Function', 'Role'],
		// ['Role', 'ManagedPolicy'],
		// ['User', 'Role'],
		// ['Integration', 'Function']
	];

	var used = [];

	for(var resname in res) {
		var type = res[resname].Type.trim();
		type = type.split(':');
		type=type[type.length-1];

		// if (!enabled.contains(type))
		// 	continue;

		if (!restypes[type]) 
			restypes[type] = [];
		
		restypes[type].push(resname);
		resnames.push(resname);
	} 

	for(var type of enabled) {
		outlines.push('\tsubgraph '+type);
		outlines.push('\tdirection LR');
		for(var resource of restypes[type]) {
			outlines.push('\t'+resource);
			used.push(resource);
		}
		outlines.push('\tend');
		outlines.push('');
	}

	for(var resname in res) {
		if (!used.contains(resname))
			continue;

		var j = JSON.stringify(res[resname]);
		for(target of resnames) {
			if (target == resname)
				continue;

			if (!used.contains(target))
				continue;
			
			if (j.indexOf(target)>=0)
				outlines.push('\t'+resname+' --> '+target);
		}
	}

	for(s of sort) {
		if (enabled.contains(s[0]) && enabled.contains(s[1]))
			outlines.push('\t'+s[0]+' --> '+s[1]);

	}
// 	outlines.push(
// `
// Api-->Function
// Function-->Role
// Role-->Policy
// User-->Role
// Api-->Authorizer
// Api-->Integration
// Api-->Permission
// Integration-->Function

// `		
// 	);
}
main().then(console.log, console.log);

