// Dependancies
var Twit = require('twit');
var client = new Twit({
  consumer_key: 'aGvgbxGtSKTWdcxGf3paz90Kq',
  consumer_secret: 'PJwjJPJFUuWuEvzyj3G2fxbfy7yvFb00mRd45rRrKtJ4Ea39rj',
  access_token: '221331440-s4Bgw21Z9xhlGe8QuGphtKjx0ZXg4h3sEYNUERff',
  access_token_secret: 'LlQCF7QCj5UOlli8LSU4BhAnF9ouiJliSZ7bFeOqm36p9',
  timeout_ms: 60*1000,
});
var mysql = require('mysql'),
    connection = mysql.createConnection({
      host     : 'stusql.dcs.shef.ac.uk',
      user     : 'team078',
      password : '0e90a044',
      database : 'team078',
      port     : 3306,
    });

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
}

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
}

// Placeholder variables
var profile = '',
    keyword = 'the sun is just one big space heater',
    count = 300,
    date = '2015-11-11',
    lan = 'en',
    loc = '',
    dist = 400,
    search = keyword + " since:" + date + " lang:" + lan + " geocode:" + loc + "," + dist + "km";
    tweettxt = new Array(), // array that will contain the returned tweet texts
    users = new Array(), // array that will contain the returned twitter users
    tweetloc = new Array(), // array that will contain the returned tweet locations
    tweetobj = {}; // object that contains both the users and their collection of tweets
    userobj = {};

// run outside of run function
loc = checkUserLoc(loc);
checkSearch();
console.log(search);
getTweets();

// Function to be called when the form is submitted 
function run(){
  // variables to use with the html form
  var profile = form.elements[0].value,
      keyword = form.elements[1].value,
      count = form.elements[2].value,
      date = form.elements[3].value,
      dist = form.elements[4].value,
      loc = form.elements[5].value,
      lan = 'en',
      search = keyword + " since:" + date + " lang:" + lan + " geocode:" + dist + "km";
      search = keyword + " since:" + date + " lang:" + lan + " geocode:" + loc + "," + dist + "km";
      tweettxt = new Array(),
      users = new Array(),
      tweetloc = new Array(),
      tweetobj = {};
      userobj = {};

  // Run order of all the social web queries for twitter
  loc = checkUserLoc(loc);
  checkSearch();
  checkUserLoc(loc);
  checkCount(count);  
  getTweets();
  getPlayerTweets();
  getMentions();
}

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
    console.log("No location provided.")// If a location has been provided, just use that
  }
}

// Function to check which team is being searched so the geocode location for the teams stadium can be returned
function checkLocation(profile){
  if (locations[profile]){
    return locations[profile]; // match the location with the team name
  } else if (locations[keyword]){
    return locations[keyword]; // if no match then match with the keyword used
  } else {
    return null // if the profile searched isnt in locations, then return null
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

// Function for handling the tweets
function handleTweets(err, data){
  if (err) {
    console.error('Get error', err)
  } else {
    if ( tweetobj == {}){
      Console.log("Not enough tweets returned in the date range, please change the date.")
    } else {
      storeTweets(data); // store the tweets in the SQL database
      sortTweets(data); // sort the tweet data
      top = getTopwords(); // then find the most frequent words in the data
      topu = getTopusers(); // then find the most frequent users
      getUserswords();
      var str = JSON.stringify(userobj); // stringify userobj so it doesnt display object
      str = JSON.stringify(userobj, null, 4);  // Add some indentation so it is displayed in a viewable way
      // used for testing 
      //console.log(top);
      //console.log(topu);
    }
  }
}

// Function for handling the friends/profiles
function handleFriends(err, data){
  if (err) {
    console.error('Get error', err)
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
    //console.log('@' + tweet.user.screen_name +'\n\n'); needs to be some way of displaying the tweets in html
    tweettxt.push(tweet.text); // push the tweet text so it can be sorted for the most frequent words
    users.push(tweet.user.screen_name); // push the twitter user screen name so it can be sorted to find the most frequent users
    pushToobject(tweetobj, tweet.user.screen_name, tweet.text); // Call the pushToobject to create an object containing each screen name and their collection of tweets
    if (tweet.geo != null){
      tweetloc.push(tweet.geo); // push the twitter geo location so that the locations can be displayed on a map, if geocode is present
    } else {
      //console.log('No Tweet location available.'); // If no tweet location log it in the console. 
    }
  }
}

//Store the tweets in the SQL database
function storeTweets(data){
  //Store the first tweet for now
  var tweet = data.statuses[0];

  //get the hashtags array as a string
  hashtagData = '';
  for (var indx in tweet.entities.hashtags){
    hashtagData += tweet.entities.hashtags[indx].text+',';
  }
  //get rid of the final ',', but not if there's nothing to get rid of
  if (hashtagData != ''){
    hashtagData = hashtagData.slice(0, -1);
  }

  //do the same for user mentions
  userMentionsData = '';
  for (var indx in tweet.entities.user_mentions){
    userMentionsData += tweet.entities.user_mentions[indx].screen_name+',';
  }
  if (userMentionsData != ''){
    userMentionsData = userMentionsData.slice(0, -1);
  }

  tweetData = {
    id: tweet.id,
    userName: tweet.user.screen_name,
    userHandle: tweet.user.name,
    userProfilePicture: tweet.user.profile_image_url,
    tweetText: tweet.text,
    hashtags: hashtagData
  };
  console.log("STORING "+hashtagData);
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
      toptwenty = [];

  // Sort in descending order by the key num:
  topwords = topwords.sort(function (a, b){
    return b.num - a.num
  });

  if (topwords.length <= 20){
    topwords = toptwenty; // if topwords doesn't have 20 elements then just make toptwenty equal to topwords
    return toptwenty;
  } else {
    for (var i=0; i<=20; i++){
      toptwenty.push(topwords[i]); // if topwords has more than 20 elements then push the first 20 elements in topwords to the toptwenty array
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
    return b.num - a.num
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
        return b.num - a.num
      });

      if (words.length <= 9){
        words = toptenu; // if topwords doesn't have 10 elements then just make toptwenty equal to topwords
      } else {
        for (var i=0; i<=9; i++){
          toptenu.push(words[i]); // if topwords has more than 10 elements then push the first 20 elements in topwords to the toptwenty array
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
  if ( profile = ''){
    console.log('No profile provided.');// user has not provided a profile to search
  } else {
    keyword = '@' + profile; // change the keyword to be the profile that the user wishes to search
    getTweets(); 
  }
}