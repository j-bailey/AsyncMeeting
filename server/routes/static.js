var express = require('express');
var router = express.Router();
var passport = require('passport');

var isAuthenticated = function (req, res, next) {
// if user is authenticated in the session, call the next() to call the next request handler
// Passport adds this method to request object. A middleware is allowed to add properties to
// request and response objects
    if (req.isAuthenticated())
        return next();
// if the user is not authenticated then redirect him to the login page
    res.redirect('/');
}

router.use(express.static(__dirname + '/../../assets'));

router.get('/', function (req, res) {
    res.sendfile('client/ng/layouts/app.html')
});

/* Handle Login POST */
router.post('/login', passport.authenticate('login', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash : true
}));

/* GET Registration Page */
router.get('/signup', function(req, res){
    res.render('register',{message: req.flash('message')});
});

/* Handle Registration POST */
router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/',
    failureRedirect: '/#register',
    failureFlash : true
}));


module.exports = router;

