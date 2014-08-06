var env = process.env.NODE_ENV || 'development';

var config = module.exports = _.defaults(require('./' + env + '.json'), {});
config.env = env;
