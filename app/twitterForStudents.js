var Twit = require('twit');
var client = new Twit({
  consumer_key: 'aGvgbxGtSKTWdcxGf3paz90Kq',
  consumer_secret: 'PJwjJPJFUuWuEvzyj3G2fxbfy7yvFb00mRd45rRrKtJ4Ea39rj',
  access_token: '221331440-s4Bgw21Z9xhlGe8QuGphtKjx0ZXg4h3sEYNUERff',
  access_token_secret: 'LlQCF7QCj5UOlli8LSU4BhAnF9ouiJliSZ7bFeOqm36p9',
  timeout_ms: 60*1000,
});

// placeholder variables
var profile = form.elements[0].value,
    keyword = form.elements[1].value,
    count = form.elements[2].value,
    date = form.elements[3].value,
    lan = 'en',
    search = keyword + " since:" + date + " lang:" + lan;

checkCount(count);
var tweets = getTweets();
var profiles = getProfile();
console.log('Started')

function checkCount(count){
  if (count > 100 ) {
    count == 100;
  } else {
    count == count;
  }
}

// function for handling the tweets
function handleTweets(err, data){
  if (err) {
    console.error('Get error', err)
  }  
  else {
    console.log('Get Tweets');
    sortTweets(data);
    console.log('Finished');
  }
}

// fucntion for handling the friends/profiles
function handleFriends(err, data){
  if (err) {
    console.error('Get error', err)
  }  
  else {
    console.log('Get Friends');
    sortTweets(data);
    console.log('Finished');
  }
}

// function for sorting through the tweets to return relevant information
function sortTweets (data) {
  for (var indx in data.statuses){
    var tweet = data.statuses[indx];
    console.log('on: ' + tweet.created_at + ' : @' + tweet.user.screen_name + ' : ' + tweet.text+'\n\n');
  }
}

// function for searching through twitter using the specified data
function getTweets(){
  return client.get('search/tweets', { q: search, count: count, from: profile },
              handleTweets)

}

function getProfile( callback ){
  return client.get('friends/list', { screen_name: profile, count: count },
             handleFriends)
}