var express = require('express');
var app = express();

//Allows the use of the public folder, for images etc
app.use(express.static('public'));

//Sends index.html by default
app.get('/index.htm', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})

//initalises the server to 8081 and logs when this has been done
var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)

});

