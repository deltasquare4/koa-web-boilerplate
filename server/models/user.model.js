var assert = require('assert');
var crypto  = require('crypto');

var shortid = require('shortid');
var thunkify = require('thunkify');

var statics = {
  createNew: function* (data) {
    var User = this;
    var models = require('./index');

    assert.ok(data, 'data is required');
    assert.ok(data.email, 'Email is required');
    assert.ok(data.password, 'Password is required');

    //Manipulate the user data
    if(data.fullname){
      //Filter out those emtpty spaces
      var names = _.without(data.fullname.split(' '),'');
      data.first_name = names[0];
      if(names[1])
        data.last_name = names[1];
    }

    var user = new User();
    user.active = true;
    // TODO: Send email confirmation message
    // TODO: Set this to true when user visits the confirmation link
    user.confirmed = true;

    // Assign rest of the data
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        user[key] = data[key];
      }
    }

    return yield thunkify(user.save).call(user);
  },
};

var methods = {
  encryptPassword: function (password) {
    if (this.password) {
      // TODO: Switch to bcrypt passwords once it gets supported on Node 0.11 again
      return crypto.createHmac('md5', this.salt).update(password).digest('hex');
    }
    return false;
  },

  authenticate: function (password) {
    return this.encryptPassword(password) === this.password;
  },

  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  },
};

module.exports = {
  name: 'User',
  options: {
    methods: methods,
    statics: statics,
    plugins: ['user']
  }
};
