
exports.getIndex = function *(next) {
  var ctx = this;

  // Show Home Page
  yield ctx.render('main/index');
};
