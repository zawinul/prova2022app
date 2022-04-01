const AWS = require("aws-sdk");

async function main() {
	const s3 = new AWS.S3({	});

	let data = await s3.listBuckets().promise();
	var names = data.Buckets.map(x=>x.Name);
	let tenants = names.filter(x=>(x.indexOf('tenant-')>=0));
	for(tenant of tenants)
		await cleanTenant(tenant);
}


async function cleanTenant(tenant) {
	let d = await s3.getBucketLocation({Bucket:tenant}).promise();
	let location = d.LocationConstraint;
	console.log(location);
	const localS3 = new AWS.S3({
		region:location
	});	
	
	while(true) {
		console.log('clean '+tenant);
		try {
			let data = await localS3.listObjectsV2({Bucket:tenant}).promise();
			if (!data.Contents|| data.Contents.length==0)
				break;
			for(let obj of data.Contents) {
				console.log('    deleting '+obj.Key);
				await localS3.deleteObject({Bucket:tenant, Key:obj.Key}).promise();
			}
		}catch(e) { 
			console.log(e);
		}
	}
}
const s3 = new AWS.S3();


// function deleteObject(client, deleteParams) {
// 	client.deleteObject(deleteParams, function (err, data) {
// 		if (err) {
// 			console.log("delete err " + deleteParams.Key);
// 		} else {
// 			console.log("deleted " + deleteParams.Key);
// 		}
// 	});
// },
// listBuckets: function (client) {
// 	client.listBuckets({}, function (err, data) {
// 		var buckets = data.Buckets;
// 		var owners = data.Owner;
// 		for (var i = 0; i < buckets.length; i += 1) {
// 			var bucket = buckets[i];
// 			console.log(bucket.Name + " created on " + bucket.CreationDate);
// 		}
// 		for (var i = 0; i < owners.length; i += 1) {
// 			console.log(owners[i].ID + " " + owners[i].DisplayName);
// 		}
// 	});

// },

// deleteBucket: function (client, bucket) {
// 	client.deleteBucket({Bucket: bucket}, function (err, data) {
// 		if (err) {
// 			console.log("error deleting bucket " + err);
// 		} else {
// 			console.log("delete the bucket " + data);
// 		}
// 	});
// },
// clearBucket: function (client, bucket) {
// 	var self = this;
// 	client.listObjects({Bucket: bucket}, function (err, data) {
// 		if (err) {
// 			console.log("error listing bucket objects "+err);
// 			return;
// 		}
// 		var items = data.Contents;
// 		for (var i = 0; i < items.length; i += 1) {
// 			var deleteParams = {Bucket: bucket, Key: items[i].Key};
// 			self.deleteObject(client, deleteParams);
// 		}
// 	});
// }

main().then(console.log, console.log);