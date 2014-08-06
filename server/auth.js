var co = require('co');
var passport = require('koa-passport');
var LocalStrategy = require('passport-local').Strategy;

var models = require('./models');
var User = models.User;

passport.use('local', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
}, function (username, password, done) {
  var conditions = { active: true };

  if (username.indexOf('@') === -1) {
    conditions.username = username;
  } else {
    conditions.email = username;
  }

  co(function* () {
    var user;

    try {
      user = yield User.findOne(conditions).exec();

      if (!user) {
        throw new Error('Unknown user');
      }

      var isValid = user.authenticate(password);

      if (!isValid) {
        throw new Error('Invalid password');
      }

      // Successful authentication
      done(null, user);
    } catch (error) {
      if (error.message === 'Unknown user' || error.message === 'Invalid password') {
        done(null, false, { message: error.message });
      } else {
        done(error);
      }
    }

  })();
}));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findOne()
    .where('_id', id)
    .exec(function(error, user) {
      done(error, user);
    });
});
