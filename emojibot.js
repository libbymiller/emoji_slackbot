var SlackBot = require('slackbots');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Promise = require('bluebird');
var https = require('https');

//if false then it will message instead
var reactToStuff = true;

 
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
    //console.log(message);

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
   console.log(original_message);

   var stopwords = ["and","the"];

   var text = original_message.text;
   text = text.replace(/[\.\,\/#!$%\^&\*;:{}=\-`~\(\)\?\"\'\“]/g," ").toLowerCase();
   text = text.replace(/[\n]/g," \n");
   console.log("text is "+text);
   var arr = text.split(" ");
   var sum = 0,
   stop = arr.length;
   var message_arr = [];

   promiseWhile(function() {
    // Condition for stopping
    return sum < stop;
   }, function() {
      var word = arr[sum];
      if(word.length > 2 && stopwords.indexOf(word)==-1){
       var c = "SELECT val FROM syns where k = '"+word+"' ";
       console.log(c);
       sum++;
       return new Promise(function(resolve) {
        db.all(c, function (err, record) {
         if(err){
            console.log("err is "+err);
         }
         console.log("record is ");
         console.log(record);
         if(record){
           var arr = [];
           for(var i=0; i<record.length; i++){
             arr.push(record[i]["val"]);
           }

           var j = Math.floor(Math.random() * arr.length)
          if(arr[j]){
             message_arr.push(arr[j]);
             console.log("adding",arr[j]);
             resolve(arr[j]);
          }else{
             resolve("");
          }
         }else{
           if(reactToStuff){
             resolve("");
           }else{
             message_arr.push(word);          
             resolve("");
           }
         }
        });
      });
     }else{
       console.log("word is < 2 len",word);
       sum++;
       return new Promise(function(resolve) {
         resolve("");
       });
     }
   }).then(function() {
      console.log("posting message to "+original_message.channel);
      var channel = getChannelById(original_message.channel);
      console.log("channel",channel);
      console.log("message_arr",message_arr);
      if(reactToStuff){
        postReactions(original_message.channel, original_message.ts, message_arr);
      }else{
        console.log(message_arr.join(" "));
        bot.postMessageToChannel(channel, message_arr.join(" "), params);
      }
   }, function(error) {
      console.error("Failed!", error);
   });

}

//reaction code
function postReactions(channel, timestamp, emojis){
   for(var i=0; i< emojis.length; i++){
     if(emojis[i]){
       var e = emojis[i].replace(/\:/g,"");
       var url = "https://slack.com/api/reactions.add?token="+bot.token+"&name="+e+"&channel="+channel+"&timestamp="+timestamp;
       https.get(url, function(res) {
      });
     }
   }
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
