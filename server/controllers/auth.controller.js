var passport = require('koa-passport');
var v = require('validator');
var thunkify = require('thunkify');

var models = require('../models');
var User = models.User;

// Route definitions
exports.getSignIn = function* (next) {
  yield this.render('auth/signin');
};

exports.postSignIn = function* (next) {
  var ctx = this;
  var body = ctx.request.body;

  // Sanitize
  body.username = v.trim(body.username).toLowerCase();

  // body.email = body.username;
  // Validate
  var errors = [];
  if (v.isNull(body.username)) {
    errors.push(['username', 'required']);
  }
  if (v.isNull(body.password)) {
    errors.push(['password', 'required']);
  }
  if (body.username.indexOf('@') !== -1 && !v.isEmail(body.username)) {
    errors.push(['username', 'Invalid email address']);
  }
  if (errors.length > 0) {
    delete body.password;
    ctx.flash = _.defaults({ errors: _.zipObject(errors) }, body);
    return ctx.redirect('/signin');
  }

  yield passport.authenticate('local', function* (error, user, info) {
    if (error) { throw error; }
    if (user === false) {
      errors.push(['error', 'Invalid username/email and password combination']);
      ctx.flash = _.defaults({ errors: _.zipObject(errors) }, body);
      ctx.redirect('/signin');
    } else {
      yield ctx.login(user);
      ctx.redirect('/');
    }
  }).call(this, next);
};

exports.getSignUp = function* (next) {
  yield this.render('auth/signup');
};

exports.postSignUp = function* (next) {
  var ctx = this;
  var body = ctx.request.body;

  // Sanitize input
  body.email = v.trim(body.email).toLowerCase();
  if (!v.isNull(body.fullname)) {
    body.fullname = v.trim(body.fullname);
  }

  body.orgName = v.trim(body.orgName).toLowerCase();

  // Validate
  var errors = [];

  //full name is optinal field
  if(!v.isNull(body.fullname)){
    if (!v.isLength(body.fullname, 2)) {
      errors.push(['fullname', 'Full name must be at least 2 characters long']);
    }else if(!v.isLength(body.fullname, 2, 31)){
      errors.push(['fullname', 'Full name can\'t be longer than  31 characters']);
    }else if (!/^[a-zA-Z0-9]+[ ]*[a-zA-Z0-9]+$/.test(body.fullname)) {
        errors.push(['fullname', 'Use only letters, numbers for fullname and space as separator']);
    }
  }
  if (v.isNull(body.email)) {
    errors.push(['email', 'required']);
  } else if (!v.isEmail(body.email)) {
    errors.push(['email', 'Invalid email address']);
  }
  if (v.isNull(body.password)) {
    errors.push(['password', 'required']);
  } else if (!v.isLength(body.password, 8)) {
    errors.push(['password', 'Password must be at least 8 characters long']);
  }
  if (v.isNull(body.orgName)) {
    errors.push(['orgName', 'required']);
  } else if (!/^[a-zA-Z0-9\-\_]+$/.test(body.orgName)) {
    errors.push(['orgName', 'Use only letters, numbers, \'-\', \'_\'']);
  }
  if (errors.length > 0) {
    delete body.password;
    ctx.flash = _.defaults({ errors: _.zipObject(errors) }, body);
    return ctx.redirect('/');
  }

  try {
    yield User.createOwner(body);
    var successMessage = 'We have sent you an email for verification to ' + body.email + '. Please click on the link in the email to continue.';
    ctx.flash = { success: successMessage };
  } catch (error) {
    if (v.contains(error.message, 'E11000')) {
      if (v.contains(error.message, 'organizations.$name')) {
        errors.push(['orgName', 'Duplicate organization name']);
      }
      else if (v.contains(error.message, 'users.$email')) {
        errors.push(['email', 'Duplicate email address']);
      }
    } else {
      log.error(error);
      errors.push(['error', 'Unknown error occurred. Please contact support.']);
    }
    if (errors.length > 0) {
      delete body.password;
      ctx.flash = _.defaults({ errors: _.zipObject(errors) }, body);
      return ctx.redirect('/');
    }
  }

  ctx.redirect('/signin');
};

exports.getLogOut = function (next) {
  var ctx = this;
  ctx.logout();
  ctx.redirect('/');
};

