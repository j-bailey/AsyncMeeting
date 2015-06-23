var login = require('./login'),
    emailLogin = require('./email-login'),
    signup = require('./signup'),
    bearer = require('./bearerAuthorization'),
    serialization = require('./serialization');

module.exports = function(passport) {
    serialization(passport);
    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);
    emailLogin(passport);
    signup(passport);
    bearer(passport);
};
