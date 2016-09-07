var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var User = new mongoose.Schema({
  github_id: Number,
  github_username: String
});

User.plugin(findOrCreate);

module.exports = mongoose.model('User', User);
