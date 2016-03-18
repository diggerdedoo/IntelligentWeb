/**
 * Module dependencies.
 */
var express = require('express');
var hash = require('./pass').hash;
var bodyParser = require('body-parser');
var session = require('client-sessions');
var app = module.exports = express();
var mysql = require('mysql');
var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'team078',
	password : '0e90a044'
});

//Allows the use of the public folder, for images etc
app.use(express.static('public'));

//Sends index.html by default
app.get('/index.html', function (req, res) {
  console.log("GOT /index.html");
   res.sendFile( __dirname + "/" + "index.html" );
})

// config
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: 'shhhh, very secret'
}));

//initalises the server to 8081 and logs when this has been done
var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)

});

/*
connection.connect();
connection.query('SELECT 1 + 1 AS solution', function (err, rows, fields){
	if (err) throw err;
	console.log('The solution is: ', rows[0].solution);
});
connection.end();
*/

// dummy database
var users = {
  tj: { name: 'tj' }
};

// when you create a user, generate a salt
// and hash the password ('foobar' is the pass here)
hash('foobar', function (err, salt, hash){
  if (err) throw err;
  // store the salt & hash in the "db"
  users.tj.salt = salt;
  users.tj.hash = hash;
});


// Authenticate using our plain-object database of doom!

function authenticate(name, pass, fn) {
  if (!module.parent) console.log('authenticating %s:%s', name, pass);
  var user = users[name];
  // query the db for the given username
  if (!user) return fn(new Error('cannot find user'));
  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  hash(pass, user.salt, function(err, hash){
    if (err) return fn(err);
    if (hash == user.hash) return fn(null, user);
    fn(new Error('invalid password'));
  });
}

function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

app.get('/', function (req, res){
  console.log("GOT /")
  res.redirect('/login');
});

app.get('/restricted', restrict, function (req, res){
  res.send('Wahoo! restricted area, click to <a href="/logout">logout</a>');
});

app.get('/logout', function (req, res){
  console.log("GOT /logout")
  // destroy the user's session to log them out
  // will be re-created next request
  req.session.destroy(function(){
    res.redirect('/');
  });
});

app.get('/login', function (req, res){
  console.log("GOT /login")
  res.send("Got login")
});


app.post('/login', function (req, res){
  console.log("POST /login")
  authenticate(req.body.username, req.body.password, function(err, user){
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation
      req.session.regenerate(function(){
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        req.session.success = 'Authenticated as ' + user.name
          + ' click to <a href="/logout">logout</a>. '
          + ' You may now access <a href="/restricted">/restricted</a>.';
        res.redirect('back');
      });
    } else {
      console.log('Authentication failed, please check your '
        + ' username and password.'
        + ' (use "tj" and "foobar")');
      res.redirect('/');
    }
  });
});

app.use(function (req, res, next){
  var sess = req.session
  if (sess.views) {
    sess.views++
    res.setHeader('Content-Type', 'text/html')
    res.write('<p>views: ' + sess.views + '</p>')
    res.write('<p>expires in: ' + (sess.cookie.maxAge / 1000) + 's</p>')
    res.end()  
  } else {
    sess.views = 1
    res.end('welcome to the session demo. refresh!')
  }
});

// Session-persisted message middleware
app.use(function (req, res, next){
 var err = req.session.error;
 var msg = req.session.success;
 delete req.session.error;
 delete req.session.success;
 res.locals.message = '';
 if (err)
 res.locals.message = '<p class="msg error">'
 + err + '</p>';
 if (msg)
 res.locals.message = '<p class="msg success">'
 + msg + '</p>';
 next();
});