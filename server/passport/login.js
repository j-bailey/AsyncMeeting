"use strict";

var LocalStrategy = require('passport-local').Strategy;
var db = require('../db');
var User = db.readOnlyConnection.model('User');
var logger = require('winston');
var scrypt = require("scrypt");

scrypt.verify.config.keyEncoding = "utf8";
scrypt.verify.config.hashEncoding = "hex";

module.exports = function(passport) {
    var isValidPassword = function(user, password) {
        return scrypt.verify(user.password, password);
    };

    passport.use('login', new LocalStrategy({
                passReqToCallback: true
            },
            function(req, username, password, done) {
// check in mongo if a user with username exists or not
                logger.log('searching for user ' + username);
                User.findOne({ 'username': username },
                    function(err, user) {
// In case of any error, return using the done method
                        logger.log('found user = ' + JSON.stringify(user));
                        if (err) {
                            return done(err);
                        }
// Username does not exist, log the error and redirect back
                        if (!user){
                            logger.debug('User Not Found with username ' + username);
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
};
