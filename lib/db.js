var pg     = require('pg'),
    util   = require('util'),
    events = require('events');

var Collection = require('./collection');

/**
 * A callback for a Db Instance.
 *
 * @callback databaseCallback
 * @param {String} error
 * @param {Db} Database Object
 */

/**
 * A callback for a Db Instance closure.
 *
 * @callback closeCallback
 * @param {String} error
 */

/**
 * A Database Connection.
 * @constructor
 * @param {String} database - Name of Database to connect to.
 * @param {Server} server - {@link Server} object describing server to connect to.
 */
function Db (database, server) {
  events.EventEmitter.call(this);

  this.database = database;
  this.server = server;
  this.url = server.url + database;
  this.closed = false;
}

util.inherits(Db, events.EventEmitter);

/**
 * Opens a Database Connection
 * @param {DatabaseCallback} callback to execute when opened or errored.
 */
Db.prototype.open = function (callback) {
  var client = new pg.Client(this.url);
  this.client = client;
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
        callback(null, self);
      }
    });
  });
};

/**
 * Closes a Database Connection
 * @param {closeCallback} callback to execute when closed.
 */
Db.prototype.close = function (callback) {
  if (this.client && this.client.connection) {
    this.client.end(callback);
  }
  this.closed = true;
  this.emit('close');
  callback();
};

/**
 * Return a new {@link Collection}.
 * @param {String} Collection to connect to.
 * @returns Collection
 */
Db.prototype.collection = function (name) {
  return new Collection(name, this.client);
};

exports.Db = Db;