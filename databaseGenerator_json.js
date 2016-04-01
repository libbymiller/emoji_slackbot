'use strict';

var fs = require("fs");
var file = "emojibot.db";
var exists = fs.existsSync(file)
var parsedJSON = require('./emojis.json');

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);
var syns = [];

var emoji_list =[];

  for (var prop in parsedJSON) {
    if (parsedJSON.hasOwnProperty(prop)) {
      var vv = ":"+prop+":";
      var arr = parsedJSON[prop]["keywords"]
      emoji_list.push(prop);
      syns.push([prop,vv]);
      console.log(arr);
      if(arr && arr.length > 1){
        for(var i = 1; i < arr.length; i++){
          syns.push([arr[i],vv]);
        }
      }
    }
  }



db.serialize(function() {
  console.log("ok "+emoji_list.length);
  if(!exists) {
    db.run('CREATE TABLE IF NOT EXISTS emoji (k TEXT PRIMARY KEY, val TEXT DEFAULT NULL)');
    db.run('CREATE TABLE IF NOT EXISTS syns (k TEXT KEY, val TEXT DEFAULT NULL)');
  }
  var stmt = db.prepare("INSERT INTO emoji (k,val) VALUES (?,?)");
  var stmt2 = db.prepare("INSERT INTO syns (k,val) VALUES (?,?)");

//Insert data
  for(var i=0; i < emoji_list.length; i++){
    var key = emoji_list[i];
    console.log(key);
    var val = ":"+key+":";
    stmt.run(key, val); 
  }
  stmt.finalize();

//Insert data

  for(var i=0; i < syns.length; i++){
    var key = syns[i][0];
    var val = syns[i][1];
    console.log(key);
    console.log(val);
    stmt2.run(key, val); 
  }
  stmt2.finalize();

//read it back
/*
  db.each("SELECT rowid AS id, k, val FROM emoji", function(err, row) {
    console.log(row.id + " emoji " + row.k + ": " +row.val);
  });

  db.each("SELECT rowid AS id, k, val FROM syns", function(err, row) {
    console.log(row.id + " - syns - " + row.k + ": " +row.val);
  });
*/
});
            
db.close();


