
const APIId = '1hpeasznpa';
const APIRegion = 'eu-south-1';
const APIStage = 'prod';
const APIUrl = `https://${APIId}.execute-api.${APIRegion}.amazonaws.com/${APIStage}`;

let logged=false;
let curAuthenticator;
let curUser;
let sessionId;
const loginMode = 'frame';

var loginCallBack = location.origin + location.pathname + 'auth-callback.html';


var utils = {

	loginfo: function (x) {
		$('<div/>').addClass('utils.loginfo').text(x).appendTo('.info');
	},


	preinfo: function (x) {
		$('<pre/>').addClass('utils.preinfo').text(x).appendTo('.info');
	},

	createButton: function (fun, class_, descr) {
		function onclick() {
			$('.info').empty();
			fun();
		}
		var b = $('<button/>').addClass(class_).text(descr);
		$('.buttons').append(b);
		b.click(onclick);
		return b;
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

async function onAuthCallback(sid, user, expire) {
	sessionId = sid;
	console.log('onAuthCallback ');
	$('body').attr('logged','yes');
	curUser = user;
	utils.loginfo('sid='+sid);
	utils.preinfo(JSON.stringify(curUser,null,2));
}

function onMessage(event) {


	// function onLogoutCallback() {
	// 	utils.loginfo("logged out!");
	// 	if (refreshTimer)
	// 		clearTimeout(refreshTimer);
	// 	$('.exp-bar-inner').stop(true);
	// 	$('body').attr('logged','no');
	// }

	//utils.preinfo(event);
	var evdata = JSON.parse(event.data);
	utils.preinfo(JSON.stringify({evdata}));

	if (evdata.type == "authCallback") {
		onAuthCallback(evdata.sid, evdata.user, evdata.expire);
	}
}



function command_refresh() {
}



function command_callFreeLambda() {
	// var url = `${APIUrl}/freeProva2022Lambda?f=${Math.random()}`;
	// utils.loginfo(url);
	// var conf = {
	// 	url,
	// 	method: 'get',
	// 	dataType: 'json',
	// 	headers: {
	// 	}
	// };
	// if (access_token)
	// 	conf.headers.Authorization = access_token;

	// utils.preinfo(JSON.stringify(conf, null, 2));
	// $.ajax(conf).then(function (data) {
	// 	utils.preinfo(JSON.stringify(data, null, 2));
	// 	console.log({ data });
	// }, function (error) {
	// 	utils.preinfo(JSON.stringify(error, null, 2));
	// 	console.log({ error });
	// });
}

function command_callLambda() {
	// var url = `${APIUrl}/prova2022lambda?f=${Math.random()}`;
	// utils.loginfo(url);
	// var conf = {
	// 	url,
	// 	method: 'get',
	// 	dataType: 'json',
	// 	headers: {},
	// 	xhrFields: {
	// 		withCredentials: true
	// 	},
	// 	data:{x:3,y:'abc',action:'test-s3'}
	// };

	// if (curTmToken)
	// 	conf.headers.Authorization = 'Bearer access_token';

	// utils.preinfo(JSON.stringify(conf, null, 2));
	// $.ajax(conf).then(function (data) {
	// 	utils.preinfo(JSON.stringify(data, null, 2));
	// 	console.log({ data });
	// }, function (error) {
	// 	utils.preinfo(JSON.stringify(error, null, 2));
	// 	console.log({ ajaxError: error });
	// });
}

async function command_logout() {
	// var url = `${CognitoDomain}/logout?client_id=${ClientId}&logout_uri=${encodeURIComponent(logoutCallBack)}`;
	// utils.loginfo(url);
	// window.open(url);

	let logoutUrl = `${APIUrl}/logout`;
	console.log('url='+logoutUrl);
	let request = $.ajax({
		method:'get',
		url: logoutUrl,
		data: {
			sessionId,
			origin: location.origin
		}
	});
	let data = await request;
	console.log({logoutData:data});
	curUser=null;
	sessionId=null;

	$('body').attr('logged','no');

	
}

async function newLogin(provider) {
	curAuthenticator = provider;
	// get login url
	let getLoginUrl = `${APIUrl}/login-parameters`;
	console.log('url='+getLoginUrl);
	let request = $.ajax({
		method:'get',
		url: getLoginUrl,
		data: {
			provider,
			origin: location.origin
		}
	});
	let data = await request;
	console.log({data});
	let loginUrl = data.url;
	sessionId = data.id;
	utils.loginfo(loginUrl);
	if (loginMode=='frame') {
		var a = $(`<iframe id='loginIframe' src='${loginUrl}'></iframe>`).appendTo('body');
	}
	else {
		var a = $(`<a target="tmp_login">jump</a>`).attr('href',loginUrl).appendTo('body');
		a[0].click();
		setTimeout(()=>a.remove(),1);
	}
}
function init() {
	utils.createButton(() => newLogin('cognito'), 'hide-if-logged', 'login cognito');
	utils.createButton(() => newLogin('google'), 'hide-if-logged', 'login google');
	
	utils.createButton(command_callLambda, 'hide-if-not-logged', 'call Lambda');
	utils.createButton(command_callFreeLambda, 'hide-if-not-logged', 'call free Lambda');
	utils.createButton(command_logout, 'hide-if-not-logged', 'logout');

	window.addEventListener("message", onMessage, false);
};

$(init);


