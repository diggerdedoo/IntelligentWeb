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
    app = module.expototalRetweets = express(),
    async = require('async'),
    SparqlClient = require('sparql-client'),
    util = require('util'),
    endpoint = 'http://dbpedia.org/sparql',
    ejs = require('ejs'),
    fs = require('fs'),
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
//app.set('/views', express.static(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


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

//Drop all the tables
function dropTables(){
  connection.query('DROP TABLE tweets', function (err, res){
    if(err) {
      console.log(err);
    } else {
      console.log("Table tweets Dropped");
    }
  });
}


//Check if the sql table 'tweets' exists, if not, create it.
connection.query('SELECT 1 FROM tweets LIMIT 1', function (err, res){
  //Query will throw error if the table doesn't exist, so then create it
  if(err) {
    connection.query('CREATE TABLE tweets ('+
      'id bigint NOT NULL,'+
      ' userName VARCHAR(20),'+
      ' userHandle VARCHAR(15),'+
      ' userProfilePicture VARCHAR(200),'+
      ' retweetedBy VARCHAR(15),'+
      ' createdAt VARCHAR(200),'+
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
  } 
});

// plaintext database for storing website user login details
var users = {};

//Initialise some test users
createUser('tj', 'foobar');
createUser('a', 'a');
createUser('David', '1234');
createUser('Ryan','abcd');

//add a new user to the database
function createUser(name, pass){
  //intialise the user
  users[name] = {};
  //put in name
  users[name].name = name;
  // when you create a user, generate a salt
  // and hash the password
  hash(pass, function (err, salt, hash){
    if (err) throw err;
    // store the salt & hash in the plaintext db
    users[name].salt = salt;
    users[name].hash = hash;
  });
};

// check if user is logged in, if not redirect them to the index
function requireLogin (req, res, next) {
  if (!req.user) {
    res.redirect('/');
  } else {
    next();
  }
};

// Authenticate using our plaintext database
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
  var profile = req.body.profile,
      keywords = req.body.keywords,
      hashtags = req.body.hashtags,
      userMentions = req.body.usermentions,
      count = req.body.count,
      dbonly = req.body.dbonly,
      playeronly = req.body.playersonly,
      lan = 'en',
      tweettxt = new Array(), // array that will contain the returned tweet texts
      users = new Array(), // array that will contain the returned twitter users
      tweetloc = new Array(), // array that will contain the returned tweet locations
      tweetobj = {}, // object that contains both the users and their collection of tweets
      userobj = {},
      query = '',
      tweetsReturned = [];
    
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

  // Stoplist array: don't include these words when finding the most used words
  var stoplist = ['','RT','a','A','I','i','The','the','and','And','in','In','for','from','at','this','of','on','or','Or','too','to','retweet','-','.',',',':',';','/'];

  // function to check which team is being search so as to return the players of that team on twitter
  function checkTeam(profile){
    if (teams[profile]) {
      return teams[profile]; // match the profile with the team and its players 
    } else {
      return profile; // if the profile doesn't match with a team return the profile
    }
  }

  // Function for checking if a common word is in the stoplist
  function checkWord(string){
    var found = false;
    for (i = 0; i < stoplist.length && !found; i++) {
      if (stoplist[i] === string) {
        found = true;
        return true;
      }
    }
  }

  // Function for handling the tweets
  function handleTweets(err, data, type) {
    if(type != "SQL"){
      data = data.statuses;
    }

    //check if err
    if (err) {
      console.error('Get error', err);
    } else {
      //If the search returns nothing AND tweetsReturned is empty, then Twitter didn't find anything at all
      if ((data.length == 0) && (tweetsReturned.length == 0)) {
        //Say so
        console.log("No tweets returned, try less specific search criteria.");
      } else {
        //Alright, we've got a batch of data
        //Push every status found onto the stack
        for (var i in data){
          tweetsReturned.push(data[i]);
        }
        //If we maxed out the current batch AND we need more tweets, get more tweets
        if (data.length == 100 && tweetsReturned.length < count) {

          //find the lowest id in the current tweets returned
          maxid=10000000000000000000;
          for (var i in tweetsReturned){
            if (tweetsReturned[i].id < maxid){
              maxid = tweetsReturned[i].id;
            }
          }
          //get more tweets
          getTweets(count-tweetsReturned.length, maxid);

        } else {
          //now we have all the tweets we want
          if(type != "SQL"){
            tweetsReturned = convertData(tweetsReturned); //Convert the raw twitter data into something more usable
            //storeTweets(tweetsReturned); // Store the tweets in the SQL db
          } 
          sortTweets(tweetsReturned); // sort the tweet data
          top = getTopWords(); // then find the most frequent words in the data
          topu = getTopUsers(); // then find the most frequent users
          getUserswords();
          return res.render('queryInterface.html', {tweets: JSON.stringify(tweetobj), activeUsers: JSON.stringify(topu), commonWords: JSON.stringify(top), usersCommon: JSON.stringify(userobj), geo: JSON.stringify(tweetloc)}); // Send the data to the client
        }
      } 
    }
  }

  // Function for getting the most frequent users for a search
  function getFreqUsers(){
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

  // Function for getting the frequency of each word within a string
  function getFreqWord(){
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

  // Function for returning the tweets of the players returned 
  function getPlayerTweets() {
    var players = checkTeam(profile);
    profile = '';
    for (var i = 0; i < players.length; i++){
      if (i >= 0 && i != (players.length) - 1){
        string = 'from:' + players[i] + ' OR ';
        profile = profile.concat(string); // change the profile to the players
      } else {
        string = 'from:' + players[i];
        profile = profile.concat(string); // change the profile to the players
      } 
    }
    getTweets(); // getTweets with the new variables
  }

  // Function for returning the top 10 users from getFreqUsers()
  function getTopUsers(){
    var topusers = getFreqUsers(), // call the getFrequsers() function
        topusers = Object.keys(topusers).map(function (k) { return { user: k, num: topusers[k] }; }), // create an object with the key, user which is the user taken from getFreqWord() and the key, num which is the number of occurances of that word 
        topten = [];

    // Sort in descending order by the key num:
    topusers = topusers.sort(function (a, b){
      return b.num - a.num;
    });
    if ( topusers.length <= 9 ) { 
      topten = topusers; // if topwords doesn't have 10 elements then just make toptwenty equal to topusers
      return topten;
    } else {
      for (var i=0; i<=9; i++){
        topten.push(topusers[i]); // if topwords has more than 10 elements then push the first 10 elements in topusers to the topten array
      }
      //topten.splice(10, topten.length);
      return topten;
    }
  }

  // Function for returning the top 20 words from getFreqWord()
  function getTopWords(){
    var topwords = getFreqWord(), // Call the getFreqWord() function
        topwords = Object.keys(topwords).map(function (k) { return { word: k, num: topwords[k] }; }), // create an object with the key, word which is the word taken from getFreqWord() and the key, num which is the number of occurances of that word 
        toptwenty = [],
        twenty = 19;

    // Sort in descending order by the key num:
    topwords = topwords.sort(function (a, b){
      return b.num - a.num;
    });

    if (topwords.length <= 19){
      topwords = toptwenty; // if topwords doesn't have 20 elements then just make toptwenty equal to topwords
      return toptwenty;
    } else {
        for (var i=0; i<=twenty; i++){
          try{
            if (checkWord(topwords[i].word) === true ) {
            twenty = twenty + 1; // if the word is a blacklisted word then don't inlcude it and add one to the index limit so twenty words are returned
            } else {
              toptwenty.push(topwords[i]); // if topwords has more than 20 elements then push the first 20 elements in topwords to the toptwenty array
            }
          }
          catch (err){
            console.log('Error:' + err);
          }
        }
      return toptwenty;
    }
  }

  // Function for searching through twitter using the specified data
  function getTweets(count, maxid){

    //Formulate the search query from the form data
    //If the query hasn't been formed already, form it
    if (query == ''){
      if (keywords != ''){
        query = query + keywords;
      }
      if (hashtags != ''){
        query = query+' '+hashtags;
      }
      if (userMentions != ''){
        query = query+' '+userMentions;
      }
      if (profile != '' && playeronly == undefined){
        query = query+'@' +profile+ ' OR from:'+profile;
      } else {
        query = query + profile;
      }
    }

    //set the number of tweets the search should look for
    if(count > 100){
      queryCount = 100;
    } else {
      queryCount = count;
    }

    //CHECK THAT THE QUERY HASNT BEEN MADE ALREADY HERE
    //The query must not be empty after stripping whitespace
    if(query.replace(/ /g,'') != ''){
      client.get('search/tweets', { 
        q: query, 
        count: queryCount,
        max_id: maxid,
        lang: 'en' 
      },
      handleTweets);

    } else {
      console.log('Please enter at least one search term');
    }
  }

  //get the tweets from the SQL database
  function getTweetsSQL(count){

    //Prepare the query string
    var inputString = '';
    //concatanate every text box into one string
    inputString = keywords+' '+hashtags+' '+userMentions;

    //initialise the query string to be parsed in SQL
    queryString = "SELECT * FROM tweets WHERE ";

    //If query is not empty
    if(inputString.replace(/ /g,'') != ''){
      //split the individual words into an array
      queryArray = inputString.split(' '); 
      //remove all empty elements (can be created if the user pressed space twice, etc)
      var tempArray = [];
      //iterate through the array
      for (var i in queryArray){
        if (queryArray[i] != ''){
          //push non-empty elements into a temporary array
          tempArray.push(queryArray[i]);
        }
      }
      //shunt the temp array over and delete it
      queryArray = tempArray;
      tempArray.delete;

      //add the first search term to the sql regex
      queryString = queryString + "tweetText REGEXP '"+queryArray[0];
      //add the rest of them
      for (var i=1; i < queryArray.length; i++) {
        queryString = queryString+'|'+queryArray[i];
      }
      //close it off
      queryString = queryString+"'";
      //This produces 

      //If the user specified a profile in addition to some search terms we need an OR too
      if (profile.replace(/ /g,'') != '') {
        queryString = queryString+" OR ";
      }
    }

    //If profile is not empty
    if (profile.replace(/ /g,'') != '') {
      //remove the '@' if it's there
      if (profile.charAt(0) == '@'){
        profile = profile.slice(1);
      }
      //add the additional query terms
      queryString = queryString+"userName LIKE '%"+profile+"%' OR retweetedBy LIKE '%"+profile+"%'";
    }
    
    //Check if the user has actually entered any search terms, i.e., the queryString has changed from its initial state.
    if (queryString == "SELECT * FROM tweets WHERE "){
      //the user hasn't put anything in the text boxes at all
      console.log("Please enter some search terms.");
    } else {

      //Add the limit if the user has specified a count
      if (count != ''){
        queryString = queryString + ' LIMIT '+count;
      }

      //Get the relevant tweets from the database by querying it
      connection.query(queryString, function (err, res) {
        if (err) {
          console.log(err);
        } else {
          //We got the results, now to send them to the html
          console.log(res.length+" tweets returned from the database.");
          console.log("Queried with "+queryString);
          handleTweets(err, res, "SQL");
        }
      });
    } 
  }

  // Function for returning the most frequently used words for each user
  function getUserswords() {
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
        words = Object.keys(words).map(function (k) { return { word: k, num: words[k] }; });// create an object with the key, word which is the word taken from getFreqWord() and the key, num which is the number of occurances of that word 
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

  // Function for creating an object of users tweets, takes the object the key and the data asociated with that key and returns an object 
  function pushToobject(obj, key, data) {
     if (!Array.isArray(obj[key])) obj[key] = [];
     return obj[key].push(data);
  }

  // Function for sorting through the tweets to return relevant information
  function sortTweets(data) {
    for (var i in data){
      var tweet = data[i];
      tweettxt.push(tweet.tweetText); // push the tweet text so it can be sorted for the most frequent words
      users.push(tweet.userName); // push the twitter user screen name so it can be sorted to find the most frequent users
      pushToobject(tweetobj, tweet.userName, tweet.tweetText); // Call the pushToobject to create an object containing each screen name and their collection of tweets
      if (tweet.coordinates != null){
        tweetloc.push(tweet.coordinates); // push the twitter geo location so that the locations can be displayed on a map, if geocode is present
      } 
    }
  }

  //Convert the raw Twitter data into something more compact and usable
  function convertData(data){
    //for every tweet received from twitter
    newTweets = [];
    for (var i in data){
      //Pull data from the tweet
      tweet = data[i];
      if (tweet.hasOwnProperty('retweeted_status')){
        tweet.isRetweet = true;
        dataTweet = tweet.retweeted_status;
        //totalRetweets++;
      } else {
        dataTweet = tweet;
      }

      //get the hashtags array as a string
      if (dataTweet.entities.hashtags != undefined){
        hashtagData = '';
        for (var indx in dataTweet.entities.hashtags){
          hashtagData += '#'+dataTweet.entities.hashtags[indx].text+',';
        }
        //get rid of the final ','
        hashtagData = hashtagData.slice(0, -1);
      } else {
        hashtagData = null;
      }

      //do the same for user mentions
      if (dataTweet.entities.user_mentions != undefined){
        userMentionsData = '';
        for (var indx in dataTweet.entities.user_mentions){
          userMentionsData += '@'+dataTweet.entities.user_mentions[indx].screen_name+',';
        }
        //get rid of the final ','
        userMentionsData = userMentionsData.slice(0, -1);
      } else {
        userMentionsData = null;
      }

      //get the coordinates
      if (tweet.coordinates != null){
        coordinatesData = tweet.coordinates.coordinates[0]+','+tweet.coordinates.coordinates[1];
      } else {
        coordinatesData = null;
      }

      //Prepare the tweet data for SQL insertion
      if (tweet.isRetweet){
        //Is a retweet
        tweetData = {
          id: tweet.id,
          userName: tweet.user.screen_name,
          userHandle: tweet.user.name,
          userProfilePicture: tweet.user.profile_image_url,
          createdAt: tweet.created_at,
          retweetedBy: tweet.retweeted_status.user.screen_name,
          tweetText: tweet.text,
          hashtags: hashtagData,
          userMentions: userMentionsData,
          coordinates: coordinatesData
        }
      } else {
        //Is not a retweet
        tweetData = {
          id: tweet.id,
          userName: tweet.user.screen_name,
          userHandle: tweet.user.name,
          userProfilePicture: tweet.user.profile_image_url,
          createdAt: tweet.created_at,
          tweetText: tweet.text,
          hashtags: hashtagData,
          userMentions: userMentionsData,
          coordinates: coordinatesData
        };
      }
      newTweets.push(tweetData);
    }
    return newTweets;
  }

  //Store the tweets in the SQL database
  function storeTweets(data) {

    //Set-up variables
    tweets = data;
    totalRetweets = -1; //total retweets, set to -1 to let the first retweet through
    storedRetweets = 0; //stored retweets
    alreadyStoredTweets = 0; //tweets returned by the search already in the database
    newTweetsStored = 0; //new tweets stored

    //Go through each tweet in turn, and store it
    async.eachSeries(tweets, function storeTweet(tweet, callback){
    
      //check if the tweet already exists in the db
      connection.query('SELECT 1 FROM tweets WHERE id = ? LIMIT 1;', tweet.id, function (err, result){
        if (err) {
          console.log(err);
        } else if (result.length == 1){
          //Tweet already exists, do nothing
          alreadyStoredTweets++;
          //exit loop
          callback();
        } else {
          //Tweet doesn't exist in db, store it

           if(tweet.isRetweet){
              totalRetweets++;
            }
          //Only add every seventh Retweet to prevent excessive duplication
          if( tweet.isRetweet && ((totalRetweets % 7) != 0) ){
            //Throw out every seventh tweet 
            callback();
          } else {
            //Store the tweet in the SQL database
            if(tweet.isRetweet){
              storedRetweets++;
            }
            //Store the data in the db
            connection.query('INSERT INTO tweets SET ?', tweet, function (err, res){
              if (err) {
                console.log(err);
              } else {
                newTweetsStored++;
                callback();
              }
            }); 
          }
        }
      });
    }, function(err){ 
      //Do this after every tweet has been stored
      console.log(tweets.length+' total tweets found.');
      console.log((totalRetweets+1)+' total retweets found.');
      console.log(alreadyStoredTweets+' tweets already in database.');
      console.log(newTweetsStored+" new tweets stored in the database, of which "+storedRetweets+" are retweets.");
    });
  }

  try { 
    //Default the count to 300 if nothing is entered
    if (count == ''){
      count = 300;
    }
    if (playeronly == undefined){
      if (dbonly==undefined){
        getTweets(count, 10000000000000000000);
      } else {
        getTweetsSQL(count);
      }
    } else {
      getPlayerTweets();
    }
  }

  catch (err) {
    console.log('Error:' + err);
    console.log('Please try again...');
  }
});

// POST which deals with the SPARQL queries
app.post('/sparql', function (req, res, next) {
  var userInh = req.body.hTeam;
  var userIna = req.body.aTeam;
  var date = req.body.date;
  var client = new SparqlClient(endpoint);

  // Query for the home ground
  var queryg = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>" +
  "PREFIX p: <http://dbpedia.org/property/> "  +
  "PREFIX o: <http://dbpedia.org/ontology/> " +
  "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>" +    
  "SELECT * WHERE { " +
    "<http://dbpedia.org/resource/" + String(userInh) + ">" + "p:ground ?ground." +
    "OPTIONAL {?ground o:abstract ?description}." +
    "OPTIONAL {?ground p:seatingCapacity ?capacity}." +
    "OPTIONAL {?ground p:image ?image}." +
    'FILTER(langMatches(lang(?description), "EN"))' +
  "}" +
  "ORDER BY DESC(?capacity) LIMIT 1";

  // Query for the home teams description
  var queryh_d = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>" +
  "PREFIX p: <http://dbpedia.org/property/> "  +
  "PREFIX o: <http://dbpedia.org/ontology/> " +
  "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>" +    
  "SELECT * WHERE { " +
    "<http://dbpedia.org/resource/" + String(userInh) + ">" + "o:abstract ?description." +
    'FILTER(langMatches(lang(?description), "EN"))' +
  "}";

  // Query for the away teams description
  var querya_d = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>" +
  "PREFIX p: <http://dbpedia.org/property/> "  +
  "PREFIX o: <http://dbpedia.org/ontology/> " +
  "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>" +    
  "SELECT * WHERE { " +
    "<http://dbpedia.org/resource/" + String(userIna) + ">" + "o:abstract ?description." +
    'FILTER(langMatches(lang(?description), "EN"))' +
  "}";

  // Query for the manager of the home team
  var querym_h = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>" +
  "PREFIX p: <http://dbpedia.org/property/> " +
  "PREFIX o: <http://dbpedia.org/ontology/> " +
  "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>" +    
  "SELECT * WHERE { " +
    "<http://dbpedia.org/resource/" + String(userInh) + ">" + "o:manager ?manager." +
    "OPTIONAL {?manager p:cityofbirth ?city}." +
    "OPTIONAL {?manager p:dateOfBirth ?dob}." +
    "OPTIONAL {?manager foaf:depiction ?image}." +
  "}";

  // Query for the manager of the away team
  var querym_a = "PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>" +
  "PREFIX p: <http://dbpedia.org/property/> "  +
  "PREFIX o: <http://dbpedia.org/ontology/> " +
  "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>" +    
  "SELECT * WHERE { " +
    "<http://dbpedia.org/resource/" + String(userIna) + ">" + "o:manager ?manager." +
    "OPTIONAL {?manager p:cityofbirth ?city}." +
    "OPTIONAL {?manager p:dateOfBirth ?dob}." +
    "OPTIONAL {?manager foaf:depiction ?image}." +
  "}";

  // Query for the home teams players
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

  // Query for the away teams players
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
    var ground = client.query(queryg)
    .execute(function(error, results) {
    process.stdout.write(util.inspect(arguments, null, 40, true)+"\n");1
    });
  }
  catch (err){
    var alert = "Error," + err + "please try again...";
    res.render('queryInterface2.html', {sparql: alert});
  }
  try {
    var home_d = client.query(queryh_d)
    .execute(function(error, results) {
    process.stdout.write(util.inspect(arguments, null, 40, true)+"\n");1
    });
  }
  catch (err){
    var alert = "Error," + err + "please try again...";
    res.render('queryInterface2.html', {sparql: alert});
  }
  try {
    var away_d = client.query(querya_d)
    .execute(function(error, results) {
    process.stdout.write(util.inspect(arguments, null, 40, true)+"\n");1
    });
  }
  catch (err){
    var alert = "Error," + err + "please try again...";
    res.render('queryInterface2.html', {sparql: alert});
  }
  try {
    var manager_h = client.query(querym_h)
      .execute(function(error, results) {
      process.stdout.write(util.inspect(arguments, null, 40, true)+"\n");1
    });
  }
  catch (err){
    var alert = "Error," + err + "please try again...";
    res.render('queryInterface2.html', {sparql: alert});
  }
  try {
    var manager_a = client.query(querym_a)
    .execute(function(error, results) {
    process.stdout.write(util.inspect(arguments, null, 40, true)+"\n");1
    });
  }
  catch (err){
    var alert = "Error," + err + "please try again...";
    res.render('queryInterface2.html', {sparql: alert});
  }
  try {
    var home_p = client.query(queryh_p)
      .execute(function(error, results) {
      process.stdout.write(util.inspect(arguments, null, 40, true)+"\n");1
    });
  }
  catch (err){
    var alert = "Error," + err + "please try again...";
    res.render('queryInterface2.html', {sparql: alert});
  }
  try {
    var away_p = client.query(querya_p)
    .execute(function(error, results) {
    process.stdout.write(util.inspect(arguments, null, 40, true)+"\n");1
    });
  }
  catch (err){
    var alert = "Error," + err + "please try again...";
    res.render('queryInterface2.html', {sparql: alert});
  }
  finally {
    var allResults = [ground, home_d, away_d, manager_h, manager_a, home_p, away_p];
    var alert = "Unforunately we were unable to display the results from the SPARQL query, the results can be found in the command line. To use the twitter form please press the back button."
    res.render('queryInterface2.html', {sparql: alert});
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