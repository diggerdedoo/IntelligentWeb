var SparqlClient = require('sparql-client');
var util = require('util');
var endpoint = 'http://dbpedia.org/sparql';

var userIn = "/Manchester_City_F.C.>.";

var query = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>" +
"PREFIX p: <http://dbpedia.org/property/> "  +     
"SELECT * WHERE { " +
	"?player p:currentclub  <http://dbpedia.org/resource" + userIn +
	"OPTIONAL {?player p:cityofbirth ?city}." +
	"OPTIONAL {?player p:dateOfBirth ?dob}." +
	"OPTIONAL {?player p:clubnumber ?no}." +
	"OPTIONAL {?player p:position ?position}." +
	"OPTIONAL {?player p:image ?image}." +
"}";

var querys = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>" +
"PREFIX p: <http://dbpedia.org/property/> "  +     
"SELECT * WHERE { " +
	"?manager p:currentclub  <http://dbpedia.org/resource" + userIn +
"}";

var queryss = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>" +
"PREFIX o: <http://dbpedia.org/ontology/> "  +     
"SELECT * WHERE { " +
	"?abstract o:currentclub  <http://dbpedia.org/resource" + userIn +
"}";

var queryers = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>" +
"PREFIX p: <http://dbpedia.org/property/> "  +     
"SELECT * WHERE { " +
	"?ground p:currentclub  <http://dbpedia.org/resource" + userIn +
"}";

var queryerers = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>" +
"PREFIX p: <http://dbpedia.org/property/> "  +     
"SELECT * WHERE { " +
	"?capacity p:currentclub  <http://dbpedia.org/resource" + userIn +
"}";

var client = new SparqlClient(endpoint);
client.query(query)
  .execute(function(error, results) {
  process.stdout.write(util.inspect(arguments, null, 20, true)+"\n");1
});
client.query(querys)
  .execute(function(error, results) {
  process.stdout.write(util.inspect(arguments, null, 20, true)+"\n");1
});
client.query(queryss)
  .execute(function(error, results) {
  process.stdout.write(util.inspect(arguments, null, 20, true)+"\n");1
});
client.query(queryers)
  .execute(function(error, results) {
  process.stdout.write(util.inspect(arguments, null, 20, true)+"\n");1
});
client.query(queryerers)
  .execute(function(error, results) {
  process.stdout.write(util.inspect(arguments, null, 20, true)+"\n");1
});


