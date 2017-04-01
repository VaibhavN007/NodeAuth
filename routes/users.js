var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');

var csrf = require('csurf');
var csrfProtection = csrf();

var router = express.Router();
router.use(csrfProtection);

var User = require('../models/User');

/* Helper functions */

function expressBodyValidation(req, res, next) {
	
	// get form values
	var name = req.body.name;
	var username = req.body.username;
	var email = req.body.email;
	var password1 = req.body.password1;
	var password2 = req.body.password2;

	// form validation
	req.checkBody('name', 'Name Field is required').notEmpty();
	req.checkBody('username', "Username Field is required").notEmpty();
	req.checkBody('email', 'Enter valid email-id').isEmail();
	req.checkBody('password1', "Password Field is required").notEmpty();
	req.checkBody('password2', "Please Confirm password").notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password1);
	// req.checkBody('password1', 'Password must be between 3 to 20 characters').len(3, 20);

	var errors = req.validationErrors();

	if(errors)
	{
		res.render('register', {
			errors: errors
		});
	}
	else
	{
		bcrypt.hash(password1, 10, function(err, hash) {
			if(err) throw err;

			req.body.password1 = hash;
			req.body.password2 = hash;	//	just in case
			next();
		});
	}
}

function isAuthenticated(req, res, next) {
	if(req.isAuthenticated())
	{
		return next();
	}
	res.redirect('/users/login');
}

function isNotAuthenticated(req, res, next) {
	if(req.isAuthenticated())
	{
		res.render('index');
	}
	return next();
}

/* GET users listing. */

router.get('/', function(req, res) {
	res.send('user welcome page');
});

router.get('/register', isNotAuthenticated, function(req, res) {
	res.render('register', {
		csrfToken: req.csrfToken(),
		errors: ""
	});
});

router.post('/register', expressBodyValidation, passport.authenticate('local-signup', {
	successRedirect: '/',
	failureRedirect: '/users/register',
	failureFlash: true
}));


router.get('/profile', function(req, res) {
	res.send('user profile');
});

router.get('/login', isNotAuthenticated, function(req, res) {
	res.render('login', {
		csrfToken: req.csrfToken()
	});
});

router.post('/login', passport.authenticate('local-signin', {
		failureRedirect: '/users/login',
		failureFlash: true
	}),
	function(req, res) {
		res.redirect('/');
});

router.get('/logout', isAuthenticated, function(req, res){
  req.logout();
  res.redirect('/users/login');
});

module.exports = router;
