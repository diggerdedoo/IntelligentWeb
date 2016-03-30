var Twit = require('twit');
var client = new Twit({
  consumer_key: 'aGvgbxGtSKTWdcxGf3paz90Kq',
  consumer_secret: 'PJwjJPJFUuWuEvzyj3G2fxbfy7yvFb00mRd45rRrKtJ4Ea39rj',
  access_token: '221331440-s4Bgw21Z9xhlGe8QuGphtKjx0ZXg4h3sEYNUERff',
  access_token_secret: 'LlQCF7QCj5UOlli8LSU4BhAnF9ouiJliSZ7bFeOqm36p9',
  timeout_ms: 60*1000,
});

// array containing the players on twitter for each premier league football club
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

// array contain the longitude and latitude location of each teams stadium to localise tweet results
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

// placeholder variables
var profile = '',
    keyword = 'MCFC',
    count = 300,
    date = '2011-11-11',
    lan = 'en',
    loc = checkLocation(profile),
    geo = 400,
    search = '',
    tweettxt = new Array(),
    users = new Array(),
    tweetloc = new Array();

checkSearch();
console.log(search);
checkCount(count);
getTweets();

// function to be called when the form is submitted 
function run(){
  // variables to use with the html form
  var profile = form.elements[0].value,
      keyword = form.elements[1].value,
      count = form.elements[2].value,
      date = form.elements[3].value,
      geo = form.elements[4].value,
      lan = 'en',
      search = keyword + " since:" + date + " lang:" + lan + " geocode:" + geo;

  checkCount(count);  
  getTweets();
  getPlayerTweets();
}

// function to make sure count is 300 or less, so as not return to many tweets
function checkCount(count){
  if (count > 300 ) {
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

// function to check which team is being searched so the geocode location for the teams stadium can be returned
function checkLocation(profile){
  if (locations[profile]){
    return locations[profile]; // match the location with the team name
  } else if (locations[keyword]){
    return locations[keyword];
  } else {
    return null // if the profile searched isnt in locations, then don't include geocode coordinates
  }
}

function checkSearch(){
  if ( checkLocation(profile)==null){
    search = keyword + " since:" + date + " lang:" + lan + " geocode:" + geo + "km";
  } else {
    search = keyword + " since:" + date + " lang:" + lan + " geocode:" + loc + "," + geo + "km";
  }
}

// function for handling the tweets
function handleTweets(err, data){
  if (err) {
    console.error('Get error', err)
  } else {
    sortTweets(data); // sort the tweet data
    top = getTopwords(); // then find the most frequent words in the data
    topu = getTopusers(); // then find the most frequent users
    console.log(top);
    console.log(topu);
    console.log(tweetloc);
  }
}

// fucntion for handling the friends/profiles
function handleFriends(err, data){
  if (err) {
    console.error('Get error', err)
  }  
  else {
    sortProfile(data);
  }
}

// function for sorting through the tweets to return relevant information
function sortTweets (data) {
  for (var indx in data.statuses){
    var tweet = data.statuses[indx];
    tweettxt.push(tweet.text); // push the tweet text so it can be sorted for the most frequent words
    users.push(tweet.user.screen_name); // push the twitter user screen name so it can be sorted to find the most frequent users
    if (tweet.geo != null){
      tweetloc.push(tweet.geo); // push the twitter geo location so that the locations can be displayed on a map, if geocode is present
    } else {
      // do nothing 
    }
  }
}

// function for sorting through the twitter profile to return relevant information
function sortProfile (data) {
  for (var indx in data.statuses){
    var tweet = data.statuses[indx];
    console.log('@' + tweet.user.screen_name +'\n\n');
  }
}

// function for getting the frequency of each word within a string
function getFreqword(){
  var string = tweettxt.toString(), // turn the array into a string
      changedString = string.replace(/,/g, " "), // remove the array elements 
      split = changedString.split(" "), // split the string 
      words = [];

  for (var i=0; i<split.length; i++){
    if(words[split[i]]===undefined){
      words[split[i]]=1;
    } else {
      words[split[i]]++;
    }
  }
  return words;
}

// function for returning the top 20 words from getFreqword()
function getTopwords(){
  var topwords = getFreqword(),
      topwords = Object.keys(topwords).map(function (k) { return { word: k, num: topwords[k] }; }),
      toptwenty = [];

  // sort in decending order
  topwords = topwords.sort(function (a, b){
    return b.num - a.num
  });

  if (topwords.length < 20){
    topwords = toptwenty; // if topwords doesnt have 20 elements 
    return toptwenty;
  } else {
    for (var i=0; i<=20; i++){
      toptwenty.push(topwords[i]); // push the first 20 elements in topusers to the topten array
    }
    return toptwenty;
  }
}

// function for getting the most frequent users for a search
function getFrequsers(){
  var string = users.toString(), // turn the array into a string
      changedString = string.replace(/,/g, " "), // remove the array elements 
      split = changedString.split(" "), // split the string 
      freqUsers = []; // array for the freqent users to be pushed too

  for (var i=0; i<split.length; i++){
    if(freqUsers[split[i]]===undefined){
      freqUsers[split[i]]=1;
    } else {
      freqUsers[split[i]]++;
    }
  }
  return freqUsers;
}

// function for returning the top 10 users from getFrequsers()
function getTopusers(){
  var topusers = getFrequsers(),
      topusers = Object.keys(topusers).map(function (k) { return { user: k, num: topusers[k] }; }),
      topten = [];

  topusers = topusers.sort(function (a, b){
    return b.num - a.num
  });
  if ( topusers.length < 10 ) { 
    topten = topusers;
    return topten;
  } else {
    for (var i=0; i<=10; i++){
      topten.push(topusers[i]); // push the first 10 elements in topusers to the topten array
    }
    return topten;
  }
}

// function for searching through twitter using the specified data
function getTweets(){
  client.get('search/tweets', { 
    q: search, 
    count: count, 
    from: profile 
  },
  handleTweets);
}

// function for searching through twitter profiles using the specified data
function getProfile( callback ){
  return client.get('friends/list', { 
    screen_name: profile, 
    count: count 
  },
  handleFriends);
}

// function for returning the tweets of the players returned 
function getPlayerTweets(){
  var players = checkTeam(profile);
  count = 1; // change count to 1 so as to get only the most recent tweet
  for (var i = 0; i <= players.length; i++){
    profile = players[i]; // change the profile to the players
    getTweets(); // getTweets with the new variables
  }
}

// function for searching for the mentions of a profile
function getMentions(){
  if ( profile = ""){
    // do nothing, user has not provided a profile to search
  } else {
    keyword = '@' + profile; // change the keyword to be the profile that the user wishes to search
    getTweets(); 
  }
}