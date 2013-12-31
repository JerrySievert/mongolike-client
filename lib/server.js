/**
 * A Server Object.
 * @constructor
 * @param {String} host - Name of Host to connect to.
 * @param {String} port - Port to connect to.
 * @param {Object} [options={ }] - Connection options.
 */
 function Server (host, port, options) {
  options = options || { };

  this.host = host;
  this.port = port;
  this.options = options;

  var url = 'postgres://';
  if (options.username !== null && options.username !== undefined) {
    url += options.username;
  }
  if (options.password !== null && options.password !== undefined) {
    if (options.username !== null && options.username !== undefined) {
      url += ':' + options.password;
    } else {
      url += 'postgres:' + options.password;
    }
  }
  if (options.username !== null && options.username !== undefined ||
    options.password !== null && options.password !== undefined) {
    url += '@';
  }
  url += host;
  if (port) {
    url += ':' + port;
  }
  url += '/';

  this.url = url;
}

exports.Server = Server;