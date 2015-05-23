var login = require('./login');
var emailLogin = require('./email-login');
var signup = require('./signup');

module.exports = function(passport) {
    passport.serializeUser( function (user, done) {
        var sessionUser = { _id: user._id, name: user.name, email: user.email, roles: user.roles };
        done(null, sessionUser);
    });

    passport.deserializeUser( function(sessionUser, done) {
        // The sessionUser object is different from the user mongoose collection
        // it's actually req.session.passport.user and comes from the session collection
        done(null, sessionUser);
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);
    emailLogin(passport);
    signup(passport);
};