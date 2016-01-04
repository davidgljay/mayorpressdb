/* 
* Takes responses from AlchemyApi and formats them in the form:
* *  {"tag":
		{
		"count":1,
		"articles":[
			{
				"title":"TITLE",
				"date:"20160101",
				"url":"http://url.url",
				"hash":"adshf98yh"
			}
		],
		"person1Name":"Mr. Mayor",
		person1Details:{}
		"person1Articles":[],
		"city#Name":"New York",
		"city#Count:1,
		"city#Articles":[],
	}
*/
var hash = require('../utils/hash');


/*
* Receives a response with entities, response, and city info. 
*Responses will include people of the form:
*
"text": "Mayor Annise Parker",
      "disambiguated": {
        "subType": [
          "Politician",
          "BoardMember"
        ],
        "name": "Annise Parker",
        "website": "http://www.houstontx.gov/mayor/index.html",
        "dbpedia": "http://dbpedia.org/resource/Annise_Parker",
        "freebase": "http://rdf.freebase.com/ns/m.0bq8gb",
        "yago": "http://yago-knowledge.org/resource/Annise_Parker"
      }
*
* And taxonomy will be of the form:

[
    {
      "label": "/travel/transports/air travel/airports",
      "score": "0.683369"
    },
    {
      "label": "/travel/transports/air travel/airlines",
      "score": "0.493831"
    },
    {
      "confident": "no",
      "label": "/religion and spirituality/christianity",
      "score": "0.259101"
    }
  ]
* Each word for which "confident" is not marked "no" should be included as a tag.
*/
module.exports = function(alchemy_response) {
	var tag_list = get_tag_list(alchemy_response.taxonomy),
	people_list = get_people_list(alchemy_response.entities),
	tags = [];
	for (var i = tag_list.length - 1; i >= 0; i--) {
		var update_expression = {
			add:[],
			set:[],
			list_append:[]
		}
		//Add core tag info
		var new_tag = {
			':tag':{S:tag_list[i]},
			':dates':{NN:[alchemy_response.article_info.date]},
			':articles':{L:[alchemy_response.article_info]},
		};
		update_expression.set.push(':tag');
		update_expression.add.push(':dates');
		update_expression.list_append.push(':articles');
		//Add city info
		var city_id = ':city' + hash(alchemy_response.city);
		new_tag[city_id + 'name'] = {S:city};
		update_expression.set.push(city_id + 'name');

		new_tag[city_id + 'articles'] = {L:[alchemy_response.article_info]};
		update_expression.list_append.push(city_id + 'articles');

		//Add people info
		for (var i = people_list.length - 1; i >= 0; i--) {
			var person_id = ':person' + hash(people_list[i].name);
			new_tag[person_id+'name'] = {S:people_list[i].name};
			update_expression.set.push(person_id + 'name');
			if (people_list[i].disambiguated) {
				new_tag[person_id+'details'] = {M:people_list[i].disambiguated};
				update_expression.set.push(person_id + 'details');
			};
			new_tag[person_id+'articles'] = {L:[alchemy_response.article_info]};
			update_expression.list_append.push(person_id + 'articles');
		};
		tags.push({
			variables:new_tag,
			update_expressionformat_update_expression(update_expression):
		});
	};
	return tags;
}


//Get list of tags from the Alchemy taxonomy response 
var get_tag_list = function(alchemy_tags) {
	var tag_list = [];
	for (var i = alchemy_tags.length - 1; i >= 0; i--) {
		var labels = alchemy_tags[i].split('/').slice(1);
		for (var j = labels.length - 1; j >= 0; j--) {
			tag_list.push(labels[j])
		};
	};
	return tag_list;
}

//Get list of people. from Alchemy entities response
var get_people_list = function(alchemy_entities) {
	var people_list = [];
	for (var i = alchemy_entities.length - 1; i >= 0; i--) {
		if (alchemy_entities[i].type=="Person") {
			var name = alchemy_entities[i].text;
			if (alchemy_entities[i].disambiguated && alchemy_entities[i].disambiguated.name) {
				name = alchemy_entities[i].disambiguated.name;
			}
			people_list.push({
				name:name,
				details:disambiguated
			})
		}
	};
	return people_list;
}

var format_update_expression = function(update_expression) {
	//Add ADD expressions
	var formatted = 'ADD';
	for (var i = update_expression.add.length - 1; i >= 0; i--) {
		formatted += ' ' + update_expression.add[i].slice(1) + ' ' + update_expression.add[i] + ',';
	};

	//Remove trailing comma.
	formatted = formatted.slice(0,-1);

	//Add SET expressions
	formatted += '\n+SET';
	for (var i = update_expression.set.length - 1; i >= 0; i--) {
		formatted += ' ' + update_expression.set[i].slice(1) + '= if_not_exists(' + 
		update_expression.set[i].slice(1) + ', ' + update_expression.set[i] + '),';
	};
	//Add list_append expressions
	for (var i = update.list_append.length - 1; i >= 0; i--) {
		formatted += ' ' + update.list_append[i].slice(1) + '=list_append(' + 
		update.list_append[i].slice(1) + ', ' + update.list_append[i] + '),';
	};

	//Remove trailing comma
	formatted = formatted.slice(0,-1);

	return formatted;
}