var Collection = require('./collection');

function Connection (client) {
  this.connection = client;
}

Connection.prototype.close = function ( ) {
  if (this.connection) {
    this.connection.close();
  }
  this.url = null;
};

Connection.prototype.collection = function (name) {
  return new Collection(name, this.connection);
};

module.exports = exports = Connection;