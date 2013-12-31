

function Cursor (db, collection, selector, fields, options) {
  this.db = db;
  this.collection = collection;
  this.selector = selector;
  this.fields = fields;
  this.options = options;

  var self = this;

  this._done = false;
  this._ready = true;
  this._rows = [ ];
  this._current = 0;
  this.closed = false;

  process.nextTick(function ( ) {
    var query = self.db.query('SELECT find($1::varchar, $2::json)', [ self.collection, selector ]);

    query.on('error', function (error) {
      self._done = true;
      self._error = error;
    });

    query.on('row', function (row) {
      self._rows.push(row.find);
      if (self._each) {
        self._each(null, row.find);
      }
    });

    query.on('end', function (result) {
      self._done = true;
      if (self._count) {
        self._count(null, self._rows.length);
      }
      if (self._toArray) {
        self._toArray(null, self._rows);
      }
    });

  });
}

Cursor.prototype.each = function (callback) {
  this._each = callback;

  return this;
};

Cursor.prototype.count = function (callback) {
  this._count = callback;

  return this;
};

Cursor.prototype.toArray = function (callback) {
  this._toArray = callback;

  return this;
};

Cursor.prototype.close = function (callback) {
  this._toArray = null;
  this._count = null;
  this._each = null;
  this.closed = true;

  callback(null, this);

  return this;
};

Cursor.prototype.isClosed = function ( ) {
  return this.closed;
};

exports.Cursor = Cursor;