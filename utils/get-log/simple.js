const groups = [
	{ sigla:'[work_λ]',    name: '/aws/lambda/TDEV11-api-lambda-handler'},
	{ sigla:'[cach_λ]',    name: '/aws/lambda/TDEV11-cache-handler'},
	{ sigla:'[tm___λ]',    name: '/aws/lambda/TDEV11-ticket-machine-handler'},
	{ sigla:'[api___]',    name: 'API-Gateway-Execution-Logs_1hpeasznpa/prod'},
];	

const DEF_MINUTES=3;
let minutes=DEF_MINUTES;
const AWS = require('aws-sdk');
AWS.config.region = 'eu-south-1';

const cloudwatchlogs = new AWS.CloudWatchLogs();
const fs=require('fs');
const moment = require('moment');
var mintime, maxtime;
//const MAXTIME=8640000000000000;
const MAXTIME=new Date().getTime();
var printbuf = [];
var toFile=true;
var count = 0;

function log(x) {
	console.log(x);
}

function print(x) {
	if (toFile)
		printbuf.push(x);
	else
		console.log(x);
}


async function logEvents(logGroupName, startTime, endTime, onEvent) {
	console.log(`get log from ${logGroupName} da ${new Date(startTime)} a ${new Date(endTime)}`);
	
	var nextToken = null;
	var params = {
		logGroupName,
		startTime,
		endTime
	};
	var count = 0;

	while (true) {
		console.log('get '+count);
		count++;
		var data = await cloudwatchlogs.filterLogEvents(params).promise();
		console.log('found #'+data.events.length+' events');
		for (var ev of data.events) {
			if (ev.timestamp>=mintime && ev.timestamp<=maxtime) {
				onEvent(ev);
			}
		}
		if(!data.nextToken)
			break;
		else
			params.nextToken = data.nextToken;
	}
	console.log('fine loop');
}



async function getLogGroups() {
	var ret = [];
	var nextToken = undefined;
	while(true) {
		var loggroups = await cloudwatchlogs.describeLogGroups({nextToken}).promise();
		nextToken = loggroups.nextToken;
		for(var lg of loggroups.logGroups)
			ret.push(lg.logGroupName);
		if (!nextToken)
			break;
	}
	return ret;

}

async function main() {
	console.log(process.argv);
	if (process.argv.length>2)
		minutes=process.argv[2]-0;
	var loggroups = await getLogGroups();
	// legge i nomi reali dei loggroup verificandone l'esistenza
	var watchedLogGroups=[];
	for (var group of groups) {
		var name = group.name.toLowerCase();
		for (var lg of loggroups) {
			if (lg.toLowerCase().indexOf(name)>=0)
			watchedLogGroups.push({ loggroup:lg, sigla:group.sigla});
		}
	}

	console.log(JSON.stringify({watchedLogGroups}, null, 2));
	toFile = true;

	maxtime = new Date().getTime();
	mintime = maxtime-minutes*60*1000;
	console.log({mintime, maxtime});

	log('started');
	var events = [];

	async function getLogs(index) {
		log(' get '+watchedLogGroups[index].loggroup);
		var group = watchedLogGroups[index]
		log('get '+index+': '+group.loggroup);
		try {
			await logEvents(group.loggroup, mintime, maxtime, function(ev) {
				count++;
				ev.key = group.sigla;
				events.push(ev);
			});	
		}
		catch(e) {
			console.log(e);
			print('ERRORE: non posso leggere '+group);
		}
	}

	for(var i=0; i<watchedLogGroups.length;i++) {
		await getLogs(i);
	}
	
	var format = "hh:mm:ss,SSS";

	events.sort((a,b)=>a.timestamp-b.timestamp);
	//log('esempio di evento: '+JSON.stringify(events[0],null,2));
	for(var ev of events) {
		var d = moment(ev.timestamp).format(format);
		print(ev.key+" "+d+"  "+semplificaMsg(ev.message.trim()));
	}

	if (toFile)
		fs.writeFileSync('./output/log.txt', printbuf.join('\n'), {encoding:'UTF-8' });

	log(count+' righe trovate');
}

function semplificaMsg(msg) {
	let flat = msg.replace(/\n/g,'|');
	let res = re1.exec(flat);
	
	if (res) {
		msg = res[1].replace(/\|/g,'\n');
	}
	return msg;
}
let re1 = /[0-9\-T\:\.]{23}Z.[0-9a-f\-]{36}.INFO.(.*)/m;




main().then(function(){ console.log('done!');});