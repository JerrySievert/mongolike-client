var pg = require('pg');
var Db = require('./lib/db').Db;


MongoClient = {
  "connect": function (url, callback) {
    var db = new Db("", { url: "" });
    db.url = url;

    db.open(callback);
  }
};


exports.MongoClient = MongoClient;
exports.Db = Db;