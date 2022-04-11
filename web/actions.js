// see: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentity.html
// see: https://docs.aws.amazon.com/cognito/latest/developerguide/authorization-endpoint.html

// const CognitoRegion = 'us-east-1';
// const UserPoolId = 'us-east-1_SgNY6TTJQ';
// const ClientId = '3u600gkmd1kp54tc454a0c441m';
// const CognitoDomain = 'https://prova2022b.auth.us-east-1.amazoncognito.com';

const APIId = 'kb2bc38pp7';
const APIRegion = 'eu-south-1';
const APIStage = 'prod';
const APIUrl = `https://${APIId}.execute-api.${APIRegion}.amazonaws.com/${APIStage}`;

let curAuthenticator;
let curTmToken;
const oidcProvider = {
	cognito: {
		base: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_SgNY6TTJQ',
		scope: 'aws.cognito.signin.user.admin email openid phone profile',
		clientId: '3u600gkmd1kp54tc454a0c441m'
	},
	google: {
		// https://console.cloud.google.com/apis/credentials?project=api-project-181501718002
		base: 'https://accounts.google.com/',
		scope: "openid email profile",
		clientId: '181501718002-t1f3557f4k5aiaa85fplvs2v43kbkgl5.apps.googleusercontent.com',
		clientSecret: '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'
	}
}

var id_token, access_token, refresh_token, expires_in;
var loginCallBack = location.origin + location.pathname + 'auth-callback.html';
var logoutCallBack = location.origin + location.pathname + 'logout-callback.html';

var loginState, loginNonce;
var authenticationPromise
let codeVerifier;

