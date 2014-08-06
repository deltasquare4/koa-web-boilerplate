var fs = require('fs');

var mongoose = require('mongoose');

var init = function (name, schema, options) {

  // Apply plugins
  if (options && options.plugins) {

    _.forEach(options.plugins, function (pluginName) {
      var plugin = require('./plugins/' + pluginName + '.plugin');
      if (!plugin) {
        throw new Error('Invalid Plugin');
      }

      schema.plugin(plugin);
    });
  }

  // Apply properties
  if (options && options.properties) {
    var properties = options.properties;
    var propNames = _.keys(properties);

    if (propNames.length !== 0) {
      _.forEach(propNames, function (propName) {
        var property = properties[propName];

        if (property.get) {
          schema.virtual(propName).get(property.get);
        }
        if (property.set) {
          schema.virtual(propName).set(property.set);
        }
      });
    }
  }

  // Apply methods
  if (options && options.methods) {
    var methods = options.methods;
    var methodNames = _.keys(methods);

    if (methodNames.length !== 0) {
      _.forEach(methodNames, function (methodName) {
        schema.methods[methodName] = methods[methodName];
      });
    }
  }

  // Apply statics
  if (options && options.statics) {
    var statics = options.statics;
    var staticNames = _.keys(statics);

    if (staticNames.length !== 0) {
      _.forEach(staticNames, function (staticName) {
        schema.statics[staticName] = statics[staticName];
      });
    }
  }

  return mongoose.model(name, schema);
};


var Models = function () {
  var self = this;
  this.models = {};

  this.__proto__ = this.models;
  this.mongoose = mongoose;

  var regExp = new RegExp('.model.js$');
  var files = fs.readdirSync(__dirname);

  // Initialize all the models
  _.forEach(files, function (modelFile) {
    if (regExp.test(modelFile)) {
      var model = require('./' + modelFile);

      if (model.name) {
        var schema = require('./schema/' + model.name.toLowerCase() + '.schema');

        // Register model and cache it in models object
        self.models[model.name] = init(model.name, schema, model.options);
      } else {
        throw new Error(modelFile + ' is not a valid model.');
      }
    }
  });

  log.info('Models initialized.');
};

module.exports = new Models();
