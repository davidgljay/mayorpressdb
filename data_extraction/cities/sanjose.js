
var http = require('http');
var fs = require('fs');
var path = require('path');

//SPECIAL

//Pull text into body, get date, make title "Press Release". It looks like everything is inconsistent.

var file = fs.createWriteStream("file.pdf");
var request = http.get("http://www.sanjoseinfo.org/external/content/document/1914/2750294/1/What%20Works%20Cities%20Final.pdf", function(response) {
  response.pipe(file);
  response.on('end', function() {
  	console.log("File transfer done");
  	var filePath = path.join(__dirname, './file.pdf');
  	console.log(filePath);
	var extract = require('pdf-text-extract');
	extract(filePath, function (err, pages) {
	  if (err) {
	    console.dir(err)
	    return
	  }
	  console.dir(pages)
	})
  })
});