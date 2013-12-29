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
    return;
  });

  query.on('row', function (row) {
    done = true;
    callback(null, row);
    return;
  });

  query.on('end', function (result) {
    if (done) {
      return;
    } else {
      callback(null, result);
    }
  });
};

module.exports = exports = Collection;