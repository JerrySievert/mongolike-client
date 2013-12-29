var pg = require('pg');
var Connection = require('./lib/connection');

function MongoClient ( ) {
}

var MongoClient = {
  "connect": function (url, callback) {
    console.log("in connect");
    
    var client = new pg.Client(url);
    client.connect(function (err) {
      if (err) {
        return console.error('could not connect to postgres, are you sure this is right?', err.toString());
      }

      client.query('SELECT mongolike_version()', function(err, result) {
        if (err) {
          console.error('error running query', err);
          callback('it seems that the mongolike extensions have not been installed');
        } else {
          callback(null, new Connection(client));
        }
      });
    });
  }
};


exports.MongoClient = MongoClient;