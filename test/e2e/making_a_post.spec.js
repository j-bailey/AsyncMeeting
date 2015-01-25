var db = require('../../db')
var User = require('../../server/models/user')
var bcrypt = require('bcrypt')
var chai = require('chai')
chai.use( require('chai-as-promised'))
var expect = chai.expect
describe('making a post', function () {

    beforeEach(function () {
        db.connection.db.dropDatabase()
        var user = new User({username: 'dickeyxxx'})
        bcrypt.hash('pass', 10, function (err, hash) {
            if (err) {
                return next(err)
            }
            user.password = hash
            user.save(function (err) {
                if (err) {
                    return next(err)
                }
            })
        })
    })

    it('creates an account and a new post', function () {
        browser.get('http://localhost:3001') // click 'login'
        element( by.css('nav .login')). click() // fill out and submit registration form ' +
        element( by.model('username')). sendKeys('dickeyxxx')
        element( by.model('password')). sendKeys('pass')
        element( by.css('form .btn')). click() // submit a new post on the posts page
        element(by.css('nav .posts')).click() // fill out and submit login form
        var post = 'my new post' + Math.random()
        element( by.model('postBody')). sendKeys( post)
        //element( by.css('form .btn')). click()
        element(by.id('AddPostBtn')).click() // the user should now their post as the first post on the page
        expect( element.all( by.css('ul.list-group li')). first(). getText()).to.eventually.contain( post)
    })
})







//
//
//describe('making a post', function () {
//    it('logs in and creates new post', function () {
//        browser.get('http://localhost:3001') // click 'login'
//        //browser.driver.wait(function () {
//        //    return browser.driver.isElementPresent(
//        //        by.css('nav .login'))
//        //}, 1000);
//        element(by.css('nav .login')).click() // fill out and submit login form
//        element(by.model('username')).sendKeys('dickeyxxx')
//        element(by.model('password')).sendKeys('pass')
//        element(by.css('form .btn')).click() // submit a new post on the posts page
//        element(by.css('nav .posts')).click() // fill out and submit login form
//        var post = 'my new post' + Math.random()
//        element(by.model('postBody')).sendKeys(post)
//        element(by.id('AddPostBtn')).click() // the user should now their post as the first post on the page
//        //webdriver.WebDriver.wait(function(!webdriver.WebDriver) {
//        //    element.all(by.css('ul.list-group li')).first();
//        //}, 3, '').then(function (data) {
//
//        //browser.driver.wait(function () {
//        //    return browser.driver.isElementPresent(
//        //        by.css('ul.list-group li'));
//        //}, 1000);
//        //element.all( by.css('ul.list-group li')).first().getText().then( function (text) {
//        //    expect( text). to.contain( post)
//        //})
//
//        expect(element.all(by.css(' ul.list-group li')).first().getText()).to.eventually.contain(post)
//
//    })
//
//
//})
//
//
//
