var mongoose = require('mongoose');
var thunkify = require('thunkify');

// Mongo connect
exports.getMongoConnection = function* (config) {
  var connStr = this.getMongoConnStr(config.hosts.join(','), config.database, config.username, config.password);

  mongoose.set('debug', true);

  log.debug("Connecting to %s ...\n", connStr);

  mongoose.connection.on('error', function (error) {
    log.error('Database error', error.stack);
    throw error;
  });

  mongoose.connection.on('close', function () {
    log.warn('Database connection closed');
  });

  mongoose.connection.on('connected', function () {
    log.warn('Database connection open');
  });

  if (mongoose.connection.readyState === 0) {

    yield thunkify(mongoose.connect).call(mongoose, connStr, {
      auto_reconnect: true,
      socketOptions: {
        keepAlive: 1
      }
    });
  }

  return mongoose.connection;
};

// Generate connection string from options
exports.getMongoConnStr = function (url, dbname, dbuser, dbpass) {
  var connStr = 'mongodb://';

  if (dbuser && dbpass) {
    connStr += dbuser + ':' + dbpass + '@' + url + '/' + dbname;
  } else {
    connStr += url + '/' + dbname;
  }

  return connStr;
};

