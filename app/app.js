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
    SparqlClient = require('sparql-client'),
    util = require('util'),
    endpoint = 'http://dbpedia.org/sparql',
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
      ' coordinates VARCHAR(200),'+
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

// plaintext users database, for use before we set up the SQL for it, will then be deleted
var users = {};

//Initialise some test users
createUser('tj', 'foobar');
createUser('a', 'a');

//add a new user to the database SQL'ed version below
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
  console.log("twitterProfile:" + req.body.profile);
  console.log("keywords:" + req.body.keywords);
  console.log("hashTags:" + req.body.hashtags);
  console.log("count:" + req.body.count);
  console.log("date:" + req.body.date);
  console.log("distance:" + req.body.distance);
  console.log("geo:" + req.body.geo);
  var profile = req.body.profile,
      keyword = req.body.keywords,
      hashtags = req.body.hashtags,
      count = req.body.count,
      date = req.body.date,
      dist = req.body.distance,
      loc = req.body.geo,
      lan = 'en',
      search = keyword + " since:" + date + " lang:" + lan + " geocode:" + loc + "," + dist + "km",
      tweettxt = new Array(), // array that will contain the returned tweet texts
      users = new Array(), // array that will contain the returned twitter users
      tweetloc = new Array(), // array that will contain the returned tweet locations
      tweetobj = {}, // object that contains both the users and their collection of tweets
      userobj = {};

  // Object containing the players on twitter for each premier league football club
  var teams = {
    'Arsenal': ['mertesacker', 'HectorBellerin', 'aaronramsey', 'Alex_OxChambo', 'joel_campbell12', 'SergeGnabry', 'MesutOzil1088', '_OlivierGiroud_', 'JackWilshere', 'm8arteta', '19SCazorla', 'D_Ospina1', 'Alexis_Sanchez', 'CalumChambers95', 'KieranGibbs', 'theowalcott', 'gpaulista5', '6_LKOSCIELNY', '_nachomonreal', 'MatDebuchy', 'PetrCech'],
    'AVFCOfficial': ['bguzan', 'Scotty_Sinclair', 'Bakesy23', 'CharlesNzo', '22Gards', 'SanchezCarlosA', 'AndreGreen_30', 'JackGrealish1', 'JoleonLescott', 'C_Clark_6', 'JoresOkore', 'Philsend4', 'Lewis_kinsella', 'Libor_Kozak', 'JordanAmavi', 'MicahRichards', 'ARWesty15', 'MBGKA', 'allumRobbo37', ],
    'afcbournemouth': ['ShaunMac20', 'SteveCook28', 'eunan10', 'chazdaniels13', 'GM_83', 'sylvaind15tin', 'TommyElph4', 'b_cargill', 'MarcPugh7', 'AdamSmith912', 'HarryArter2', 'CornickH', 'OfficalTM_3', 'ArturBoruc', 'grabbs22'],
    'ChelseaFC': ['asmir1', 'FALCAO', 'thibautcourtois', 'cesc4official', 'Big_Blacks', 'Patrick_Bamford', 'willianborges88', 'hazardeden10', 'NathanAke', 'chalobah', 'MatejDelac', 'CesarAzpi', 'RomeluLukaku9', 'GaryJCahill', 'KurtZouma', 'rubey_lcheek', 'oscar8'],
    'CPFC': ['ConnorWickham10', 'JoelWard2', 'joe16led', 'ChrisKettings', 'wilfriedzaha', 'E_Adebayor', 'YannickBolasie', 'FraizerCampbell', 'Alex_Macca23', 'dwightgayle', 'MartinKelly1990', 'YCabayeofficiel', 'jason_punch42', 'SullayKaikai', 'WayneHennessey1', 'jamesmcarthur16'],
    'Everton': ['therealstevenpi', 'AaronLennon12', 'gerardeulofeu', 'seamiecoleman23', 'CMcAleny', 'RyanLedson97', 'JMcCarthy_16', 'joelroblesb', 'Bryan_Oviedo', 'D_gibson4', 'OfficielArounaK', 'RBarkley20', 'Osman21Leon', 'PJags06', 'TimHowardGK'],
    'LCFC': ['robert_huth', 'Jeffrey_Schlupp', 'liammoore93', 'dannysimpson', 'vardy7', 'nuge101235', 'kschmeichel1', '10_kingy', 'RealMarc12', 'Dean__Hammond', 'Mahrez22', 'okazakioffcial', 'Wes5L1nk'],
    'LFC': ['Phil_Coutinho', 'LucasLeiva87', 'JSinclair_48', 'Roberto_Firmino', 'DanielSturridge', 'sheyi_ojo', 'mamadousakho', 'lfc18alberto', 'jon_flan93', 'Nathaniel_Clyne', 'IbeJordon', 'DejanLovrenLFC6', 'bradsmith_94', 'Cameron246bran', 'SMignolet', 'J_Gomez97', 'andrewisdom47x', 'chrisbenteke', 'Tiagollori4', 'DivockOrigi', 'Jesanchez3', 'IngsDanny'],
    'MCFC': ['67Kelechi', 'wilfriedbony ', 'DeBruyneKev', 'Notamendi30', 'aguerosergiokun', 'pablo_zabaleta', 'SamNasri19', 'Sagnaofficial', 'fernandinho', 'willy_caballero', 'VincentKompany', 'Elia22Mangala', '21LVA', 'sterling7', 'YayaToure', 'JNavas', 'brunozuculini', 'Fernando_Reges'],
    'ManUtd': ['AnthonyMartial', 'adnanjanuzaj', 'ChrisSmalling', 'anto_v25', 'juanmata8', 'Lindegaard', 'PhilJones4', 'BlindDaley', 'Memphis', 'AnderHerrera', 'D_DeGea', 'WayneRooney', 'samjohnstone50', 'LukeShaw23', 'Fellaini', 'carras16', 'NPowell25', 'marcosrojo5', 'guille_varela4', 'BSchweinsteiger', 'youngy18', 'andrinhopereira', 'DarmianOffical', 'SchneiderlinMo4'],
    'NUFC': ['urnon', 'TimKrul', 'GWijnaldum', 'PaulDummett', 'the_dilsh', 'siemdejong', 'andros_townsend', 'MassadioHaidara', 'AyozePG', 'CissePapiss', 'KarlDarlow', 'YGouffran', 'Kevin_Baboo', 'AlexGilliead', 'daryljanmaat89', 'MoussaSissoko', 'ChancelMbemba', 'ManuRiv', 'Lascelles16', 'camjerome33'],
    'NorwichCityFC': ['mulumbuofficial', 'NathanRedmond22', 'martinolsson3', 'BassongOfficiel', 'ReissAwu', 'ryanbennett_22', 'MrMattJarvis', 'AdelGafaiti', 'jamardunga', 'McGrandlesConor', 'ReeceHallJ', 'Ruddy1John', 'Louis_T19', 'Harry_Toffolo', 'Gazoneil'],
    'SouthamptonFC': ['HarrisonReed', 'OriolRomeu', 'VictorWanyama', 'FraserForster', 'lloyd_isgrove', 'RonaldKoeman', 'sammcqueen123', 'Mattytargett', 'ShaneLong7', 'gasramirez10', 'JordyClasie', 'JasonMcCArthy32', 'MayaYoshida3', 'Prowsey16', 'JayRodriguez9', 'ucoMartina'],
    'stokecity': ['GeoffCameron', 'MameDiouf99', 'ryanbertrand3', 'glen_johnson', 'muniesa92', 'Charlie26Adam', 'wildog87', 'BoKrkic', 'No1shaygiven', 'Ryanshawy', 'JoseluMato9', 'JackButland_One', 'JonWalters19', 'petercrouch', 'ollishenton'],
    'SunderlandAF': ['JackRodwell', 'IAmJermainDefoe', 'stevenfletch10', 'YounsKabs4', 'jeremainlens', 'borinifabio29'],
    'SwansOfficial': ['WayneRoutledge', 'Jayfultonn', 'JordiAmat5', 'Knaughts88', 'jackcork1', 'Matt_Grimes8', 'BafGomis', 'LukaszFabianski', 'arangelz'],
    'SpursOfficial': ['pritch_93', 'tom_carroll92', 'RyanMason', 'HKane', 'ChrisEriksen8', 'Dele_Alli', 'ErikLamela', 'kylewalker2', 'NChadli', 'JanVertonghen', 'ericdier', 'mousadembele', 'Ben_Davies33', 'trippier2', 'AlderweireldTob', 'nabilbentaleb42', 'kevinwimmer27', 'Fede2Fazio', 'Vorm_Official'],
    'WBAFCofficial': ['BenFoster', 'J_OlssonViasat', 'SBerahino', 'JamesMcMC14', 'G23mcauley', 'Cris_GamboaCR'],
    'whufc_official': ['WinstonReid2', 'diegopoyet7', 'AndyTCarroll', 'Aaron_Cresswell', 'ElliotLee9', 'Reeceoxford_', 'Obiang14', 'AdriSanMiguel', 'VictorMoses', 'HendrieStephen', 'EnnerValencia14', 'dimpayet17', 'TvBecko', 'OgbonnaOffical', 'iamdiafrasakho', 'maanuulanzini10', 'mau_zeta'],
    'WatfordFC': ['hdgomes', 'AdleneGUEDIOURA', 'ValonBera', 'tommiehoban05', 'LDX2012', 'T_Deeney', 'G_byers', 'Mensah_23', 'Jurado10Marin', 'AllanNyom', 'original_kaspa', 'JorellJohnson', 'JoshDoherty96', 'IkechiAnya', 'ighalojude', 'belkalem04', 'AlmenAbdi', 'AlexJakubiak'],
  };

  // Object contain the longitude and latitude location of each teams stadium to localise tweet results
  var locations = {
    'Arsenal': ['51.555757,-0.108298'],
    'AVFCOfficial': ['52.509007,-1.884826'],
    'afcbournemouth': ['50.735238,-1.838293'],
    'ChelseaFC': ['51.481660,-0.190949'],
    'CPFC': ['51.398253,-0.085485'],
    'Everton': ['53.438764,-2.966324'],
    'LCFC': ['52.620301,-1.143208'],
    'LFC': ['53.430829,-2.960830'],
    'MCFC': ['53.483125,-2.200406'],
    'ManUtd': ['53.463037,-2.291342'],
    'NUFC': ['54.975350,-1.622575'],
    'NorwichCityFC': ['52.622042,1.309107'], 
    'SouthamptonFC': ['50.905739,-1.389905'],
    'stokecity': ['52.988264,-2.175518'],
    'SunderlandAF': ['54.914542,-1.388435'],
    'SwansOfficial': ['51.642730,-3.934489'],
    'SpursOfficial': ['51.603165,-0.065739'],
    'WBAFCofficial': ['52.509045,-1.963949'],
    'whufc_official': ['51.531950,0.039392'],
    'WatfordFC': ['51.649871,-0.401363'],
  };

  // array for unwanted words
  var unwanted = ['','RT','a','I','i','The','the','and','too','to','retweet','-','.',',',':',';','/'];
 
  // function to make sure count is at least 300, so as not return to few tweets
  function checkCount(count){
    if (count < 300 ) {
      count = 300;
    } else {
      count = count;
    }
  }

  // function to check which team is being search so as to return the players of that team on twitter
  function checkTeam(profile){
    if (teams[profile]) {
      return teams[profile]; // match the profile with the team and its players 
    } else {
      return profile; // if the profile doesn't match with a team return the profile
    }
  }

  // Function for checking a location was provided
  function checkUserLoc(loc){
    if ( loc == ''){
      if ( checkLocation(profile) != null){
        return checkLocation(profile); // If no location has been provided check it against locations 
      } else {
        return ''; // else keep loc as empty
      }
    } else {
      console.log("No location provided."); // If a location has been provided, just use that
    }
  }

  // Function to check which team is being searched so the geocode location for the teams stadium can be returned
  function checkLocation(profile){
    if (locations[profile]){
      return locations[profile]; // match the location with the team name
    } else if (locations[keyword]){
      return locations[keyword]; // if no match then match with the keyword used
    } else {
      return null; // if the profile searched isnt in locations, then return null
    }
  }

  // Function for checking the search criteria and if it matches a location of a stadium 
  function checkSearch(){
    if ( checkLocation(profile)==null){
      search = keyword + " since:" + date + " lang:" + lan;
    } else if ( loc == null) {
      search = keyword + " since:" + date + " lang:" + lan;
    } else {
      search = keyword + " since:" + date + " lang:" + lan + " geocode:" + loc + "," + dist + "km";
    }
  }

  // Function for checking if a common word is unwanted
  function chkwrd(string){
    var found = false;
    for (i = 0; i < unwanted.length && !found; i++) {
      if (unwanted[i] === string) {
        found = true;
        return true;
      }
    }
  }
 
  // Function for handling the tweets
  function handleTweets(err, data){
    if (err) {
      console.error('Get error', err);
    } else {
      if ( data.statuses[0] == undefined){
        console.log("Not enough tweets returned in the date range, please change the date.");
      } else {
        sortTweets(data); // sort the tweet data
        top = getTopwords(); // then find the most frequent words in the data
        topu = getTopusers(); // then find the most frequent users
        getUserswords();
        var str = JSON.stringify(userobj); // stringify userobj so it doesnt display object
        str = JSON.stringify(userobj, null, 4);  // Add some indentation so it is displayed in a viewable way
        res.status('Tweets').send(tweettxt);
        /*
        res.status('Frequent Words').send(top);
        res.status('Frequent Users').send(topu);
        res.status('Users Frequent Words').send(str);
        */
      }
    }
  }

  // Function for handling the friends/profiles
  function handleFriends(err, data){
    if (err) {
      console.error('Get error', err);
    }  
    else {
      sortProfile(data);
    }
  }

  // Function for creating an object of users tweets, takes the object the key and the data asociated with that key and returns an object 
  function pushToobject(obj, key, data) {
     if (!Array.isArray(obj[key])) obj[key] = [];
     return obj[key].push(data);
  }

  // Function for sorting through the tweets to return relevant information
  function sortTweets (data) {
    for (var indx in data.statuses){
      var tweet = data.statuses[indx];
      tweettxt.push(tweet.text); // push the tweet text so it can be sorted for the most frequent words
      users.push(tweet.user.screen_name); // push the twitter user screen name so it can be sorted to find the most frequent users
      pushToobject(tweetobj, tweet.user.screen_name, tweet.text); // Call the pushToobject to create an object containing each screen name and their collection of tweets
      if (tweet.geo != null){
        tweetloc.push(tweet.geo); // push the twitter geo location so that the locations can be displayed on a map, if geocode is present
      } else {
        console.log('No Tweet location available.'); // If no tweet location log it in the console. 
      }
    }
  }

  // Function for sorting through the twitter profile to return relevant information
  function sortProfile (data) {
    for (var indx in data.statuses){
      var tweet = data.statuses[indx];
      console.log('@' + tweet.user.screen_name +'\n\n');
    }
  }

  // Function for getting the frequency of each word within a string
  function getFreqword(){
    var string = tweettxt.toString(), // turn the array into a string
        changedString = string.replace(/,/g, " "), // remove the array elements 
        split = changedString.split(" "), // split the string 
        words = [];

    // Loop through each word and count its occurance
    for (var i=0; i<split.length; i++){
      if(words[split[i]]===undefined){
        words[split[i]]=1;
      } else {
        words[split[i]]++;
      }
    }
    return words;
  }

  // Function for returning the top 20 words from getFreqword()
  function getTopwords(){
    var topwords = getFreqword(), // Call the getFreqword() function
        topwords = Object.keys(topwords).map(function (k) { return { word: k, num: topwords[k] }; }), // create an object with the key, word which is the word taken from getFreqword() and the key, num which is the number of occurances of that word 
        toptwenty = [],
        twenty = 20;

    // Sort in descending order by the key num:
    topwords = topwords.sort(function (a, b){
      return b.num - a.num;
    });

    if (topwords.length <= 20){
      topwords = toptwenty; // if topwords doesn't have 20 elements then just make toptwenty equal to topwords
      return toptwenty;
    } else {
        for (var i=0; i<=twenty; i++){
          if (chkwrd(topwords[i].word) === true ) {
            twenty = twenty + 1; // if the word is a blacklisted word then don't inlcude it and add one to the index limit so twenty words are returned
          } else {
            toptwenty.push(topwords[i]); // if topwords has more than 20 elements then push the first 20 elements in topwords to the toptwenty array
          }
        }
      return toptwenty;
    }
  }

  // Function for getting the most frequent users for a search
  function getFrequsers(){
    var string = users.toString(), // turn the array into a string
        changedString = string.replace(/,/g, " "), // remove the array elements 
        split = changedString.split(" "), // split the string 
        freqUsers = []; // array for the freqent users to be pushed too

    // Loop through each word and count its occurance 
    for (var i=0; i<split.length; i++){
      if(freqUsers[split[i]]===undefined){
        freqUsers[split[i]]=1;
      } else {
        freqUsers[split[i]]++;
      }
    }
    return freqUsers;
  }

  // Function for returning the top 10 users from getFrequsers()
  function getTopusers(){
    var topusers = getFrequsers(), // call the getFrequsers() function
        topusers = Object.keys(topusers).map(function (k) { return { user: k, num: topusers[k] }; }), // create an object with the key, user which is the user taken from getFreqword() and the key, num which is the number of occurances of that word 
        topten = [];

    // Sort in descending order by the key num:
    topusers = topusers.sort(function (a, b){
      return b.num - a.num;
    });
    if ( topusers.length <= 10 ) { 
      topten = topusers; // if topwords doesn't have 10 elements then just make toptwenty equal to topusers
      return topten;
    } else {
      for (var i=0; i<=10; i++){
        topten.push(topusers[i]); // if topwords has more than 10 elements then push the first 20 elements in topusers to the topten array
      }
      return topten;
    }
  }

  // Function for returning the most frequently used words for each user
  function getUserswords(){
    for (var key in tweetobj) {
      if (tweetobj.hasOwnProperty(key)) {
        var obj = tweetobj[key],
            string = obj + "", // turn the array into a string
            changedString = string.replace(/,/g, " "), // remove the array elements 
            split = changedString.split(" "), // split the string 
            words = [];

        // Loop through each word and count its occurance
        for (var i=0; i<split.length; i++){
          if(words[split[i]]===undefined){
            words[split[i]]=1;
          } else {
            words[split[i]]++;
          }
        }
        words = Object.keys(words).map(function (k) { return { word: k, num: words[k] }; });// create an object with the key, word which is the word taken from getFreqword() and the key, num which is the number of occurances of that word 
        var toptenu = [];

        // Sort in descending order by the key num:
        words = words.sort(function (a, b){
          return b.num - a.num;
        });

        if (words.length <= 9){
          words = toptenu; // if topwords doesn't have 10 elements then just make toptwenty equal to topwords
        } else {
          for (var j=0; j<=9; j++){
            toptenu.push(words[j]); // if topwords has more than 10 elements then push the first 20 elements in topwords to the toptwenty array
          }
        }
        pushToobject(userobj, key, toptenu);
      } else {
        console.log("No tweets to check");
        continue;
      }
    }
  }

  // Function for searching through twitter using the specified data
  function getTweets(){
    client.get('search/tweets', { 
      q: search, 
      count: count, 
      from: profile 
    },
    handleTweets);
  }

  // Function for searching through twitter profiles using the specified data
  function getProfile(){
    return client.get('friends/list', { 
      screen_name: profile, 
      count: count 
    },
    handleFriends);
  }


  // Function for returning the tweets of the players returned 
  function getPlayerTweets(){
    var players = checkTeam(profile);
    count = 1; // change count to 1 so as to get only the most recent tweet
    for (var i = 0; i <= players.length; i++){
      profile = players[i]; // change the profile to the players
      keepcount = count; // store the count value
      count = 10; // Change count to 10 to get the players 10 most recent tweets
      getTweets(); // getTweets with the new variables
      count = keepcount; // change count back to its original value
    }
  }

  // Function for searching for the mentions of a profile
  function getMentions(){
    if ( profile == ''){
      console.log('No profile provided.');// user has not provided a profile to search
    } else {
      keyword = '@' + profile; // change the keyword to be the profile that the user wishes to search
      getTweets(); 
    }
  }

  try {
    loc = checkUserLoc(loc);
    checkSearch();
    checkUserLoc(loc);
    checkCount(count);  
    getTweets();
  }
  catch (err) {
    console.log('Error:' + err);
    console.log('Please try again...');
  }
});

