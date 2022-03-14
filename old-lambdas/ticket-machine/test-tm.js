const lambda = require('./index.js');
const event = {
	"function": "getRoleCredentials",
	"access_token": "eyJraWQiOiJmV25mNTc3NXp6MGtmeHBna1lDekJQUWNieTcrZ3dPS0NDbkt6emg0MnNFPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI5MDgyNGJhZS01NjIyLTRiODktOWRhNi1lMGVhMDI3NTViOGIiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9TZ05ZNlRUSlEiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIzdTYwMGdrbWQxa3A1NHRjNDU0YTBjNDQxbSIsIm9yaWdpbl9qdGkiOiJkYzljMDkyNy1jMjk3LTQ1NWItOWQzMC1lZTA4YTlkMjY4ZmYiLCJldmVudF9pZCI6IjRhOWQ4ZmViLWMzZWItNDQ4NS04YWY3LTgzMzMwYTc3OTg4MSIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4gcGhvbmUgb3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhdXRoX3RpbWUiOjE2NDU2MzU1MzQsImV4cCI6MTY0NTYzOTEzNCwiaWF0IjoxNjQ1NjM1NTM0LCJqdGkiOiIzODA2NjI4OS01YWI5LTQ3NGYtYWEzYi1iYmJlYTc4MzJkYTgiLCJ1c2VybmFtZSI6InBhb2xvMyJ9.mp_bNtAPhGwe6vTrJovfmc9z-qmgzTri-jLjl2v1-R4dEqYn24HUESYBGwFo7Jt3a6RZmhYToKk7KHzEQNQKGi-J7SF6P0o9oadF7l4_aUG-vVicnOcEacwAG9gCBEQi0WMovd913JvdEoNI_3y1EET4naiWGZ8f7-se8b6E_CBYKUn6A-dhCLuvaMCYwdgTBO2F_sOnG0JqC6P7Ieq671b5oAn1kCgDez1raenbtxuIW5c7zKuLsmVaAuvj-w5rhi6aY_ar6Xj_31qFj1npyV-FD41nHUVskGH6Z8TzfnO9HcY-UprhwJMDlvnOl4PCJalxhVV9DWtpNugEYkDjlg"
};

async function main() {
	var context = {};
	try {
		var ret = await lambda.handler(event, context);
		console.log(JSON.stringify({ RISULTATO: ret }, null, 2));
	} catch (e) {
		console.log(JSON.stringify({ ERRORE: e }, null, 2));
	}
}

main().then(console.log, console.log);