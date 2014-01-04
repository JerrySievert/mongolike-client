
/**
 * A callback for a Cursor Instance.
 *
 * @callback eachCallback
 * @param {String} error
 * @param {Object} Document
 */

/**
 * A callback for a Cursor Instance.
 *
 * @callback countCallback
 * @param {String} error
 * @param {Number} Count
 */

/**
 * A Cursor.
 * @constructor
 * @param {Db} db - Database connection to use.
 * @param {String} collection - Collection to query against.
 * @param {Object} selector - Document to search against.
 * @param {Object} [fields = { }] - Fields.
 * @param {Object} [options = { }] - Options
 */
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
    var query;

    if (self.limit) {
      if (self.skip) {
        query = self.db.query('SELECT find($1::varchar, $2::json, $3, $4)', [ self.collection, selector, self.limit, self.skip ]);
      } else {
        query = self.db.query('SELECT find($1::varchar, $2::json, $3)', [ self.collection, selector, self.limit ]);
      }
    } else {
      query = self.db.query('SELECT find($1::varchar, $2::json)', [ self.collection, selector ]);
    }

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

/**
 * Rewinds the cursor.
 * @returns {Cursor}
 */
Cursor.prototype.rewind = function ( ) {
  this._current = 0;

  return this;
};

/**
 * Iterates over all the documents for this cursor.
 * @param {eachCallback} callback to execute for each row.
 * @returns {Cursor}
 */
Cursor.prototype.each = function (callback) {
  this._each = callback;

  return this;
};

/**
 * Gives the count of all the documents for this cursor.
 * @param {countCallback} callback to execute for count.
 * @returns {Cursor}
 */
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

Cursor.prototype.limit = function (count, callback) {
  this.limit = count;

  if (callback) {
    callback(null, this);
  }

  return this;
};

Cursor.prototype.skip = function (count, callback) {
  this.skip = count;

  if (callback) {
    callback(null, this);
  }

  return this;
};

exports.Cursor = Cursor;