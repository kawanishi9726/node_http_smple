var Datastore = require('nedb');
var db = new Datastore({ 
    filename: 'db/sample.db',
    autoload: true
});

var doc = {
    name: "yanai",
    age: 20
};

function uniqueInsert(doc,unique){
	console.log(unique)
	db.find({unique:doc[unique]}, function(err, docs){
		console.log(docs)
		if(docs.length == 0){
			db.insert(doc, function(err) {
				console.log(err)
			});
		}
	});
}

uniqueInsert(doc,"name")