
del prova2022-lambda.zip
mkdir temp
copy *.js temp
copy *.json temp
pushd temp
call npm install --only=production
popd
"C:\Program Files\7-Zip\7z.exe" a prova2022-lambda.zip .\temp\*
rmdir .\temp /s /q
timeout 2
aws lambda update-function-code --region eu-south-1 --function-name prova2022Lambda --zip-file fileb://prova2022-lambda.zip
