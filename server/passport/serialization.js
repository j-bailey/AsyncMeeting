"use strict";

module.exports = function(passport) {

    passport.serializeUser(function (user, done) {
        var sessionUser = {_id: user._id, name: user.name, email: user.email, roles: user.roles};
        done(null, sessionUser);
    });

    passport.deserializeUser(function (sessionUser, done) {
        // The sessionUser object is different from the user mongoose collection
        // it's actually req.session.passport.user and comes from the session collection
        done(null, sessionUser);
    });

};