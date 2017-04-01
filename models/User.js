var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/nodeauth');

var db = mongoose.connection;

var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String
	},
	name: String,
	email: String
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback) {
	bcrypt.hash(newUser.password, 10, function(err, hash) {
		if(err) throw err;
		newUser.password = hash;
		newUser.save(callback);
	});
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
};

module.exports.getUserByUsername = function(username, callback){
	User.findOne({username: username}, callback);
};

module.exports.emailAlreadyExists = function(email, callback){
	
	User.find({ email: email }, function(err, user) {

		if(user.length) {
			callback('Email Already Exists', null);
		} else {

		}

	});

	var person = User.find({email: email});
	if(person) {
		console.log('email found ----', person);
		return true;
	}
	else
		return false;
}

module.exports.existingEmail = function() {
	
}

module.exports.comparePassword = function(password, hash, callback) {

	bcrypt.compare(password, hash, function(err, isMatch) {
		if(err) return callback(err, false);
		return callback(null, isMatch);
	});
}