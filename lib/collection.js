var Cursor = require('./cursor').Cursor;

function Collection (name, connection) {
  this.name = name;
  this.connection = connection;

  connection.query('SELECT create_collection($1::varchar)', [ name ]);
}

Collection.prototype.save = function (document, callback) {
  this.connection.query('SELECT save($1::varchar, $2::json)', [ this.name, document ]);
  if (callback) {
    callback(null, document);
  }
};

Collection.prototype.findOne = function (document, callback) {
  document = document || { };
  var done = false;

  var query = this.connection.query('SELECT find($1::varchar, $2::json, $2::number)', [ this.name, document, 1 ]);

  query.on('error', function (error) {
    callback(error);
  });

  query.on('row', function (row) {
    done = true;
    if (callback) {
      callback(null, row);
    }
  });

  query.on('end', function (result) {
    if (!done) {
      if (callback) {
        callback(null, result);
      }
    }
  });
};

Collection.prototype.find = function (document, callback) {
  document = document || { };
  var done = false;

  return new Cursor(this.connection, this.name, document);
};

Collection.prototype.count = function ( /* document, callback */ ) {
  var document, callback;
  var args = Array.prototype.slice(arguments);

  callback = args.pop();
  document = args.pop() || { };

  var query = this.connection.query('SELECT COUNT(find($1::varchar, $2::json)) AS rows', [ this.name, document ]);

  query.on('error', function (error) {
    if (callback) {
      callback(error);
    }
  });

  query.on('row', function (row) {
    if (callback) {
      callback(null, row.rows);
    }
  });
};

Collection.prototype.drop = function (callback) {
  var query = this.connection.query('SELECT drop_collection($1::varchar)', [ this.name ]);
  var done = false;

  query.on('error', function (error) {
    if (callback) {
      callback(error);
    }
  });

  query.on('row', function ( ) {
    done = true;
    if (callback) {
      callback(null);
    }
  });

  query.on('end', function ( ) {
    if (!done && callback) {
      callback(null);
    }
  });
};

module.exports = exports = Collection;