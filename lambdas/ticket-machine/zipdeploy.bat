
del ticket-machine-lambda.zip
mkdir temp
copy *.js temp
copy *.json temp
pushd temp
call npm install --only=production
popd
"C:\Program Files\7-Zip\7z.exe" a ticket-machine-lambda.zip .\temp\*
rmdir .\temp /s /q
timeout 2
aws lambda update-function-code --region eu-south-1 --function-name ticket-machine --zip-file fileb://ticket-machine-lambda.zip