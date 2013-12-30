var pg     = require('pg'),
    util   = require('util'),
    events = require('events');

var Collection = require('./collection');

function Db (database, server) {
  events.EventEmitter.call(this);

  this.database = database;
  this.server = server;
  this.url = server.url + database;
}

util.inherits(Db, events.EventEmitter);

Db.prototype.open = function (callback) {
  var client = new pg.Client(this.url);
  var self = this;

  client.connect(function (err) {
    if (err) {
      return console.error('could not connect to postgres, are you sure this is right?', err.toString());
    }

    client.query('SELECT mongolike_version()', function(err, result) {
      if (err) {
        console.error('error running query', err);
        callback('it seems that the mongolike extensions have not been installed');
      } else {
        self.client = client;
        callback(null, self);
      }
    });
  });
};

Db.prototype.close = function (callback) {
  if (this.client) {
    this.client.close();
  }
  this.emit('close');
  callback();
};

Db.prototype.collection = function (name) {
  return new Collection(name, this.client);
};

exports.Db = Db;