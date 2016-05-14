var SparqlClient = require('sparql-client');
var util = require('util');
var endpoint = 'http://dbpedia.org/sparql';

var userInh = "Manchester_City_F.C.>.";

var query = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>" +
  "PREFIX p: <http://dbpedia.org/property/> "  +     
  "SELECT * WHERE { " +
    "?player p:currentclub  <http://dbpedia.org/resource/" + String(userInh) +
    "OPTIONAL {?player p:cityofbirth ?city}." +
    "OPTIONAL {?player p:dateOfBirth ?dob}." +
    "OPTIONAL {?player p:clubnumber ?no}." +
    "OPTIONAL {?player p:position ?position}." +
    "OPTIONAL {?player p:image ?image}." +
 "}";

var client = new SparqlClient(endpoint);
client.query(query)
  .execute(function(error, results) {
  process.stdout.write(util.inspect(arguments, null, 20, true)+"\n");1
});
