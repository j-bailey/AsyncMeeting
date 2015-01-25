var db = require('../../../../db')
var User = require('../../../../server/models/user')
var bcrypt = require('bcrypt')
var chai = require('chai')
chai.use( require('chai-as-promised'))
var expect = chai.expect

var username = 'user';
var pass = 'pass'

var steps = function() {

    this.Given(/^I have a valid and active account$/, function (callback) {
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
            })
            callback();
        })
    });

    this.Given(/^I am logged out of the system$/, function (callback) {
        browser.get('http://localhost:3001') // click 'login'
        //expect(browser.getCurrentUrl()).toBe('http://localhost:3001');
        //browser.refresh() // click 'login'
        //driver.isElementPresent(by.css('nav .logout')).then(function() {
        //    element(by.css('nav .logout')).click();
        //    callback();
        //});
        expect(element(by.css('nav .logout'))).to.exist;
        callback();
    });

    this.Given(/^I request to authenticate myself$/, function (callback) {
        element(by.css('nav .login')).click() // fill out and submit registration form ' +
        callback();
    });

    this.When(/^I provide my credentials$/, function (callback) {
        element(by.model('username')).sendKeys(username)
        element(by.model('password')).sendKeys(pass)
        element(by.css('form .btn')).click() // submit a new post on the posts page
        callback();
    });

    this.Then(/^I should have access to my account$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback.pending();
    });

    this.Given(/^I have an invalid account$/, function (callback) {
 //       db.connection.db.dropDatabase()
        callback();
    });

    this.Then(/^I should be denied access to my account$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        callback.pending();
    });
};

module.exports = steps;
