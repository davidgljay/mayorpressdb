var getCityWithList = require('./utils/getcitywithlist');
//Step 1) Move through cities.
//GetWith cities are just that, otherwise we use their req file.
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
	"Houston":require('./cities/houston'),
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
	"SanDiego":getCityWithList(
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
					//TODO: Fill in Dallas links.
					links: '',
					content: '',
					body: '',
					title: ''

				}),
	//This requires PDF extraction, ie a world of hurt.
	"San Jose":require('./cities/sanjose')
};



//Step 2) Post to DynmoDB.