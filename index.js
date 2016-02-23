var getCityWithList = require('./utils/getcitywithlist'),
clean = require('./utils/clean'),
logger = require('./utils/logger'),
dynamodb = require('./api/dynamo'),
sns = require('./api/sns'),
urlcheck = require('./utils/urlcheck');

require('http').globalAgent.maxSockets = 50;
require('https').globalAgent.maxSockets = 50;

//Build an array of functions for searching each city. Each is a promise that returns all of the press releases for that city.

var cities = [
	require('./cities/sanjose'),
	require('./cities/nyc'),
	getCityWithList('http://www.houstontx.gov/mayor/press/',
		{
			links:'ul.bullets li a',
			content:'#mainContent',
			body:'p',
			title:'.pageTitle, .span6 h1, .title, .subtitle',
			city:'Houston'
		}),
	getCityWithList('http://www.lamayor.org/press_release?page={n}',
		{
			links: '.page_excerpt h3 a',
			content:'.content_pages_show_blog_post',
			body:'#content',
			title:'#headline h2',
			city:'Los Angeles'
		}),
	require('./cities/dallas'),
	getCityWithList('http://www.cityofchicago.org/city/en/depts/mayor/press_room/press_releases.{n}.html?numPerPage=100',
		{
			links: '.pressReleaseList .content a',
			content: '#content-content',
			body: 'p',
			title: 'h1',
			city:'Chicago'
		}),
	getCityWithList('http://www.houstontx.gov/mayor/press/index2009-2015.html',
		{
			links:'ul.bullets li a',
			content:'#mainContent',
			body:'p',
			title:'.pageTitle, .span6 h1, .title, .subtitle',
			city:'Houston'
		}),

	getCityWithList("http://www.sandiego.gov/mayor/news/index.shtml", 
		{
			links: '#releases td a',
			content: '#articleContent',
			body: 'p',
			title: 'h3',
			city:'San Diego'
		}),
	getCityWithList('http://cityofphiladelphia.wordpress.com/category/press-release/mayors-press-releases/page/{n}',
		{
			links: 'h1.post-title a',
			content: '#content', 
			body: '.post-entry', 
			title: '.post-title',
			city:'Philadelphia'
		}),
	getCityWithList('http://www.sanantonio.gov/Commpa/News/TabId/317/PgrID/1970/PageID/{n}/PID/1970/evl/0/CategoryID/5/CategoryName/Mayor-Council/Default.aspx',
		{
			links:'.article .title a',
			content: '.article', 
			body: '.content', 
			title: 'h1',
			city:'San Antonio'
		}),
	require('./cities/phoenix')

];

//Dynamo post
var dynamoBatchPost = function(results) {
	logger.info("Posting resultset to Dynamo:" + results.length);
	return dynamodb(results.splice(0,24))
		.then(function() {
			if (results.length==0) {
				return;
			};
			return dynamoBatchPost(results);
		});
};

//Get city

var crawlCity = function(i) {
	logger.info("Crawling city " + i);
	return cities[i]()
		.then(function(results) {
			logger.info("Results length " + results.length);
			return results;
		})
		.then(dynamoBatchPost)
		.then(function() {
			if(i<cities.length-1) {
				return crawlCity(i+1);
			} else {
				logger.info("Done crawling all cities.");
				return sns(JSON.stringify({task:"mayorpressdb_tags"}),"arn:aws:sns:us-east-1:663987893806:mayorsdb_starttask");
			}
		}, function(err) {
			logger.info(err);
			setTimeout(function() {
				process.exit(1)
			}, 1000);
		});
};

crawlCity(0);
