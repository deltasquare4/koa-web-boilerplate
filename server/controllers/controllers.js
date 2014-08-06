/*global log */

var fs = require('fs');

var Controllers = function () {
  var self = this;
  this.controllers = {};

  this.__proto__ = this.controllers;

  var regExp = new RegExp('([\\w]+).controller.js$');
  var files = fs.readdirSync(__dirname);

  // Initialize all the controllers
  _.forEach(files, function (controllerFile) {
    if (regExp.test(controllerFile)) {
      var controller = require('./' + controllerFile);

      var name = regExp.exec(controllerFile)[1];
      self.controllers[name] = controller;
    }
  });

  log.info('Controllers initialized.');
};

module.exports = new Controllers();
