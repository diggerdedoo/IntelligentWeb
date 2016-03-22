var Twit = require('twit');
var client = new Twit({
  consumer_key: 'aGvgbxGtSKTWdcxGf3paz90Kq',
  consumer_secret: 'PJwjJPJFUuWuEvzyj3G2fxbfy7yvFb00mRd45rRrKtJ4Ea39rj',
  access_token: '221331440-s4Bgw21Z9xhlGe8QuGphtKjx0ZXg4h3sEYNUERff',
  access_token_secret: 'LlQCF7QCj5UOlli8LSU4BhAnF9ouiJliSZ7bFeOqm36p9',
  timeout_ms: 60*1000,
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
//var sortedTweets = sortTweets(tweets);

function handleTweets(err, data){
  if (err) {
    console.error('Get error', err)
  }  
  else {
    console.log('Get Tweets');
    console.log(data);
    console.log('Finished');
  }
}

function handleFriends(err, data){
  if (err) {
    console.error('Get error', err)
  }  
  else {
    console.log('Get Friends');
    console.log(data);
    console.log('Finished');
  }
}

function sortTweets(err, data, response){
  for (var indx in data.statuses){
    var tweet = data.statuses[indx];
    console.log('on: ' + tweet.created_at + ' : @' + tweet.user.screen_name + ' : ' + tweet.text+'\n\n');
  }
}

function getTweets(){
  return client.get('search/tweets', { q: search, count: count, from: profile },
              handleTweets)

}

function getProfile( callback ){
  return client.get('friends/list', { screen_name: profile, count: count },
             handleFriends)
}