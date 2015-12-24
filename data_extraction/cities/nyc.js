// Should return items of the format:
// Headline, body, tags, image, postdate.

//SPECIAL

var http = require('http'),
Promise = require('promise');

var nyc_url = "http://www1.nyc.gov/home/lscs/NewsFilterService.page?category=all&contentType=press_release,statement,executive_order,public_schedule&language=english&pageNumber={n}";
var press_releases = [];

module.exports = function() {
  return new Promise(function (resolve, reject) {
    var nextList = function(n) {
      getList(nyc_url.replace("{n}", n))
        .then(
          //On success
          function(results) {
            if (results == "done") {
              resolve(promise_array);
            } else {
              promise_array.concat(results);
              nextList(n++);          
            };
          }, 
          //On error.
          function(err) {
            reject(err);
          }
        );    
    };
    nextList(1);
  });
}
  

//TODO: iterate through page numbers with a short sleep until I recieve a 404.

var getList = function(url) {
  return new Promise(function(resolve, reject) {
    http.get(url, function(res) {
      console.log(res.statusCode);
      if (res.statusCode==404) {
        resolve('done');
      }
      var body = '';
      res.on('data', function (chunk) {
          body += chunk;
        });
      res.on('end', function() {
        body = /(.+-->)(.+)(<!-.+)/.exec(body)[2];
        var response = JSON.parse(body).results.assets,
        for (var i in response) {
          press_releases.push({
            "title": response[i].metadata['TeamSite/Metadata/Title'],
            "body":  response[i].metadata['TeamSite/Metadata/Description'],
            "date":  new Date(response[i].metadata['TeamSite/Metadata/Date']),
            "image": response[i].metadata['TeamSite/Metadata/ImagePath'],
            "url": 'http://www1.nyc.gov' + response[i].metadata['TeamSite/Metadata/URL']
          });
        };
        resolve(press_releases);
      })
    }).on('error', function(e) {
      reject(e.message);
    });    
  })

}
