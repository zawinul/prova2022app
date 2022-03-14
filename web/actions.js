// see: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentity.html
// see: https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html

const CognitoRegion     = 'us-east-1';
const UserPoolId = 'us-east-1_SgNY6TTJQ';
const ClientId = '3u600gkmd1kp54tc454a0c441m';
const CognitoDomain = 'https://prova2022b.auth.us-east-1.amazoncognito.com';

const APIId = 'cqdefoehd6'; 
const APIRegion = 'eu-south-1';
const APIStage = 'prod';
const APIUrl = `https://${APIId}.execute-api.${APIRegion}.amazonaws.com/${APIStage}`;

var id_token, access_token, refresh_token, expires_in;
var loginCallBack = location.origin+location.pathname+'auth-callback.html';
var logoutCallBack = location.origin+location.pathname+'logout-callback.html';

var loginState,loginNonce;

var utils = {

	loginfo: function(x) {
		$('<div/>').addClass('utils.loginfo').text(x).appendTo('.info');
	},
	
	
	preinfo: function(x) {
		$('<pre/>').addClass('utils.preinfo').text(x).appendTo('.info');
	},

	createButton: function(fun, descr) {
		function onclick() {
			$('.info').empty();
			fun();
		}
		var b = $('<button/>').text(descr);
		$('.buttons').append(b);
		b.click(onclick);
	},

	parseToken: function(x) {
		if (!x.split)
			return x;
		var s = x.split('.');
		if (s.length!=3)
			return x;
		var j = atob(s[1]) ;
		return atob(s[0])+'\n'
			+JSON.stringify(JSON.parse(j),null,2)+'\n'+
			s[2];
	},
	
	parseTokenData: function(str) {
	
		if (str.indexOf('?')>=0)
			str = str.split('?')[1];
	
		if (str.indexOf('#')>=0)
			str = str.split('#')[1];
			
		var info = [];
		var pars = str.split('&');
		var obj = {};
		for(var i=0; i<pars.length; i++) {
			let x = pars[i];
			var k = x.split('=')[0];
			var v = x.split('=')[1];
			obj[k] = v;
			v = utils.parseToken(v);
			info.push(`--PARAM[${k}] = ${v}`);
		}
		id_token = obj.id_token ;
		access_token = obj.access_token ;
		refresh_token = obj.refresh_token ;
		expires_in = obj.expires_in ;
		setExpirationLimit(new Date().getTime()+expires_in*1000);

		$('.autenticato').show();

		console.log({obj});
		info = info.join('\n');
		utils.preinfo(info);
		
	}
	
	
}

var refreshTimer;
function setExpirationLimit(ts) {
	
	var remainingMs = ts-(new Date().getTime());

	console.log('expire on '+new Date(ts));
	$('.exp-bar-outer').show();
	$('.exp-bar-inner').stop(true).css('width','100%');
	var absoluteWidth = $('.exp-bar-inner').width();
	$('.exp-bar-inner').css({width: absoluteWidth});
	$('.exp-bar-inner').animate({width:0},remainingMs,'linear');

	// wake up 2 min before expiration
	var alarm = remainingMs-2*60*1000;
	if (alarm>0) {
		if (refreshTimer)
			clearTimeout(refreshTimer);
		refreshTimer = setTimeout(command_refresh, alarm);
	}
	utils.loginfo("new expiration date "+new Date(ts));
}

function onMessage(event) {
	function showImplicitFlowReturnedData(url) {
		utils.parseTokenData(url);
	}
	
	function showAuthorizationFlowReturnedData(url) {
		console.log('showAuthorizationFlowReturnedData '+url);
		var r = url.split('?')[1];
		var pars = r.split('&');
		var code = null;
		for(kv of pars) {
			var k = kv.split('=')[0];
			var v = kv.split('=')[1];
			utils.loginfo(k+'='+v);
			if (k=='code')
				code=v;
		}
	
		if (!code)
			return;
	
		var endpoint = `${CognitoDomain}/oauth2/token`;
	

		var data = {
			grant_type:'authorization_code',
			client_id: ClientId,
			code,
			redirect_uri: loginCallBack
		};
		$.ajax({
			method:'post',
			url:endpoint,
			data
		}).then(function(data){
			for (var k in data) 
				utils.preinfo(`PARAM[${k}]: ${utils.parseToken(data[k])}`);
			
			id_token = data.id_token ;
			access_token = data.access_token ;
			refresh_token = data.refresh_token ;
			expires_in = data.expires_in ;
			setExpirationLimit(new Date().getTime()+expires_in*1000);
			$('.autenticato').show();
		}, function(error){
			utils.loginfo(error);
		});
	}

	function onAuthCallback(url) {
		console.log('onAuthCallback '+url);
		if (url.indexOf('id_token=')>=0)
			showImplicitFlowReturnedData(url)
		else if (url.indexOf('code=')>=0)
			showAuthorizationFlowReturnedData(url)
	}

	function onLogoutCallback() {
		utils.loginfo("logged out!");
		if (refreshTimer)
			clearTimeout(refreshTimer);
		$('.autenticato').hide();
		$('.exp-bar-inner').stop(true);
		$('.exp-bar-outer').hide();
	

	}

	var ev = JSON.parse(event.data);
	if (ev.type=="authCallback") 
		onAuthCallback(ev.href); 
	else if (ev.type=="logoutCallback") 
		onLogoutCallback(); 
	else
		console.log({ev});
}

