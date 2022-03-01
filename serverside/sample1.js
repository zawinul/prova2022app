require('cross-fetch/polyfill');
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const UserPoolId = 'us-east-1_SgNY6TTJQ';
const ClientId = '3u600gkmd1kp54tc454a0c441m';
const username = 'paolo4';
const verificationCode = '253666';


function usecase1() {
	var poolData = {
		UserPoolId,
		ClientId
	};
	var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
	
	function attributeList(set){
		var list = [];
		for(var k in set) 
			list.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:k, Value:set[k]}));
		return list;
	};
	
	var attrs = {
		email: `paolo.andrenacci+${username}@gmail.com`,
		phone_number: '+15555555555',
		family_name: 'andrenacci',
		given_name: 'paolo',
		address:'via abcd',
		'custom:role': 'megaboss'
	}
	var alist = attributeList(attrs);
	console.log(JSON.stringify(alist,null,2));
	
	userPool.signUp(username, username+'.'+username, alist, null, function(err,result) {
		if (err) {
			console.log(err.message || JSON.stringify(err));
			return;
		}
		var cognitoUser = result.user;
		console.log('user name is ' + cognitoUser.getUsername());
	});
}

function usecase2() {
	var poolData = {
		UserPoolId,
		ClientId
	};
	
	var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
	var userData = {
		Username: username,
		Pool: userPool
	};
	
	var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
	cognitoUser.confirmRegistration(verificationCode, true, function(err, result) {
		if (err) {
			console.log(err.message || JSON.stringify(err));
			return;
		}
		console.log('call result: ' + result);
	});

}
usecase1();