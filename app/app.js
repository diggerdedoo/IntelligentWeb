/**
 * Module dependencies.
 */
var express = require('express'),
    hash = require('./pass').hash,
    bodyParser = require('body-parser'),
    favicon = require('serve-favicon'),
    session = require('client-sessions'),
    router = express.Router(),
    cookieParser = require('cookie-parser'),
    app = module.exports = express(),
    Twit = require('twit'),
    client = new Twit({
      consumer_key: 'aGvgbxGtSKTWdcxGf3paz90Kq',
      consumer_secret: 'PJwjJPJFUuWuEvzyj3G2fxbfy7yvFb00mRd45rRrKtJ4Ea39rj',
      access_token: '221331440-s4Bgw21Z9xhlGe8QuGphtKjx0ZXg4h3sEYNUERff',
      access_token_secret: 'LlQCF7QCj5UOlli8LSU4BhAnF9ouiJliSZ7bFeOqm36p9',
      timeout_ms: 60*1000,
    }),
    mysql = require('mysql'),
    connection = mysql.createConnection({
      host     : 'stusql.dcs.shef.ac.uk',
      user     : 'team078',
      password : '0e90a044',
      database : 'team078',
      port     : 3306,
    });

//Load the cookie-parsing middleware
app.use(cookieParser());

//Allows the use of the public folder, for images etc
app.use(express.static(__dirname + 'public'));
app.use("/stylesheets",  express.static(__dirname + '/public/stylesheets'));
app.use("/images",  express.static(__dirname + '/public/images'));
app.use("/javascripts",  express.static(__dirname + '/public/javascripts'));

// middleware
app.use(bodyParser.urlencoded({ extended: false }));
// cookie 
app.use(session({
  cookieName: 'session',
  secret: 'shhhh, very secret',
  duration: 30 * 60 * 1000,
  activeDuration: 10 * 60 * 1000,
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  httpOnly: true,
  secure: true,
  ephemeral: true
}));

// Session-persisted message middleware
app.use(function(req, res, next){
  var err = req.session.error;
  var msg = req.session.success;
  delete req.session.error;
  delete req.session.success;
  res.locals.message = '';
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';
  next();
});

app.use(function (req, res, next) {
  if (req.session && req.session.user) {

    user = req.session.user
    if (user) {
      req.user = user;
      delete req.user.password; // delete the password from the session
      req.session.user = user;  //refresh the session value
      res.locals.user = user;
    }
      // finishing processing the middleware and run the route
    next();
  } else {
    next();
  }
});

//initalises the server to 8081 and logs when this has been done
var server = app.listen(8081, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Listening at http://localhost:%s", port);
});


//Uncomment the below function if you want to reset the data or something
//dropTables();

//Drops all the tables
function dropTables(){
  connection.query('DROP TABLE tweets', function (err, res){
    if(err) {
      console.log(err);
    } else {
      console.log("Table tweets Dropped");
    }
  });
  connection.query('DROP TABLE users', function (err, res){
    if(err) {
      console.log(err);
    } else {
      console.log("Table users Dropped");
    }
  });
  connection.query('DROP TABLE querys', function (err, res){
    if(err) {
      console.log(err);
    } else {
      console.log("Table querys Dropped");
    }
  });
}

//Check if the sql table 'users' exists, if not, create it.
connection.query('SELECT 1 FROM users LIMIT 1', function (err, res){
  //Query will throw error if the table doesn't exist
  if(err) {
    //Create the table
    connection.query('CREATE TABLE users ('+
      ' id int NOT NULL AUTO_INCREMENT,'+
      ' name VARCHAR(30) NOT NULL,'+
      ' salt VARCHAR(1000),'+
      ' hash VARCHAR(1000),'+
      ' PRIMARY KEY(id))', function (err, res){
      if(err) {
        console.log(err);
      } else {
        console.log("Table users Created");
        //Initialise intial database values
        createUserSQL('tj', 'foobar');
        createUserSQL('a', 'a');
      }
    });
  //else do nothing
  } else {
    console.log('Table users already exists');
  }
});

//Check if the sql table 'tweets' exists, if not, create it.
connection.query('SELECT 1 FROM tweets LIMIT 1', function (err, res){
  //Query will throw error if the table doesn't exist, so then create it
  if(err) {
    connection.query('CREATE TABLE tweets ('+
      'id int NOT NULL,'+
      ' userName VARCHAR(20),'+
      ' userHandle VARCHAR(15),'+
      ' userProfilePicture VARCHAR(200),'+
      ' retweetedBy VARCHAR(15),'+
      ' createdAt DATETIME,'+
      ' tweetText VARCHAR(140),'+
      ' hashtags VARCHAR(210),'+
      ' userMentions VARCHAR(210),'+
      ' geoCoords VARCHAR(200),'+
      ' PRIMARY KEY(id))', function (err, res){
      if(err) {
          console.log(err);
      } else {
          console.log("Table tweets Created");
      }
    });
  //else do nothing
  } else {
    console.log('Table tweets already exists.');
  }
});