app.post('/find', function (req, res, next) {
  console.log(req.body.hTeam);
  console.log(req.body.aTeam);
  var userInh = req.body.hTeam;
  var userIna = req.body.aTeam;
  var date = req.body.date;
  var client = new SparqlClient(endpoint);

  var queryg = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>" +
  "PREFIX p: <http://dbpedia.org/property/> "  +
  "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>" +    
  "SELECT * WHERE { " +
    "?ground p:ground  <http://dbpedia.org/resource/" + String(userInh) + ">" +
    "OPTIONAL {?ground p:abstract ?description}." +
    "OPTIONAL {?ground p:seatingCapacity ?capacity}." +
    "OPTIONAL {?ground p:image ?image}." +
  "}";

  var querym_h = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>" +
  "PREFIX p: <http://dbpedia.org/property/> "  +
  "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>" +    
  "SELECT * WHERE { " +
    "?manager p:managerClub  <http://dbpedia.org/resource/" + String(userInh) + ">" +
    "OPTIONAL {?player p:cityofbirth ?city}." +
    "OPTIONAL {?player p:dateOfBirth ?dob}." +
    "OPTIONAL {?player p:image ?image}." +
  "}";

  var querym_a = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>" +
  "PREFIX p: <http://dbpedia.org/property/> "  +
  "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>" +    
  "SELECT * WHERE { " +
    "?manager p:managerClub  <http://dbpedia.org/resource/" + String(userIna) + ">" +
    "OPTIONAL {?player p:cityofbirth ?city}." +
    "OPTIONAL {?player p:dateOfBirth ?dob}." +
    "OPTIONAL {?player p:image ?image}." +
  "}";

  var queryh_p = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>" +
  "PREFIX p: <http://dbpedia.org/property/> "  +
  "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>" +   
  "SELECT * WHERE { " +
    "?player p:currentclub  <http://dbpedia.org/resource/" + String(userInh) + ">" +
    "OPTIONAL {?player p:cityofbirth ?city}." +
    "OPTIONAL {?player p:dateOfBirth ?dob}." +
    "OPTIONAL {?player p:clubnumber ?no}." +
    "OPTIONAL {?player p:position ?position}." +
    "OPTIONAL {?player p:image ?image}." +
  "}";

  var querya_p = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>" +
  "PREFIX p: <http://dbpedia.org/property/> "  + 
  "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>" +    
  "SELECT * WHERE { " +
    "?player p:currentclub  <http://dbpedia.org/resource/" + String(userIna) + ">" +
    "OPTIONAL {?player p:cityofbirth ?city}." +
    "OPTIONAL {?player p:dateOfBirth ?dob}." +
    "OPTIONAL {?player p:clubnumber ?no}." +
    "OPTIONAL {?player p:position ?position}." +
    "OPTIONAL {?player p:image ?image}." +
  "}";

  try {
    client.query(queryh)
    .execute(function(error, results) {
    process.stdout.write(util.inspect(arguments, null, 40, true)+"\n");1
    });
    client.query(querya)
      .execute(function(error, results) {
      process.stdout.write(util.inspect(arguments, null, 40, true)+"\n");1
    });
  }
  catch (err){
    console.log('Error:' + err);
    console.log('Try again please...');
  }
})

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