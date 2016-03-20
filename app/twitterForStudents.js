var Twit = require('twit');
var client = new Twit({
  consumer_key: 'aGvgbxGtSKTWdcxGf3paz90Kq',
  consumer_secret: 'PJwjJPJFUuWuEvzyj3G2fxbfy7yvFb00mRd45rRrKtJ4Ea39rj',
  access_token: '221331440-s4Bgw21Z9xhlGe8QuGphtKjx0ZXg4h3sEYNUERff',
  access_token_secret: 'LlQCF7QCj5UOlli8LSU4BhAnF9ouiJliSZ7bFeOqm36p9',
});

var allData = [];
var i = 0;
//var manUtd = getManUtdTweets();
//var london = getLondonTweets();
//var manUtdProfile = getManUtdProfile();
var count = 10,
    profile = 'manutd',
    date = '2011-11-11',
    keyword = 'man city',
    lan = 'en',
    search = keyword + " since:" + date + " lang:" + lan;

var tweets = getTweets();
var profiles = getProfile();
console.log('Started')

function handleLondonTweets(err, data){
  if (err) {
    console.error('Get error', err)
  }  
  else {
    console.log('Get Tweets');
    allData = allData.concat(data);
    i += 1;
    if (i == 3){
      console.log(allData);
      console.log('Finished');
    }
  }
}

function handleManUtdTweets(err, data){
  if (err) {
    console.error('Get error', err)
  }  
  else {
    console.log('Get Tweets');
    allData = allData.concat(data);
    i += 1;
    if (i == 3){
      console.log(allData);
      console.log('Finished');
    }
  }
}

function handleTweets(err, data){
  if (err) {
    console.error('Get error', err)
  }  
  else {
    console.log('Get Tweets');
    console.log(tweets);
    console.log('Finished');
  }
}

function handleFriends(err, data){
  if (err) {
    console.error('Get error', err)
  }  
  else {
    console.log('Get Friends');
    console.log(profiles);
    console.log('Finished');
  }
}


function getManUtdTweets(){
  client.get('search/tweets', { q: 'Liverpool since:2011-11-11 lang:en', count: 100, from: 'manutd' },
              handleManUtdTweets)
}

function getLondonTweets(){
  client.get('search/tweets', { q: 'Drones since:2011-11-11 lang:en geocode:51.5072,0.1275,200km', count: 100, from: 'manutd' },
              handleLondonTweets)
}

function getManUtdProfile( callback ){
  client.get('friends/list', { screen_name: 'manutd' , count: 200 },
             handleFriends)
}

function getTweets(){
  return client.get('search/tweets', { q: search, count: count, from: profile },
              handleTweets)
}

function getProfile( callback ){
  return client.get('friends/list', { screen_name: profile, count: count },
             handleFriends)
}