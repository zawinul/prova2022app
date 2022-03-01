var jose = require('node-jose');
var utils = require('./utils.js');
var accessToken = "eyJraWQiOiJmV25mNTc3NXp6MGtmeHBna1lDekJQUWNieTcrZ3dPS0NDbkt6emg0MnNFPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI5MDgyNGJhZS01NjIyLTRiODktOWRhNi1lMGVhMDI3NTViOGIiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9TZ05ZNlRUSlEiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIzdTYwMGdrbWQxa3A1NHRjNDU0YTBjNDQxbSIsIm9yaWdpbl9qdGkiOiJmZTE0ZDgzZi01YTI0LTQ3YWMtYjYxOC00MjI5ZWM2YzYyYTciLCJldmVudF9pZCI6ImJiNTJmY2VmLWVmYjItNGJhZS04YzVjLTRiOTMyYTZiMmJmMiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4gcGhvbmUgb3BlbmlkIHByb2ZpbGUgZW1haWwiLCJhdXRoX3RpbWUiOjE2NDUyMDM1NTUsImV4cCI6MTY0NTIwNzE1NSwiaWF0IjoxNjQ1MjAzNTU2LCJqdGkiOiIwZWQzZmM0OS1mNWJiLTRlNmMtOTI1MS1hODJkMzE5NTA0ZDciLCJ1c2VybmFtZSI6InBhb2xvMyJ9.vI7S571EZBgeS5du_2c12BzK77PrIVc_006Q4Xq0EBidnCWARWWC7t6RRGQlgMD08Uy0iW2kUktS2e8ZtQGxUBtybpPPfrXl-AtB_Ei-1Hf9ZR_nYtxApDdlerIO5q8Pcg1Z4nc7VOzGeK7ne7IHEE5DsQmh9Ck3AvKoYOno76lGrbiBLg6sTqNWSj2rW8ETa9bluzDNbR4K5cMzDOnTbhVowoskSUGM3eXyCgo3_YjHRin52Fs5_jMhHGmtM2c4WIoFuwRADC2tY07kkeLKHoN17qLWg45KlHX0t_GmBYZHmew5HK12p7Ar66BTqRL56qr7RSpoSwjRBLzsZjMHRg";

utils.setupLogObj();



async function getKeyStore(issuer) {
	//https://cognito-idp.us-east-1.amazonaws.com/us-east-1_SgNY6TTJQ/.well-known/jwks.json
	try {
		if (!issuer.endsWith('/'))
			issuer += '/'
		var url = issuer+".well-known/jwks.json";
		var data = await utils.doHttpsRequest(url);
		return JSON.parse(data);
	
	} catch (err) {
		console.log({err});
		return null;
	}
}

async function main(){
	var payload = utils.getAccessTokenPayload(accessToken);
	var issuer = payload.iss;
	console.log({issuer, payload});
	var keystoredesc = await getKeyStore(issuer);

	var keystore = await jose.JWK.asKeyStore(keystoredesc);
	console.log({keystore});

	try {
		var verifier = jose.JWS.createVerify(keystore);
		var payloadAgain = await verifier.verify(accessToken);
		var userInfo = await utils.getUserInfo(issuer, accessToken);
		console.log({userinfo});
		//console.log({result});
		//return JSON.parse(result.payload.toString());
	}catch(e) {
		console.log({e});
	}
}

main().then(data=>console.log({data}), error=>console.log({error}));