var utils = {

	loginfo: function (x) {
		$('<div/>').addClass('utils.loginfo').text(x).appendTo('.info');
	},


	preinfo: function (x) {
		$('<pre/>').addClass('utils.preinfo').text(x).appendTo('.info');
	},

	createButton: function (fun, descr) {
		function onclick() {
			$('.info').empty();
			fun();
		}
		var b = $('<button/>').text(descr);
		$('.buttons').append(b);
		b.click(onclick);
	},

	parseToken: function (x) {
		if (!x.split)
			return x;
		var s = x.split('.');
		if (s.length != 3)
			return x;
		var j = atob(s[1]);
		return atob(s[0]) + '\n'
			+ JSON.stringify(JSON.parse(j), null, 2) + '\n' +
			s[2];
	},

	parseTokenData: function (str) {

		if (str.indexOf('?') >= 0)
			str = str.split('?')[1];

		if (str.indexOf('#') >= 0)
			str = str.split('#')[1];

		var info = [];
		var pars = str.split('&');
		var obj = {};
		for (var i = 0; i < pars.length; i++) {
			let x = pars[i];
			var k = x.split('=')[0];
			var v = x.split('=')[1];
			obj[k] = v;
			v = utils.parseToken(v);
			info.push(`--PARAM[${k}] = ${v}`);
		}
		id_token = obj.id_token;
		access_token = obj.access_token;
		refresh_token = obj.refresh_token;
		expires_in = obj.expires_in;
		setExpirationLimit(new Date().getTime() + expires_in * 1000);

		$('.autenticato').show();

		console.log({ obj });
		info = info.join('\n');
		utils.preinfo(info);

	},
	generateRandomString: function (length) {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for (var i = 0; i < length; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		return text;
	},
	generateCodeChallenge: async function (codeVerifier) {
		var digest = await crypto.subtle.digest("SHA-256",
			new TextEncoder().encode(codeVerifier));

		return btoa(String.fromCharCode(...new Uint8Array(digest)))
			.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
	}



}

var refreshTimer;
function setExpirationLimit(ts) {

	var remainingMs = ts - (new Date().getTime());

	console.log('expire on ' + new Date(ts));
	$('.exp-bar-outer').show();
	$('.exp-bar-inner').stop(true).css('width', '100%');
	var absoluteWidth = $('.exp-bar-inner').width();
	$('.exp-bar-inner').css({ width: absoluteWidth });
	$('.exp-bar-inner').animate({ width: 0 }, remainingMs, 'linear');

	// wake up 2 min before expiration
	var alarm = remainingMs - 2 * 60 * 1000;
	if (alarm > 0) {
		if (refreshTimer)
			clearTimeout(refreshTimer);
		refreshTimer = setTimeout(command_refresh, alarm);
	}
	utils.loginfo("new expiration date " + new Date(ts));
}

async function onAuthCallback(href) {
	console.log('onAuthCallback ' + href);
	let request = $.ajax({
		method:'post',
		url: `${APIUrl}/prova2022lambda?f=${Math.random()}`,
		data: {
			action:'login-set-code',
			href:href,
			token: curTmToken
		}
	});
	let response = await request;
	console.log(response);
	utils.preinfo(JSON.stringify(response,null,2));
}

function onMessage(event) {


	function onLogoutCallback() {
		utils.loginfo("logged out!");
		if (refreshTimer)
			clearTimeout(refreshTimer);
		$('.autenticato').hide();
		$('.exp-bar-inner').stop(true);
		$('.exp-bar-outer').hide();
	}

	//utils.preinfo(event);
	var evdata = JSON.parse(event.data);
	utils.preinfo(JSON.stringify({evdata}));

	if (evdata.type == "authCallback") {
		onAuthCallback(evdata.href);
	}
	else if (evdata.type == "logoutCallback")
		onLogoutCallback();
}



function command_refresh() {
}



function command_callFreeLambda() {
	var url = `${APIUrl}/freeProva2022Lambda?f=${Math.random()}`;
	utils.loginfo(url);
	var conf = {
		url,
		method: 'get',
		dataType: 'json',
		headers: {
		}
	};
	if (access_token)
		conf.headers.Authorization = access_token;

	utils.preinfo(JSON.stringify(conf, null, 2));
	$.ajax(conf).then(function (data) {
		utils.preinfo(JSON.stringify(data, null, 2));
		console.log({ data });
	}, function (error) {
		utils.preinfo(JSON.stringify(error, null, 2));
		console.log({ error });
	});
}

function command_callLambda() {
	var url = `${APIUrl}/prova2022lambda?f=${Math.random()}`;
	utils.loginfo(url);
	var conf = {
		url,
		method: 'get',
		dataType: 'json',
		headers: {},
		xhrFields: {
			withCredentials: true
		},
		data:{x:3,y:'abc'}
	};

	if (access_token)
		conf.headers.Authorization = access_token;

	utils.preinfo(JSON.stringify(conf, null, 2));
	$.ajax(conf).then(function (data) {
		utils.preinfo(JSON.stringify(data, null, 2));
		console.log({ data });
	}, function (error) {
		utils.preinfo(JSON.stringify(error, null, 2));
		console.log({ ajaxError: error });
	});
}

function command_logout() {
	var url = `${CognitoDomain}/logout?client_id=${ClientId}&logout_uri=${encodeURIComponent(logoutCallBack)}`;
	utils.loginfo(url);
	window.open(url);
}

async function newLogin(provider) {
	curAuthenticator = provider;
	// get login url
	let getLoginUrl = `${APIUrl}/prova2022lambda?f=${Math.random()}`;
	console.log('url='+getLoginUrl);
	let request = $.ajax({
		method:'get',
		url: getLoginUrl,
		data: {
			action:'login-url',
			provider,
			callback:location.origin+location.pathname+'auth-callback.html'
		}
	});
	let data = await request;
	//console.log({body:data.body});
	let loginUrl = data.body.url;
	curTmToken = data.body.id;
	utils.loginfo(loginUrl);
	var a = $(`<a target="tmp_login">jump</a>`).attr('href',loginUrl).appendTo('body');
	a[0].click();
	setTimeout(()=>a.remove(),1);
}
function init() {
	utils.createButton(() => newLogin('cognito'), 'login cognito');
	utils.createButton(() => newLogin('google'), 'login google');
	utils.createButton(command_logout, 'logout');

	utils.createButton(command_callLambda, 'call Lambda');
	utils.createButton(command_callFreeLambda, 'call free Lambda');
	utils.createButton(command_logout, 'logout');

	window.addEventListener("message", onMessage, false);
};

$(init);


