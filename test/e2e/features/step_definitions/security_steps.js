var db = require('../../../../server/db');
var User = require('../../../../server/models/user');
var bcrypt = require('bcrypt-nodejs');
var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

var email = 'user@user.com';
var pass = 'password#123';

var steps = function () {

    this.Given(/^I have a valid and active account with username (.*), email (.*), and password (.*)$/, function (username, email, password, next) {
        db.adminConnection.db.dropCollection('users', function (err, result) {
            //if (err) next(err);
            var user = new User({ email: email, username: username });
            user.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
            user.save(function (err) {
                if (err) {
                    return next(err)
                }
                //acl.getAcl().addUserRoles(user.username, freeTierRole.key);
                next();
            })
        });
    });

    this.Given(/^I am logged into the sysyetm$/, function (next) {
        // Write code here that turns the phrase above into concrete actions
        next.pending();
    });

    this.Given(/^I am logged out of the system$/, function (next) {
        browser.get('http://localhost:3001');  // click 'login'

        //expect(browser.getCurrentUrl()).to.eventually.be('http://localhost:3001');
        expect(element(By.css('nav .login')).isPresent()).to.eventually.be.true.and.notify(next);
    });

    this.When(/^I logout$/, function (next) {
        // Write code here that turns the phrase above into concrete actions
        next.pending();
    });

    this.Given(/^I request to authenticate myself$/, function (next) {
        element(By.css('nav .login')).click().then(next); // fill out and submit registration form ' +
    });

    this.When(/^I provide my credentials of username (.*), email (.*), and password (.*)$/, function (username, email, password, next) {
        element(By.model('loginModel.email')).sendKeys(email);
        element(By.model('loginModel.password')).sendKeys(password);
        element(By.css('form .btn')).click().then(next);
    });

    this.When(/^I provide my credentials$/, function (next) {
        element(By.model('loginModel.email')).sendKeys(email);
        element(By.model('loginModel.password')).sendKeys(pass);
        element(By.css('form .btn')).click().then(next);
    });

    this.Then(/^I should have access to my account$/, function (next) {
        expect(element(By.css('h1')).getText()).to.eventually.equal('My Meeting Areas').and.notify(next);
    });

    this.Given(/^I have an invalid account$/, function (next) {
        db.adminConnection.db.dropCollection('users', function (err, result) {
            //if (err) next(err);
            var user = new User({ email: email + 1, username: 'user1' });
            user.password = bcrypt.hashSync(pass, bcrypt.genSaltSync(10), null);
            user.save(function (err) {
                if (err) {
                    return next(err)
                }
                //acl.getAcl().addUserRoles(user.username, freeTierRole.key);
                next();
            })
        });
    });

    this.Then(/^I should be denied access to my account$/, function (next) {
        expect(element(By.css('nav .login')).isPresent()).to.eventually.be.true.and.notify(next);
    });

    this.Given(/^System does not have any registration credentials$/, function (next) {
        db.adminConnection.db.dropCollection('users', function (err, result) {
            //if (err) next(err);
            next();
        });
    });

    this.Given(/^I am at registration point$/, function (next) {
        browser.get('http://localhost:3001');  // click 'login'
        //expect(browser.getCurrentUrl()).to.eventually.be('http://localhost:3001');
        element(By.css('nav .register')).click().then(next);
    });

    this.When(/^I provide an invalid registration value of (.*) in field (.*)$/, function (value, field, next) {
        element(By.model('registerModel.' + field)).sendKeys(value);
        if (field != 'username') {
            element(By.model('registerModel.username')).sendKeys('username');
        }
        if (field != 'password') {
            element(By.model('registerModel.password')).sendKeys('Password#123');
        }
        if (field != 'email') {
            element(By.model('registerModel.email')).sendKeys('email@email.com');
        }
        next();
    });

    this.Given(/^I submit for registration$/, function (next) {
        var self = this;
        element(By.css('form .btn')).click().then(next);
    });

    this.Then(/^The screenshot will look like invalid registration reference image for invalid field (.*) with value (.*)$/, function (field, value, next) {
        // Write code here that turns the phrase above into concrete actions
        next().pending();
    });

    this.Given(/^I provide my email (.*) for registration$/, function (email, next) {
        element(By.model('registerModel.email')).sendKeys(email).then(next);
    });

    this.Given(/^I provide my password (.*) for registration$/, function (password, next) {
        element(By.model('registerModel.password')).sendKeys(password).then(next);
    });

    this.Given(/^I reconfirm my password (.*) for registration$/, function (password, next) {
        next.pending();
    });

    this.Then(/^I see a registration confirmation$/, function (next) {
        next.pending();
    });

    this.When(/^I provide my username (.*) for registration$/, function (username, next) {
        element(By.model('registerModel.username')).sendKeys(username).then(next);
    });

    this.Then(/^I see password strength of (.*)$/, function (strength, next) {
        // Write code here that turns the phrase above into concrete actions
        next.pending();
    });

    this.Given(/^I see a message of being an unacceptable password$/, function (next) {
        // Write code here that turns the phrase above into concrete actions
        next.pending();
    });

    this.Given(/^I see no message of being an unacceptable password$/, function (next) {
        // Write code here that turns the phrase above into concrete actions
        next.pending();
    });

    this.Then(/^I see logout message stating "([^"]*)"$/, function (arg1, next) {
        // Write code here that turns the phrase above into concrete actions
        next.pending();
    });

    this.Then(/^I see a link to log back in$/, function (next) {
        // Write code here that turns the phrase above into concrete actions
        next.pending();
    });


    this.Then(/^I am offered to login to the system$/, function (next) {
        browser.waitForAngular();
        expect(element(By.className('form-signin-heading')).getText()).to.eventually.equal('Please sign in');
        expect(element(By.className('register')).getText()).to.eventually.equal('Register');
        expect(element(By.className('login')).getText()).to.eventually.equal('Login');
        next();
    });
};

module.exports = steps;
