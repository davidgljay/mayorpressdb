module.exports = function(body) {

	//TODO: Add different variation of wordy date (ie "December 3rd, December third");
	var first_date_re = /(\d{1,2}\/\d{1,2}\/\d{2,4})|((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[^ ]* \d{1,2}(?:rd|st|th)*, \d{4})|(\d{4}-\d{1,2}-\d{1,2})|((\d{1,2}(?:rd|st|th)*)|first|second|third|fourth|fifth|sixth|seventh|eight|ninth|tenth|eleventh|twelvth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteeenth|nineteenth|twentieth|twenty first|twenty second|twenty third|twenty fourth|twenty fifth|twenty sixth|twenty seventh|twenty eigth|twenty ninth|thirtieth|thirty first) of (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[^ ]*, \d{4}/i
	var num_date_re = 	/([0-12]{1,2})(?:\/|\.|-)([0-31]){1,2}(?:\/|\.|-)(\d{4})/;
	var iso_date_re = /(\d{4})-([0-12]{1,2})-([0-9]{1,2})/;
	var formal_date_re = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[^ ]*\s(\d{0,2})(?:rd|st|th)*, (\d{4})/i;
	var wordy_date_re = /(first|second|third|fourth|fifth|sixth|seventh|eight|ninth|tenth|eleventh|twelvth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteeenth|nineteenth|twentieth|twenty first|twenty second|twenty third|twenty fourth|twenty fifth|twenty sixth|twenty seventh|twenty eigth|twenty ninth|thirtieth|thirty first) of (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[^ ]*, (\d{4})/i;

	var first_date_exec = first_date_re.exec(body),
	first_date='';
	var first_date_string = first_date_exec ? first_date_exec[0]:null;
	if (num_date_re.exec(first_date_string)) {
		var date_info = num_date_re.exec(first_date_string)
		first_date = new Date(date_info[3],date_info[1]-1,date_info[2]);
	} else 	if (iso_date_re.exec(first_date_string)) {
		var date_info = iso_date_re.exec(first_date_string)
		first_date = new Date(date_info[1], date_info[2]-1, date_info[3]);
	} else 	if (formal_date_re.exec(first_date_string)) {
		var date_info = formal_date_re.exec(first_date_string)
		first_date = new Date(date_info[3], months(date_info[1])-1, date_info[2]);
	} else if (wordy_date_re.exec(first_date_string)) {
		var date_info = wordy_date_re.exec(first_date_string);
		first_date = new Date(date_info[3], months(date_info[2])-1, days(date_info[1]));
	};
	return first_date;
}; 

var months = function(month) {
	var month_hash = {
		jan:1,
		feb:2,
		mar:3,
		apr:4,
		may:5,
		jun:6,
		jul:7,
		aug:8,
		sep:9,
		oct:10,
		nov:11,
		dec:12
	};
	return month_hash[month.toLowerCase()];
}

var days = function(day) {

	var days_hash = {
	"first":1,
	"second":2,
	"third":3,
	"fourth":4,
	"fifth":5,
	"sixth":6,
	"seventh":7,
	"eigth":8,
	"ninth":9,
	"tenth":10,
	"eleventh":11,
	"twelfth":12,
	"thirteenth":13,
	"fourteenth":14,
	"fifteenth":15,
	"sixteenth":16,
	"seventeenth":17,
	"eighteeenth":18,
	"nineteenth":19,
	"twentieth":20,
	"twenty first":21,
	"twenty seconds":22,
	"twenty third":23,
	"twenty fourth":24,
	"twenty fifth":25,
	"twenty sixth":26,
	"twenty seventh":27,
	"twenty eigth":28,
	"twenty ninth":29,
	"thirtieth":30,
	"thirty first":31
	}
	return days_hash[day.toLowerCase()];

};