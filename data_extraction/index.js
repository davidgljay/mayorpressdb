var getCityWithList = require('./utils/getcitywithlist'),
clean = require('./utils/clean'),
logger = require('./utils/logger'),
dynamodb = require('./api/dynamo');

//Build an array of functions for searching each city. Each is a promise that returns all of the press releases for that city.

var cities = {
	"New York":require('./cities/nyc')(),
	"Los Angeles":getCityWithList(
					'http://www.lamayor.org/press_release?page={n}',
					{
						links: '.page_excerpt h3 a',
						content:'.content_pages_show_blog_post',
						body:'#content',
						title:'#headline h2'
					}),
	"Chicago":getCityWithList(
				'http://www.cityofchicago.org/city/en/depts/mayor/press_room/press_releases.{n}.html?numPerPage=100',
				{
					links: '.pressReleaseList .content a',
					content: '#content-content',
					body: 'p',
					title: 'h1'
				}),
	"Houston":getCityWithList(
				'http://www.houstontx.gov/mayor/press/',
				{
					links:'ul.bullets li a',
					content:'#mainContent',
					body:'p',
					title:'.pageTitle'
				}),
	"Philadelphia": getCityWithList(
						'http://cityofphiladelphia.wordpress.com/category/press-release/mayors-press-releases/page/1',
						{
							links: 'h1.post-title a',
							content: '#content', 
							body: '.post-entry', 
							title: '.post-title'
						}),
	"Phoenix":require('./cities/phoenix')(),
	"San Antonio":getCityWithList(
					'http://www.sanantonio.gov/Commpa/News/TabId/317/PgrID/1970/PageID/1/PID/1970/evl/0/CategoryID/5/CategoryName/Mayor-Council/Default.aspx',
					{
						links:'.article .title a',
						content: '.article', 
						body: '.content', 
						title: 'h1'
					}),
	"San Diego":getCityWithList(
				"http://www.sandiego.gov/mayor/news/index.shtml", 
				{
					links: '#releases td a',
					content: '#articleContent',
					body: 'p',
					title: 'h3'
				}),
	"Dallas":require('./cities/dallas')(),
	// //This requires PDF extraction, ie a world of hurt.
	"San Jose":require('./cities/sanjose')()
};

for (city in cities) {
	console.log("Adding to chain for: " + city);
	cities[city].then(
		//On Success
		function(results) {
			console.log("Got results");
			var dynamo_post = function(results) {
				if (results.length>0) {
					dynamodb(results.splice(0,24), city).then(
						function() {
							dynamo_post(results);
						}, function(err) {
							console.log("Error posting " + city + " to dynamoDB: " + err);
						});
				} else {
					console.log("Done fetching " + city + "!");
				};
			};
			dynamo_post(results);
		},
		//On Error
		function(err) {
			console.log("Error fetching " + city + ": " + err);
		})
};
