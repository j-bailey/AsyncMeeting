"use strict";

var BearerStrategy = require('passport-http-bearer').Strategy,
    logger = require('winston'),
    securityUtils = require('../security/securityUtils');

module.exports = function (passport) {
// Use the BearerStrategy within Passport.
//   Strategies in Passport require a `validate` function, which accept
//   credentials (in this case, a token), and invoke a callback with a user
//   object.
    passport.use(new BearerStrategy({},
        function (token, done) {
            // Find the user by token.  If there is no user with the given token, set
            // the user to `false` to indicate failure.  Otherwise, return the
            // authenticated `user`.  Note that in a production-ready application, one
            // would want to validate the token for authenticity.
            logger.debug('Bearer token check: ' + token);
            securityUtils.isValidToken(token).then(function(exists) {
                if (exists) {
                    logger.debug('found a token');
                    done(null, true);
                } else {
                    logger.debug('No token found');
                    done(null, false);
                }
            }).catch(function(err){
                done(err, 'error');
            });
        }
    ));
};
