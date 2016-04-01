var SlackBot = require('slackbots');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Promise = require('bluebird');
 
// create a bot 
var bot = new SlackBot({
    token: process.env.BOT_API_KEY, 
    name: 'emojibot'
});

    
var dbname = path.resolve(__dirname, 'emojibot.db');
var db;

 
bot.on('start', function() {
    console.log("starting");
    connectDB();
    
});

/**
 * @param {object} data
 */
bot.on('message', function(message) {
    // all ingoing events https://api.slack.com/rtm 
    console.log(message);

    var params = {
        icon_emoji: ':scream_cat:'
    };

    if (isChatMessage(message) && !isFromMe(message)){
      reply(message, params);
    }

});

function connectDB(){
    if (!fs.existsSync(dbname) ){
        console.log("no db");
        process.exit(1);
    }
    db = new SQLite.Database(dbname);
}


function reply(original_message, params){



   var text = original_message.text;
   text = text.replace(/[\.\,\/#!$%\^&\*;:{}=\-`~\(\)\?\"\'\“]/g," ").toLowerCase();
   console.log("text is "+text);
   var arr = text.split(" ");
   var sum = 0,
   stop = arr.length;
   console.log("stop is "+stop);
   var message_arr = [];

   promiseWhile(function() {
    // Condition for stopping
    return sum < stop;
   }, function() {
      console.log("in promise");
      var c = "SELECT val FROM syns where k = '"+arr[sum]+"' ";
      console.log(c);
      sum++;
      return new Promise(function(resolve) {
       db.all(c, function (err, record) {
        if(err){
           console.log("err is "+err);
        }
        console.log("record is ");
        console.log(record);
        if(record && record[0] && record[0]["val"]){
          message_arr.push(record[0]["val"]);
          resolve(record[0]["val"]);
        }else{
          resolve("");
        }
       });
      });
   }).then(function() {
      console.log("posting message to "+original_message.channel);
      console.log(message_arr.join(" "));
      var channel = getChannelById(original_message.channel);
      console.log("channel "+channel);
      bot.postMessageToChannel(channel, message_arr.join(" "), params);
   }, function(error) {
      console.error("Failed!", error);
   });

}

///promises stuff

var promiseWhile = function(condition, action) {
    var resolver = Promise.defer();

    var loop = function() {
        if (!condition()) return resolver.resolve();
        return Promise.cast(action())
            .then(loop)
            .catch(resolver.reject);
    };

    process.nextTick(loop);

    return resolver.promise;
};


function isChatMessage(message) {
    return message.type === 'message' && Boolean(message.text);
}

function isChannelConversation(message) {
    return typeof message.channel === 'string' &&
        message.channel[0] === 'C'
        ;
}

function isFromMe(message) {
    return message.username === bot.name;
}


function getChannelById(channelId) {
    for(var i = 0; i < bot.channels.length; i++){
       var item = bot.channels[i];
       if(item.id === channelId){
          return item.name;
       }
    }
};

