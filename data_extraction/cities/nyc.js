// Should return items of the format:
// Headline, body, tags, image, postdate.

//SPECIAL

var http = require('http'),
Promise = require('promise'),
logger = require('../utils/logger');

var nyc_url = "http://www1.nyc.gov/home/lscs/NewsFilterService.page?category=all&contentType=press_release,statement,executive_order,public_schedule&language=english&pageNumber={n}";
var press_releases = [];

module.exports = function() {
  logger.info("NYC");
  return new Promise(function (resolve, reject) {
    var nextList = function(n) {
      logger.info("Getting NYC page:" + n);
      getList(nyc_url.replace("{n}", n))
        .then(
          //On success
          function(results) {
            if (results == "done") {
              resolve(press_releases);
            } else {
              press_releases.concat(results);
              nextList(n+1);          
            }
          }, 
          //On error.
          function(err) {
            reject(err);
          }
        );    
    };
    nextList(1);
  });
};
  
  //TODO: Add short sleep.

var getList = function(url) {
  return new Promise(function(resolve, reject) {
    http.get(url, function(res) {
      if (res.statusCode==404) {
        resolve('done');
      }
      var body = '';
      res.on('data', function (chunk) {
          body += chunk;
        });
      res.on('end', function() {
          body = /(.+-->)(.+)(<!-.+)/.exec(body)[2];
          var body_obj = JSON.parse(body);
          var response = body_obj.results.assets;
          if (parseInt(body_obj.pagination.currentPage)>parseInt(body_obj.pagination.numPages)) {
            resolve('done');
          }
          for (var i in response) {
            press_releases.push({
              "title": response[i].metadata['TeamSite/Metadata/Title'],
              "body":  response[i].metadata['TeamSite/Metadata/Description'],
              "date":  new Date(response[i].metadata['TeamSite/Metadata/Date']).toISOString(),
              "url": 'http://www1.nyc.gov' + response[i].metadata['TeamSite/Metadata/URL'],
              "city": "New York"
            });
          }
          resolve(press_releases);
        });
    }).on('error', function(e) {
      logger.error("Error in NYC:" + err);
      reject(e.message);
    });    
  });
};
