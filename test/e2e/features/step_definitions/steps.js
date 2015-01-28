var db = require('../../../../db')
var User = require('../../../../server/models/user')
var bcrypt = require('bcrypt')
var chai = require('chai')
chai.use( require('chai-as-promised'))
var expect = chai.expect

var username = 'user';
var pass = 'pass'

var steps = function() {

    this.Given(/^I have a valid and active account$/, function (next) {
        db.connection.db.dropDatabase()
        var user = new User({username: username})
        bcrypt.hash(pass, 10, function (err, hash) {
            if (err) {
                return next(err)
            }
            user.password = hash

            user.save(function (err) {
                if (err) {
                    return next(err)
                }
                next();
            })
        })

    });

    this.Given(/^I am logged out of the system$/, function (next) {
        browser.get('http://localhost:3001') // click 'login'
        //expect(browser.getCurrentUrl()).toBe('http://localhost:3001');
        //browser.refresh() // click 'login'
        //driver.isElementPresent(by.css('nav .logout')).then(function() {
        //    element(by.css('nav .logout')).click();
        //    callback();
        //});
        expect(element(by.css('nav .login')).isPresent()).to.eventually.be.true.and.notify(next);
    });

    this.Given(/^I request to authenticate myself$/, function (next) {
        element(by.css('nav .login')).click().then(next); // fill out and submit registration form ' +
    });

    this.When(/^I provide my credentials$/, function (next) {
        element(by.model('username')).sendKeys(username)
        element(by.model('password')).sendKeys(pass)
        element(by.css('form .btn')).click().then(next) // submit a new post on the posts page
    });

    this.Then(/^I should have access to my account$/, function (next) {
        // Write code here that turns the phrase above into concrete actions
        next.pending();
    });

    this.Given(/^I have an invalid account$/, function (next) {
        //       db.connection.db.dropDatabase()
        next.pending();
    });

    this.Then(/^I should be denied access to my account$/, function (next) {
        expect(element(by.css('nav .logout')).isPresent()).to.eventually.be.true.and.notify(next);
    });
};

module.exports = steps;