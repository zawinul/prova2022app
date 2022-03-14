var current = require('./cdk.out/Test2JsStack.template.json');
var old = require('./last-template.json');

current.Resources.CDKMetadata = old.Resources.CDKMetadata;
console.log(JSON.stringify(current,null,4));