var express = require('express');
var router = express.Router();
var fs = require('fs');
var q = require('q');
var gm = require('googlemaps');

var addr = [];
var vendorCount;
var vendors = openJson();
function gmCallback(address, name, types){
	if(address){
		addr.push({'name' : name, 'address' : address, 'types' : types});
	}else {
		addr.push('');
	}
	if(addr.length === vendorCount - 2){
		//No more addresses, we can write the file now.
		for(var j = 0; j<vendorCount; j++){
			for(var x = 0, xLen = addr.length; x<xLen; x++){
			console.log(vendors[j].Name, addr[x].name);
				if(vendors[j].Name === addr[x].name) {
					vendors[j].Address = addr[x].address;
					vendors[j].Tags = addr[x].types;
				}
			}
			if(j === vendorCount - 1){
				writeNewFile(vendors);
			}
		}
	}
}

function openJson(){
	var name = './app/Vendors-museums.json';
	var dataSync = fs.readFileSync(name, 'utf8');
	return JSON.parse(dataSync);
}

function writeNewFile(obj){
	return fs.writeFileSync('./app/complete-venders.json', JSON.stringify(obj),{encoding : 'utf8'});
}
/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.post('/get-google-info', function(req, res){
    var apiKey = req.body.apiKey;

    var vendors = openJson();
		vendorCount = vendors.length;
		// vendorCount = 1;

		var key = 'AIzaSyC48LNyOJHu-OcUF8dwuN1x9iwTRrHryP0';
		gm.config('google-client-id', key);
		for(var i = 0, length = vendors.length; i < vendorCount; i++){
			gm.textplaces('40.790261, -73.964939', 500, key, gmCallback, null, null, vendors[i].Name).then(function(data){
				if(data.results){
					//format the types for our Firebase
					var Types = {};
					for(var x = 0, typeLen = data.results[0].types.length; x < typeLen; x++){
						Types[data.results[0].types[x]] = true;
					}
					gmCallback(data.results[0].formatted_address, data.query, Types);
				}else {
					addr.push('');
				}
			}, function(err){
				console.log('Rejected ', err);
			});
		}
		res.send({
			res : 'writeNew'
		});
});

module.exports = router;
