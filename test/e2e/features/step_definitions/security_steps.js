var db = require('../../../../server/db');
var User = require('../../../../server/models/user');
var bcrypt = require('bcrypt-nodejs');
var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;
var acl = require('../../../../server/security/acl');
var freeTierRole = require('../../../../server/security/resources/free-tier-role');

var email = 'user@user.com';
var pass = 'password#123';

var steps = function () {

    this.Given(/^I have a valid and active account with username (.*), email (.*), and password (.*)$/, function (username, email, password, next) {
        db.connection.db.dropCollection('users', function (err, result) {
            //if (err) next(err);
            var user = new User({email: email, username: username});
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


    this.Given(/^I am logged out of the system$/, function (next) {
        browser.get('http://localhost:3001');  // click 'login'
        //expect(browser.getCurrentUrl()).to.eventually.be('http://localhost:3001');
        expect(element(by.css('nav .login')).isPresent()).to.eventually.be.true.and.notify(next);
    });

    this.Given(/^I request to authenticate myself$/, function (next) {
        element(by.css('nav .login')).click().then(next); // fill out and submit registration form ' +
    });

    this.When(/^I provide my credentials of username (.*), email (.*), and password (.*)$/, function (username, email, password, next) {
        element(by.model('loginModel.email')).sendKeys(email);
        element(by.model('loginModel.password')).sendKeys(password);
        element(by.css('form .btn')).click().then(next);
    });

    this.When(/^I provide my credentials$/, function (next) {
        element(by.model('loginModel.email')).sendKeys(email);
        element(by.model('loginModel.password')).sendKeys(pass);
        element(by.css('form .btn')).click().then(next);
    });

    this.Then(/^I should have access to my account$/, function (next) {
        expect(element(by.css('h1')).getText()).to.eventually.equal('My Meeting Areas').and.notify(next);
    });

    this.Given(/^I have an invalid account$/, function (next) {
        db.connection.db.dropCollection('users', function (err, result) {
            //if (err) next(err);
            var user = new User({email: email + 1, username: 'user1'});
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
        expect(element(by.css('nav .login')).isPresent()).to.eventually.be.true.and.notify(next);
    });

    this.Given(/^System does not have any registration credentials$/, function (next) {
        db.connection.db.dropCollection('users', function (err, result) {
            //if (err) next(err);
            next();
        });
    });

    this.Given(/^I am at registration point$/, function (next) {
        browser.get('http://localhost:3001');  // click 'login'
        //expect(browser.getCurrentUrl()).to.eventually.be('http://localhost:3001');
        element(by.css('nav .register')).click().then(next);
    });

    this.When(/^I provide an invalid registration value of (.*) in field (.*)$/, function (value, field, next) {
        element(by.model('registerModel.' + field)).sendKeys(value);
        if (field != 'username') {
            element(by.model('registerModel.username')).sendKeys('username');
        }
        if (field != 'password') {
            element(by.model('registerModel.password')).sendKeys('Password#123');
        }
        if (field != 'email') {
            element(by.model('registerModel.email')).sendKeys('email@email.com');
        }
        next();
    });

    this.Given(/^I submit for registration$/, function (next) {
        var self = this;
        element(by.css('form .btn')).click().then(function () {

            self.takeScreenshot('After', 'afterClick_screenshot.png', '').then(function (err) {
                if (err) console.log(err);
                next();
            })
        });
    });

    this.Then(/^The screenshot will look like invalid registration reference image for invalid field (.*) with value (.*)$/, function (field, value, next) {
        // Write code here that turns the phrase above into concrete actions
        next();
    });

    this.Given(/^I provide my email (.*) for registration$/, function (email, next) {
        element(by.model('registerModel.email')).sendKeys(email).then(next)
    });

    this.Given(/^I provide my password (.*) for registration$/, function (password, next) {
        element(by.model('registerModel.password')).sendKeys(password).then(next)
    });

    this.Given(/^I reconfirm my password (.*) for registration$/, function (password, next) {
        next.pending();
    });

    this.Then(/^I see a registration confirmation$/, function (next) {
        next.pending();
    });

    this.When(/^I provide my username (.*) for registration$/, function (username, next) {
        element(by.model('registerModel.username')).sendKeys(username).then(next);
    });

};

module.exports = steps;