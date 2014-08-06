var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = module.exports = new Schema({
  email: { type: String, required: true },
  firstName : String,
  lastName : String,
  password: String,
  salt: String,
  hash: String,
  created: { type: Date, default: Date.now },
  confirmed: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  activation_attemps: { type: Number, default: 0},
  new_email: String,
}, {
  collection: 'users'
});

// Indexes
UserSchema.path('email').index({ unique: true });
