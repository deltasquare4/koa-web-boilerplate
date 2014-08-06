module.exports = function (schema, options) {
  // Hash the password before saving
  schema.pre('save', function (next) {
    this._password = this.password;
    if (!this.isModified('password')) { return next(); }
    this.salt = this.makeSalt();
    this.password = this.encryptPassword(this._password, this.salt);
    next();
  });
};
