"use strict";

var LocalStrategy = require('passport-local').Strategy,
    db = require('../db'),
    User = db.readWriteConnection.model('User'),
    usersHandler = require('../controllers/api/handlers/usersHandler'),
    logger = require('winston');

module.exports = function(passport) {
    //// Generates hash using bCrypt
    //var createHash = function(password) {
    //    return User.hashPassword(password);
    //};

    passport.use('signup', new LocalStrategy({
                passReqToCallback: true // allows us to pass back the entire request to the callback
            },
            function(req, username, password, done) {
                var findOrCreateUser = function() {
// find a user in Mongo with provided username
                    User.findOne({ 'username': req.body.username }, function(err, user) {
// In case of any error, return using the done method
                        if (err){
                            logger.error('Error in SignUp: ' + err);
                            return done(err);
                        }
// already exists
                        if (user) {
                            logger.error("User already exists with username '" + username + "'!");
                            return done(null, false, { message: "User already exists with username '" + username + "'!" });
                        }
                        else {
                            var email = req.body.email;
// check if there is a user with that email
                            User.findOne({ 'email': email }, function(err, user) {
                                if (err) {
                                    logger.error("Error in SignUp: " + err);
                                    return done(err);
                                }

                                if (user) {
                                    logger.error("User already exists with email: '" + email + "'!");
                                    return done(null, false, { message: "User already exists with email: " + email });
                                }
// create the user
                                var newUser = new User();
// set the user's local credentials
                                newUser.username = username;
                                //newUser.password = createHash(password);
                                newUser.password = password;
                                newUser.email = req.body.email;
                                newUser.firstName = req.body.firstName;
                                newUser.lastName = req.body.lastName;
// save the user
                                usersHandler.createNewSignedUpUser(newUser).then(function(savedUser) {
                                    return done(null, savedUser);
                                }).fail(function(err){
                                    if (err){
                                        return done(null, false, err);
                                    }
                                });

                            });
                        }
                    });
                };
// Delay the execution of findOrCreateUser and execute the method
// in the next tick of the event loop
                process.nextTick(findOrCreateUser);
            })
    );
};
