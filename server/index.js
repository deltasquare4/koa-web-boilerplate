var bunyan = require('bunyan');
var co = require('co');

var koa = require('koa');
var router = require('koa-router');
var bodyParser = require('koa-bodyparser');
var compose = require('koa-compose');
var errorHandler = require('koa-error');
var session = require('koa-sess');
var redisStore = require('koa-redis');
var serve = require('koa-static');
var logger = require('koa-logger');
var passport = require('koa-passport');
var flash = require('koa-flash');
var locals = require('koa-locals');
var views = require('koa-views');

var app = module.exports = koa();

// Initialize global log
global.log = bunyan.createLogger({ name: "CL" });
global._ = require('lodash');

var config = require('./config');
var helper = require('./helper');
var controllers = require('./controllers');


app.init = co(function *() {
  // initialize mongodb and populate the database with seed data if empty
  app.dbConn = yield helper.getMongoConnection(config.mongodb);

  // Initialize authentication strategies
  require('./auth');

  // Set cookie encryption key(s)
  app.keys = [config.server.secret];
  var viewsPath = __dirname + '/views';
  locals(app, {
    root: __dirname,
    name: 'Koa Web Boilerplate',
    basedir: viewsPath,
    useLiveReload: process.env.USE_LIVERELOAD,
  });

  // Initialize Middlewares in order of execution
  var middlewares = compose([
    errorHandler(),
    logger(),
    serve(__dirname + '/../client'),
    bodyParser(),
    session({
      store: redisStore(config.redis)
    }),
    flash(),
    passport.initialize(),
    passport.session(),
    function* (next) {
      var ctx = this;
      // Merge flash data into locals only for GET
      if (ctx.method === 'GET') {
        var flash = ctx.flash;
        _.forIn(flash, function (val, key) {
          ctx.locals[key] = val;
        });
      }

      // Inject user object into locals
      if (ctx.isAuthenticated()) {
        ctx.locals.isLoggedIn = true;
      } else {
        ctx.locals.isLoggedIn = false;
      }
      ctx.locals.user = ctx.req.user;

      yield next;
    },
    views(viewsPath, {
      default: 'jade'
    }),
    router(app),
  ]);

  // Initialize middlewares
  app.use(middlewares);

  // Initialize controllers
  controllers.init(app);

  // Create http server and start listening for requests
  app.server = app.listen(config.server.port);
  if (config.env !== 'test') {
    log.info('Server listening on port ' + config.server.port);
  }
});

// Error logging with context
app.on('error', function(error, context) {
  log.error(error, '%s %s: "%s"', context.method, context.path, context.message);
});
