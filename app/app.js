/**
 * Module dependencies.
 */
var express = require('express'),
    hash = require('./pass').hash,
    bodyParser = require('body-parser'),
// session = require('client-sessions'),
    session = require('express-sessions'),
    app = module.exports = express(),
    mysql = require('mysql'),
    connection = mysql.createConnection({
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
  cookieName: 'session',
  secret: 'shhhh, very secret',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  httpOnly: true,
  secure: true,
  ephemeral: true
}));

//initalises the server to 8081 and logs when this has been done
var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)

});

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

// check if user is logged in, if not redirect them to the index
function requireLogin (req, res, next) {
  if (!req.user) {
    res.redirect('/');
  } else {
    next();
  }
};

// Authenticate using our plain-object database
function authenticate(name, pass, fn) {
  if (!module.parent) console.log('Authenticating %s:%s', name, pass);
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

// restirict user access if they are not signed in
function restrict(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
}

/*
* redirects
*/

app.get('/', function (req, res){
  res.redirect('/');
});

app.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/');
});

app.get('/login', requireLogin, function(req, res) {
  res.render('/queryInterface.html');
});

app.get('/queryInterface', requireLogin, function(req, res) {
  res.render('/queryInterface.html');
});

app.get('/queryInterface.html', requireLogin, function(req, res) {
  res.render('/queryInterface.html');
});

//The 404 Route 
app.get('*', function(req, res){
  res.send('what???', 404);
  res.redirect('/404.html');
});

app.post('/login', function (req, res){
  console.log("POST /login")
  authenticate(req.body.username, req.body.password, function(err, user){
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation
      req.sessions.regenerate(function(){
        // Store the user's primary key
        // in the session store to be retrieved,
        // or in this case the entire user object
        req.session.user = user;
        /*req.session.success = 'Authenticated as ' + user.name
          + ' click to <a href="/logout">logout</a>. '
          + ' You may now access <a href="/restricted">/restricted</a>.';*/
        res.redirect('/queryInterface.html');
      });
    } else {
      console.log('Authentication failed, please check your '
        + ' username and password.'
        + ' (use "tj" and "foobar")');
      res.redirect('/');
    }
  });
});

/*
app.use(function(req, res, next) {
  if (req.session && req.session.user) {
    User.findOne({ users: req.session.user }, function(err, user) {
      if (user) {
        req.user = user;
        delete req.user.password; // delete the password from the session
        req.session.user = user;  //refresh the session value
        res.locals.user = user;
      }
      // finishing processing the middleware and run the route
      next();
    });
  } else {
    next();
  }
});*/

/* unsure if needed?
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

app.post('/login', function(req, res) {
  User.findOne({ users: req.body.user }, function(err, user) {
    if (!user) {
      res.render('login.jade', { error: 'Invalid email or password.' });
    } else {
      if (req.body.password === user.password) {
        // sets a cookie with the user's info
        req.session.user = user;
        res.redirect('/queryInterface.html');
      } else {
        res.render('login.jade', { error: 'Invalid email or password.' });
      }
    }
  });
});
*/