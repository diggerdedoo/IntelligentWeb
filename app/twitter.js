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
// placeholder variables
var profile = 'MCFC',
    keyword = '',
    count = 10,
    date = '2015-11-11',
    lan = 'en',
    search = keyword + " since:" + date + " lang:" + lan;
    tweettxt = [ ];

checkCount(count);
console.log(getTweets().done(countString));
//var pTweets = getPlayerTweets();

function run(){
  // variables to use with the html form
  var profile = form.elements[0].value,
      keyword = form.elements[1].value,
      count = form.elements[2].value,
      date = form.elements[3].value,
      lan = 'en',
      search = keyword + " since:" + date + " lang:" + lan;

  checkCount(count);
  getTweets();
  getPlayerTweets();
}

// function to make sure count is 100 or less, to not return to many tweets
function checkCount(count){
  if (count > 100 ) {
    count == 100;
  } else {
    count == count;
  }
}

// function to check which team is being search so as to return the players of that team on twitter
function checkTeam(profile){
  if (teams[profile]) {
    return teams[profile];
  } else {
    return profile;
  }
}

// function for handling the tweets
function handleTweets(err, data){
  if (err) {
    console.error('Get error', err)
  }  
  else {
    //console.log('Get Tweets');
    sortTweets(data);
    //console.log('Finished');
  }
}

// fucntion for handling the friends/profiles
function handleFriends(err, data){
  if (err) {
    console.error('Get error', err)
  }  
  else {
    //console.log('Get Friends');
    console.log(data);
    //console.log('Finished');
  }
}

// function for sorting through the tweets to return relevant information
function sortTweets (data) {
  for (var indx in data.statuses){
    var tweet = data.statuses[indx];
    //console.log('on: ' + tweet.created_at + ' : @' + tweet.user.screen_name + ' : ' + tweet.text+'\n\n');
    tweettxt.push(tweet.text); // push the tweet text so it can be sorted for the most frequent words
    //console.log(tweettxt);
  }
}

// function for sorting through the twitter profile to return relevant information
function sortProfile (data) {
  for (var indx in data.statuses){
    var tweet = data.statuses[indx];
    console.log('@' + tweet.user.screen_name +'\n\n');
  }
}

// function for searching through twitter using the specified data
function getTweets(){
  return client.get('search/tweets', { q: search, count: count, from: profile },
              handleTweets)

}

// function for searching through twitter profiles using the specified data
function getProfile( callback ){
  return client.get('friends/list', { screen_name: profile, count: count },
             handleFriends)
}

// function for returning the tweets of the players returned 
function getPlayerTweets(){
  var players = checkTeam(profile);
  for (var i = 0; i <= players.length; players[i]){
    profile = players[i]; // change the profile to the players
    count = 1; // change count to 1 so as to get only the most recent tweet
    getTweets(); // getTweets with the new variables
    i += 1;
  }
}