process.env.ENV = 'test';

var clean = require('../../utils/clean');


describe ("Data cleaning function", function() {
	describe ("data validation", function() {
		it("should return false with null values", function() {
			var data = {
				key1:"stuff",
				key2:null
			}
			expect(clean.validate(data)).toBe(false);
		})

		it("should return false with empty values", function() {
			var data = {
				key1:"stuff",
				key2:""
			}
			expect(clean.validate(data)).toBe(false);
		})

		it("should return false with an undefined value", function() {
			var data = {
				key1:"stuff",
				key2:undefined
			}
			expect(clean.validate(data)).toBe(false);
		})

		it("should return true if all values are set", function() {
			var data = {
				key1:"stuff",
				key2:"things"
			}
			expect(clean.validate(data)).toBe(true);
		})
	})

	describe("deduping", function() {
		it("should remove duplicate urls", function() {
			var items = [
				{url:'http://www.google.com'},
				{url:'http://www.google.com'},
				{url:'http://www.wikipedia.org'}
			],
			deduped_items = [
				{url:'http://www.google.com'},
				{url:'http://www.wikipedia.org'}
			];
			expect(clean.remove_duplicate_urls(items)).toEqual(deduped_items);
		})
	})
})