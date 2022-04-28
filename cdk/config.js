module.exports = {
	includeVPC: false,
	includeEc2: false,
	includeStaticWeb:false,
	env: {
		account: '071979381930',
		region:'eu-south-1'	
	},
	az: [
		'eu-south-1a',
		'eu-south-1b',
		'eu-south-1c'
	],
	namePrefix: 'TDEV11', 
	tenants: [
		'personale', 'amministrazione', 'delivery'
	]
}