function loginFlow(type) {
	///var scope = 'email+openid+phone+profile'
	loginState = ""+Math.random();
	loginNonce = ""+Math.random();
	//var scope = 'aws.cognito.signin.user.admin+email+phone+profile';
	var scope = 'aws.cognito.signin.user.admin+email+openid+phone+profile';
	var url = `${CognitoDomain}/oauth2/authorize?client_id=${ClientId}&response_type=${type}&scope=${scope}&redirect_uri=${encodeURIComponent(loginCallBack)}&state=${loginState}&noce=${loginNonce}`;
	utils.loginfo(url);
	console.log({url});
	var a = $('<a>jump</a>').attr('href',url).attr('target','_blank').appendTo('.info');
	window.open(url);

}


function command_loginImplicitFlow() {
	loginFlow('token');
}

function command_loginAuthorizationCodeFlow() {
	loginFlow('code');
}

function command_refresh(){
	if (refreshTimer)
		clearTimeout(refreshTimer);

	if (!refresh_token) {
		alert('non ho il refresh_token');
		return;
	}
	var data = {
		grant_type:'refresh_token',
		client_id: ClientId,
		refresh_token,
		//code,
		//redirect_uri: loginCallBack
	};
	var endpoint = `${CognitoDomain}/oauth2/token`;

	$.ajax({
		method:'post',
		url:endpoint,
		data
	}).then(function(data){
		access_token = data.acces_token;
		expires_in = data.expires_in ;
		setExpirationLimit(new Date().getTime()+expires_in*1000);
	}, function(error){
		utils.loginfo(error);
	});
}

function command_openIdConfiguration() {
	var url=`https://cognito-idp.${CognitoRegion}.amazonaws.com/${UserPoolId}/.well-known/openid-configuration`;
	utils.loginfo(url);
	$.get(url).then(
		function(value) {
			utils.preinfo(JSON.stringify(value,null,2));
		},
		function (error) {
			console.log({error});
		});
}

function command_openIdKey() {
	var url=`https://cognito-idp.${CognitoRegion}.amazonaws.com/${UserPoolId}/.well-known/jwks.json`;
	utils.loginfo(url);
	$.get(url).then(
		function(value) {
			utils.preinfo(JSON.stringify(value,null,2));
		},
		function (error) {
			console.log({error});
		});
}

function command_userInfo() {
	var url = `${CognitoDomain}/userInfo`;
	$.ajax({
		url,
		method:'GET',
		dataType: "jsonp",
		headers: {
			Authorization: 'Bearer '+access_token
		}
	}).then(
		function(data) {
			preinfo(JSON.stringify(data,null,2));
		}, 
		function(error){
			preinfo(JSON.stringify(error,null,2));
		}
	);	
}



function command_callFreeLambda() {
	var url = `${APIUrl}/freeProva2022Lambda?f=${Math.random()}`;
	utils.loginfo(url);
	var conf = {
		url,
		method: 'get',
		dataType:'json',
		headers: {
		}
	};
	if (access_token)
		conf.headers.Authorization = access_token;

	utils.preinfo(JSON.stringify(conf,null,2));
	$.ajax(conf).then(function(data){
		utils.preinfo(JSON.stringify(data,null,2));
		console.log({data});
	}, function(error){
		utils.preinfo(JSON.stringify(error,null,2));
		console.log({error});
	});
}

function command_callLambda() {
	var url = `${APIUrl}/prova2022lambda?f=${Math.random()}`;
	utils.loginfo(url);
	var conf = {
		url,
		method: 'get',
		dataType:'json',
		headers: {},
		xhrFields: {
		 	withCredentials: true
		}
	};

	if (access_token)
	 	conf.headers.Authorization = access_token;

	utils.preinfo(JSON.stringify(conf,null,2));
	$.ajax(conf).then(function(data){
		utils.preinfo(JSON.stringify(data,null,2));
		console.log({data});
	}, function(error){
		utils.preinfo(JSON.stringify(error,null,2));
		console.log({ajaxError:error});
	});
}

function command_logout() {
	var url = `${CognitoDomain}/logout?client_id=${ClientId}&logout_uri=${encodeURIComponent(logoutCallBack)}`;
	utils.loginfo(url);
	window.open(url);
}


function command_showCurlCommand() {
	var cmd = `curl -i --raw -k -H "Authorization: ${access_token}" ${APIUrl}/prova2022lambda`;
	utils.loginfo(cmd);
}

function init(){
	utils.createButton(command_loginImplicitFlow, 'login implicit flow');
	utils.createButton(command_loginAuthorizationCodeFlow, 'login auth code flow');
	utils.createButton(command_logout, 'logout');
	utils.createButton(command_refresh, 'refresh');
	utils.createButton(command_userInfo, 'user info');
	utils.createButton(command_openIdConfiguration, 'openID config');
	utils.createButton(command_openIdKey, 'openID key');

	utils.createButton(command_callLambda, 'call Lambda');
	utils.createButton(command_callFreeLambda, 'call free Lambda');
	utils.createButton(command_showCurlCommand, 'curl command');
	utils.createButton(command_logout, 'logout');

	window.addEventListener("message", onMessage, false);
};

$(init);


 