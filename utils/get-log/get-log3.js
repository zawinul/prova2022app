const groups = {
	a: { sigla:'work λ',    name: '/aws/lambda/TDEV11-api-lambda-handler'},
	b: { sigla:'cach λ',    name: '/aws/lambda/TDEV11-cache-handler'},
	c: { sigla:'tm   λ',    name: '/aws/lambda/TDEV11-ticket-machine-handler'},
	d: { sigla:'api   ',    name: 'API-Gateway-Execution-Logs_1hpeasznpa/prod'},
	
	//i: { sigla:'agent ',    name: '/aws/lambda/AgentFunction'},
}


const AWS = require('aws-sdk');
AWS.config.region = 'eu-south-1';

const cloudwatchlogs = new AWS.CloudWatchLogs();
const fs=require('fs');
const moment = require('moment');
//const dateFormat = require("dateformat");
const prompt = require('prompt');
const colors = require("colors/safe");
const dayjs = require("dayjs");

require("dayjs/locale/it");

dayjs.locale('it');

var userInput;
var mintime, maxtime;
//const MAXTIME=8640000000000000;
const MAXTIME=new Date().getTime();
var maxDate = new Date(MAXTIME);
var printbuf = [];
var toFile=false;
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



async function getUserInput() {

	var defMask = '', askMask='';
	for(var k in groups) {
		askMask+= "["+k+"] "+groups[k].name+"\n";
		defMask+=k;
	}

	prompt.message = colors.yellow("> ");
	prompt.delimiter = "";
	var schema = {
		properties: {
			minuti: {
				description: colors.yellow('quanti minuti ? '),
				required: true,
				default: '10'
			},
			output: {
				description: colors.yellow('nome file output ? '),
				required: false,
				default: 'log.txt'
			},
			mask: {
				description: colors.yellow('quali log?\n'+askMask),
				required: false,
				default: defMask
			}
		}
	};
	var inp = await prompt.get(schema);
	console.log(inp);
	return inp;
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


function setTimeLimit(input) {

	var minutiRegExp = /^(\d*)$/;
	var minutiMinutiRegExp = /^(\d*)\s*(\d*)$/;
	var timeMinutiRegExp = /^(\d*):(\d*)\s*(\d*)$/;
	var dateTimeMinutiRegExp = /^(\d*)\/(\d*)\s*(\d*):(\d*)\s*(\d*)$/;
	var x, txt = input.minuti;

	x = minutiRegExp.exec(txt); // es 23
	if (x) {
		var minuti = x[1];
		mintime = (new Date()).getTime()-minuti*60*1000;
		maxtime = MAXTIME;
		return true;
	}

	x = minutiMinutiRegExp.exec(txt); // es 33 23
	if (x) {
		var minutiFrom = x[1];
		var minutiTo = x[2];
		if (minutiFrom<minutiTo) {
			var tmp = minutiFrom;
			minutiFrom = minutiTo;
			minutiTo = tmp;
		}
		mintime = (new Date()).getTime()-minutiFrom*60*1000;
		maxtime =  (new Date()).getTime()-minutiTo*60*1000;;
		return true;
	}

	x = timeMinutiRegExp.exec(txt); // es 10:23 5
	if (x) {
		console.log({x});
		var hh = x[1]; //10
		var mm = x[2]; //23
		var minuti = x[3]; //5
		var d = new Date();
		d.setHours(hh-0);
		d.setMinutes(mm-0);
		console.log({d});
		if (d.getTime()>new Date().getTime()) 	
			d.setDate(d.getDate() - 1);
		console.log({d});

		mintime = d.getTime();
		maxtime = d.getTime()+minuti*60*1000;;
		return true;
	}

	x = dateTimeMinutiRegExp.exec(txt); // es 4/5 10:23 20
	if (x) {
		var day = x[1]; // 4
		var month = x[2]; //5
		var hh = x[3]; //10
		var mm = x[4]; //23
		var minuti = x[5]; // 20
		console.log({day,month,hh,mm,minuti});
		var d = new Date();
		d.setDate(day-0);
		d.setMonth(month-1);
		d.setHours(hh-0);
		d.setMinutes(mm-0);
		mintime = d.getTime();
		maxtime = d.getTime()+minuti*60*1000;;
		console.log({d});
		return true;
	}
	return false;
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
	var loggroups = await getLogGroups();

	userInput = await getUserInput();

	// legge i nomi reali dei loggroup verificandone l'esistenza
	var watchedLogGroups={}
	for (var k in groups) {
		var group = groups[k];
		if (userInput.mask.indexOf(k)<0) {
			console.log(group.name+" non ci interessa");
			continue;
		}
		var name = group.name.toLowerCase();
		for (var lg of loggroups) {
			if (lg.toLowerCase().indexOf(name)>=0)
			watchedLogGroups[k] = { loggroup:lg, sigla:group.sigla};
		}
	}

	console.log(JSON.stringify({watchedLogGroups}, null, 2));
	toFile = userInput.output && userInput.output.trim() != '';

	if (!setTimeLimit(userInput)) {
		console.log('formato minuti errato');
		return;
	}

	console.log({mintime, maxtime});
	console.log("Da: "+dayjs(mintime).format("dddd DD/MM HH:mm"));
	if (maxtime==MAXTIME)
		console.log(" A: no limit");
	else
		console.log(" A: "+dayjs(maxtime).format("dddd DD/MM HH:mm"));


	log('started');
	var events = [];

	async function getLogs(key) {
		var group = watchedLogGroups[key]
		log('get '+key+': '+group.loggroup);
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

	for(var key in watchedLogGroups) {
		log(' get '+watchedLogGroups[key].loggroup);
		await getLogs(key);
	}
	
	var format = "hh:mm:ss,SSS";

	events.sort((a,b)=>a.timestamp-b.timestamp);
	//log('esempio di evento: '+JSON.stringify(events[0],null,2));
	for(var ev of events) {
		var d = moment(ev.timestamp).format(format);
		print(ev.key+" "+d+"  "+ev.message.trim());
	}

	if (toFile)
		fs.writeFileSync('./output/'+userInput.output, printbuf.join('\n'), {encoding:'UTF-8' });

	log(count+' righe trovate');
}


function semplifica(obj) {
	var ret = {
		date: obj.creationalDate.S,
		id: obj.uuid.S,
		source: obj.message.M.eventSourceArn.S,
		mid: obj.message.M.messageId.S,
		body: obj.message.M.body.S,
		count: obj.message.M.attributes.M.ApproximateReceiveCount.S,
		//group: obj.message.M.attributes.M.MessageGroupId.S
		sender: obj.message.M.attributes.M.SenderId.S,
		queue: obj.originalQueueURL.S,
		queue: obj.messageGroup.S,
		recovery: obj.recovery
		
	}
	return ret;
}

main().then(function(){ console.log('done!');});