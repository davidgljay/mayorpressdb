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
	var tag_list = get_tag_list(alchemy_response[0].taxonomy),
	people_list = get_people_list(alchemy_response[1].entities),
	tags = [];
	for (var i = tag_list.length - 1; i >= 0; i--) {
		var update_expression = {
			add:[],
			set:[],
			list_append:[]
		};
		//Add core tag info
		var new_tag = {
			':tag':{S:tag_list[i]},
			':tag_count':{N:1},
			':dates':{NN:[alchemy_response.article_info.date]},
			':articles':{L:[alchemy_response.article_info]},
		};
		update_expression.add.push(':dates');
		update_expression.add.push(':tag_count');
		update_expression.list_append.push(':articles');
		//Add city info
		var city = alchemy_response.article_info.city,
		city_id = city.replace(' ', '');
		new_tag[':city_name' + city_id ] = {S:city};
		update_expression.set.push(':city_name' + city_id);

		new_tag[':city_articles' + city_id ] = {L:[alchemy_response.article_info]};
		update_expression.list_append.push(':city_artciles' + city_id);

		//Add people info
		for (var j = people_list.length - 1; j >= 0; j--) {
			var person_id = people_list[j].name.replace(' ','');
			new_tag[':person_name' + person_id] = {S:people_list[j].name};
			update_expression.set.push(':person_name' + person_id );
			if (people_list[j].disambiguated) {
				new_tag[':person_details' + person_id] = {M:people_list[j].disambiguated};
				update_expression.set.push(':person_details' + person_id);
			}
			new_tag[':person_articles' + person_id] = {L:[alchemy_response.article_info]};
			update_expression.list_append.push(':person_articles' + person_id);
		}

		tags.push({
			values:new_tag,
			update_expression:format_update_expression(update_expression)
		});
	}
	return tags;
};


//Get list of tags from the Alchemy taxonomy response 
var get_tag_list = function(alchemy_tags) {
	var tag_list = [];
	for (var i = alchemy_tags.length - 1; i >= 0; i--) {
		if (alchemy_tags[i].confident == 'no') {
			continue;
		}
		var labels = alchemy_tags[i].label.split('/').slice(1);
		for (var j = labels.length - 1; j >= 0; j--) {
			tag_list.push(labels[j]);
		}
	}
	return tag_list;
};

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
			});
		}
	}
	return people_list;
};

var format_update_expression = function(update_expression) {
	//Add ADD expressions
	var formatted = 'ADD';
	for (var i = update_expression.add.length - 1; i >= 0; i--) {
		formatted += ' ' + update_expression.add[i].slice(1) + ' ' + update_expression.add[i] + ',';
	}

	//Remove trailing comma.
	formatted = formatted.slice(0,-1);

	//Add SET expressions
	formatted += ' SET';
	for (var j = update_expression.set.length - 1; j >= 0; j--) {
		formatted += ' ' + update_expression.set[j].slice(1) + '= if_not_exists(' + 
		update_expression.set[j].slice(1) + ', ' + update_expression.set[j] + '),';
	}
	//Add list_append expressions
	for (var k = update_expression.list_append.length - 1; k >= 0; k--) {
		formatted += ' ' + update_expression.list_append[k].slice(1) + '=list_append(' + 
		update_expression.list_append[k].slice(1) + ', ' + update_expression.list_append[k] + '),';
	}

	//Remove trailing comma
	formatted = formatted.slice(0,-1);

	return formatted;
};