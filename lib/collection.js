var Cursor = require('./cursor').Cursor;

/**
 * A callback for a Document.
 *
 * @callback documentCallback
 * @param {String} error
 * @param {Object} Document Object
 */

/**
 * A callback for a Count.
 *
 * @callback countCallback
 * @param {String} error
 * @param {Number} count
*/

/**
 * A Collection Object.
 * @constructor
 * @param {String} name - Name of the Collection.
 * @param {Object} connection - Connection instance.
 */
function Collection (name, connection) {
  this.name = name;
  this.connection = connection;

  connection.query('SELECT create_collection($1::varchar)', [ name ]);
}

/**
 * Saves a Document
 * @param {Object} document - Document to be saved.
 * @param {documentCallback} callback to execute when closed.
 */
Collection.prototype.save = function (document, callback) {
  this.connection.query('SELECT save($1::varchar, $2::json)', [ this.name, document ]);
  if (callback) {
    callback(null, document);
  }
};

/**
 * Finds a single Document
 * @param {Object} selector - selector to search for.
 * @param {documentCallback} callback to execute when found.
 */
Collection.prototype.findOne = function (selector, callback) {
  selector = selector || { };
  var done = false;

  var query = this.connection.query('SELECT find($1::varchar, $2::json, $2::number)', [ this.name, selector, 1 ]);

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

/**
 * Finds one or more Documents, returns a {@link Cursor}
 * @param {Object} [selector = { }] - selector to search for.
 * @returns Cursor
 */
Collection.prototype.find = function (selector) {
  selector = selector || { };
  var done = false;

  return new Cursor(this.connection, this.name, selector);
};

/**
 * Finds a single Document
 * @param {Object} selector - selector to search for.
 * @param {countCallback} callback to execute when complete.
 */
Collection.prototype.count = function ( /* selector, callback */ ) {
  var selector, callback;
  var args = Array.prototype.slice(arguments);

  callback = args.pop();
  selector = args.pop() || { };

  var query = this.connection.query('SELECT COUNT(find($1::varchar, $2::json)) AS rows', [ this.name, selector ]);

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

/**
 * Drop the collection
 * @param {documentCallback} callback to execute when complete.
 */
Collection.prototype.drop = function (callback) {
  var query = this.connection.query('SELECT drop_collection($1::varchar)', [ this.name ]);
  var done = false;

  var self = this;

  query.on('error', function (error) {
    if (callback) {
      callback(error);
    }
  });

  query.on('row', function ( ) {
    done = true;
    if (callback) {
      callback(null, self);
    }
  });

  query.on('end', function ( ) {
    if (!done && callback) {
      callback(null, self);
    }
  });
};

module.exports = exports = Collection;