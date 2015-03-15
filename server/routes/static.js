var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('jwt-simple');
var config = require('../../config');
var User = require('../../server/models/user');

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
    res.sendfile('client/index.html')
});

/* Handle Login POST */
router.post('/login',
    passport.authenticate('login'),
    function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        // If this function gets called, authentication was successful.
        // `req.user` contains the authenticated user.
        var token = jwt.encode({username: req.user.username}, config.secret)
        User.findPublicUserById(req.user._id).then(function(user) {
            res.json({user:user, token: token, permissions:['CanReadMeetingAreas', 'CanCreateMeetingAreas', 'CanViewMeetingAreas', 'CanDeleteMeetingAreas']});
        });
    }
);

/* GET Registration Page */
router.get('/signup', function(req, res){
    res.render('register',{message: req.flash('message')});
});

/* Handle Registration POST */
router.post('/signup',
    passport.authenticate('signup'),
    function(req, res) {
        res.setHeader('Content-Type', 'application/json');
        var un = req.user.username;
        var user = User.findPublicUserByUserName(req.user.username).then (function(user){
            console.log('Found user by name during register = ' + user);
            res.json(user);  // TODO user is missing roles and permissions need to fix in passport signup code
        });
    }
);


module.exports = router;

