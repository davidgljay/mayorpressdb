var getCityWithList = require('./utils/getcitywithlist');

//Build an array of functions for searching each city. Each is a promise that returns all of the press releases for that city.

//TODO: Come up with testing strategy.
//Set max of n (page number) to be 2. Comment out all but one city at a time.
//Writing automated frameworks will require faking return from these cities with knock, more trouble than its worth at this point.
//confirm that I get one good page of results from each city.
//Also, set up a testdb.
var cityArray = {
	"New York":require('./cities/nyc'),
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
						'http://cityofphiladelphia.wordpress.com/category/press-release/mayors-press-releases/page/{n}',
						{
							links: 'h1.post-title a',
							content: '#content', 
							body: '.post-entry', 
							title: '.post-title'
						}),
	"Phoenix":require('./cities/phoenix'),
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
	"Dallas":getCityWithList(
				'http://www.dallascitynews.net/press-room-archive',
				{
					links: '.gdw_story_title a',
					content: '#gb_ab_main_tab',
					body: '#gb_ab_main_body',
					title: '.govd_header'

				}),
	//This requires PDF extraction, ie a world of hurt.
	"San Jose":require('./cities/sanjose')
};

for (city in cityArray) {
	cityArray[city]().then(
		//On Success
		function(results) {
			var dynamo_promise = dynamodb(results.splice(0,24));
			while (results.length > 0) {
				dynamo_promise.then(function() {
					return dynamodb(results.splice(0,24));
				});
			}
			dynamo_promise.then(function() {
				console.log("Done fetching " + city + "!");
			})
		},
		//On Error
		function(err) {
			console.log("Error fetching " + city + ": " + err);
		})
};