//Check if the sql table 'querys' exists, if not, create it.
connection.query('SELECT 1 FROM querys LIMIT 1', function (err, res){
  //Query will throw error if the table doesn't exist, so then create it
  if(err) {
    connection.query('CREATE TABLE querys ('+
      ' id int NOT NULL,'+
      ' users VARCHAR(200),'+
      ' usersMentions VARCHAR(200),'+
      ' hashtags VARCHAR(200),'+
      ' keywords VARCHAR(200),'+
      ' createdAt DATETIME,'+
      ' lang VARCHAR(10),'+
      ' PRIMARY KEY(id))', function (err, res){
      if(err) {
          console.log(err);
      } else {
          console.log("Table querys Created");
      }
    });
  //else do nothing
  } else {
    console.log('Table querys already exists.');
  }
});



// plaintext users database
var users = {};

//Initialise some test users
createUser('tj', 'foobar');
createUser('a', 'a');

//add a new user to the database *TO BE SQL'ED*
function createUser(name, pass){
  //intialise the user
  users[name] = {};
  users[name].name = name;
  // when you create a user, generate a salt
  // and hash the password
  hash(pass, function (err, salt, hash){
    if (err) throw err;
    // store the salt & hash in the plain text db *SQL NEEDED*
    users[name].salt = salt;
    users[name].hash = hash;
  });
};

//Create a new user, push it onto the sql server
function createUserSQL(name, pass){
  //Check if the username has already been taken
  connection.query('SELECT 1 FROM users WHERE name = ? LIMIT 1;', name, function (err, result){
    if (err) {
      console.log(err);
    } else if (result.length == 1){
      //User already exists, do nothing
      console.log("User '%s' already exists!", name);
    } else {
      // User doesn't exist, create it
      // when you create a user, generate a salt
      // and hash the password
      hash(pass, function (err, salt, hash){
        if (err) throw err;
        // insert the user data into the sql server 
        data = {name: name, salt: salt, hash: hash};
        connection.query('INSERT INTO users SET ?', data, function (err, res){
          if(err) {
            console.log(err);
          } else {
            console.log("User '%s' Created", name);
          }
        });
      });  
    }
  });
}; 


//TEST QUERY FUNCTION
/*
connection.query('SELECT * FROM users', function (err, rows){
  if(err) {
    console.log(err);
  } else {
    console.log(rows);
  }
});
*/

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
  if (!module.parent) console.log('app.js Authenticating %s:%s', name, pass);
  var user = users[name];
  // query the db for the given username
  if (!user) return fn(new Error('cannot find user'));
  // apply the same algorithm to the POSTed password, applying
  // the hash against the pass / salt, if there is a match we
  // found the user
  hash(pass, user.salt, function (err, hash){
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
    res.redirect('/');
  }
}

/*
* redirects
*/
app.get('/', function (req, res, next){
  res.sendFile(__dirname+'/public/index.html');
});

app.get('/index', function (req, res, next){
  res.sendFile(__dirname+'/public/index.html');
});

app.get('/index.html', function (req, res, next){
  res.redirect('/index');
});

app.get('/home', function (req, res, next){
  res.sendFile(__dirname+'/public/index.html');
});

app.get('/login', restrict, function (req, res, next) {
  res.redirect('/queryInterface.html');
});

app.get('/logout', function (req, res, next) {
  req.session.reset();
  res.redirect('/');
});

app.get('/queryInterface', restrict, function (req, res, next) {
  res.sendFile(__dirname+'/public/queryInterface.html');
});

app.get('/queryInterface.html', restrict, function (req, res, next) {
  res.redirect('/queryInterface');
});

app.post('/queryinterface', restrict, function (req, res, next) {
  console.log("You posted the form I dunno what next");
});

app.get('/register', function (req, res, next) {
  res.sendFile(__dirname+'/public/register.html');
});

app.get('/register.html', function (req, res, next) {
  res.redirect('/register');
});

// create a new user when asked
app.post('/register', function (req, res, next) {
  //check the password matches the confirmation
  if (req.body.password == req.body.passwordconfirmation) {
    createUser(req.body.username, req.body.password);
    res.redirect('/');
  } else {
    //ALERT DO IT AGAIN
    res.redirect('/register');
  }
});

// login procedure on index.html
app.post('/login', function (req, res, next){
  authenticate(req.body.username, req.body.password, function (err, user){
    //delete the password as soon as we're done with it
    req.body.password.delete;
    if (user) {
      // Regenerate session when signing in
      // to prevent fixation
      req.session.user = user;
      res.redirect('/queryInterface');
      next();
    } else {
      console.log('Authentication failed, please check your '
        + ' username and password.'
        + ' (use "tj" and "foobar")');
      res.redirect('/');
      next();
    }
  });
});

// The 404 Route
// This should be last
app.get('*', function (req, res){
  res.statuscode = 404;
  res.sendFile(__dirname+'/public/404.html');
});