
var controllers = require('./controllers');
// ---------------------
// Interceptors
// ---------------------

// Authorization interceptors
var authOnly = function* (next) {
  var ctx = this;
  if (ctx.isAuthenticated()) {
    // Pre-process organizations for current user
    ctx.locals.orgs = ctx.orgs = _.pluck(ctx.req.user.organizations, 'org');

    // Send params to locals
    ctx.locals.params = ctx.params;

    generatePageMeta(ctx);

    yield next;
  } else {
    // TODO: implement the receptor in passport strategy
    ctx.session.lastUrl = ctx.path;
    ctx.redirect('/signin');
  }
};
var publicOnly = function* (next) {
  var ctx = this;
  if (ctx.isAuthenticated()) {
    // ctx.redirect('/account');Eric.TODO comment for testing
    yield next;
  } else {
    yield next;
  }
};


// ---------------------
// Route Index
// ---------------------

exports.init = function (app) {
  // Home/Dashboard
  app.get('/', controllers.main.getIndex);

  // Authentication and Account
  app.get('/signin', publicOnly, controllers.auth.getSignIn);
  app.post('/signin', publicOnly, controllers.auth.postSignIn);
  app.get('/signup', publicOnly, controllers.auth.getSignUp);
  app.post('/signup', publicOnly, controllers.auth.postSignUp);
  app.get('/logout', authOnly, controllers.auth.getLogOut);
};
