var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-parser'); 
var User = require('../models/User');

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

// LocalStrategy(config-object, callback);
passport.use('local-signup', new LocalStrategy({
	usernameField: 'username',
	passwordField: 'password1',
	passReqToCallback: true
}, function(req, username, password, done){
	User.findOne({ 'email': req.body.email }, function(err, user) {
		
		if(err)
			return done(err);
		if(user) {
			console.log('email already used, enable flash message in template to see the error message');
			return done(null, false, {message: 'Email already exists'});
		}
		
		var newUser = new User();
		newUser.name = req.body.name;
		newUser.email = req.body.email;
		newUser.password = req.body.password1;
		newUser.username = req.body.username;

		newUser.save(function(err, result) {
			if(err)
				return done(err);

			return done(null, newUser);
		});

	});
}));

passport.use('local-signin', new LocalStrategy(

	function(username, password, done) {

		User.getUserByUsername(username, function(err, user) {
			if(err) return done(err);

			if(!user) {
				return done(null, false, {message: "Incorrect username"});
			}

			if(User.comparePassword(password, user.password, function(err, isMatch) {
				if(err) throw err;
				if(!isMatch)
					return done(null, false, {message: "Incorrect password"});
				return done(null, user);
			}));
		});
	}
));
