var getCityWithList = require('../utils/getcitywithlist');

console.log(getCityWithList);
getCityWithList("http://www.sandiego.gov/mayor/news/index.shtml", {
	links: '#releases td a',
	content: '#articleContent',
	body: 'p',
	title: 'h3'
});