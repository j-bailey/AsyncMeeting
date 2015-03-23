var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var bCrypt = require('bcrypt-nodejs');
var logger = require('winston');

module.exports = function(passport){
    passport.use('email-login', new LocalStrategy({
                usernameField: 'email',
                passReqToCallback : true
            },
            function(req, email, password, done) {
// check in mongo if a user with email exists or not
                User.findOne({ 'email' : email },
                    function(err, user) {
// In case of any error, return using the done method
                        if (err)
                            return done(err);
// Username does not exist, log the error and redirect back
                        if (!user){
                            logger.debug('User Not Found with email '+email);
                            return done(null, false, req.flash('message', 'User Not found.'));
                        }
// User exists but wrong password, log the error
                        if (!isValidPassword(user, password)){
                            logger.debug('Invalid Password');
                            return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
                        }
// User and password both match, return user from done method
// which will be treated like success
                        return done(null, user);
                    }
                );
            })
    );
    var isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
    }
}