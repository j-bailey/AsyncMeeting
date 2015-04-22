/**
 * Created by jlb on 4/12/15.
 */

var Cucumber = require('cucumber'),
    nodeFs = require('node-fs'),
    JsonFormatter = Cucumber.Listener.JsonFormatter(),
    fs = require('fs'),
    path = require('path'),
    promise = require('selenium-webdriver').promise;

var beforeFeatures = function(event, callback) {
    callback();
};

var afterFeatures = function(event, callback) {
    callback();
};

var beforeFeature = function(event, callback) {
    callback();
};

var afterFeature = function(event, callback) {
    callback();
};

var beforeScenario = function(event, callback) {
    callback();
};

var afterScenario = function(event, callback) {
    takeScreenshot('After', 'afterScenario_screenshot.png', '').then(function(err){
        if (err) console.log(err);
        callback();
    })

    callback();
};

var beforeStep = function(event, callback) {
    callback();
};

var afterStep = function(event, callback) {
    callback();
};

JsonFormatter.log = function(json) {
    var dir = path.join('tmp', 'e2e', 'cucumber', 'json'),
        file = 'cucumberReport.json',
        filePath = path.join(dir, file);
    nodeFs.mkdirSync(dir, '0777', true);
    fs.writeFile(filePath, json, function (err){
        if (err) throw err;
        console.log('Cucumber json file loctaed here: ' + filePath);
    });
};

// TODO move this to a module for downloading to projects
function takeScreenshot(category, filename, consoleMsg) {
    var deferred = new promise.Deferred();
    var dir = path.join('tmp', 'e2e', 'screenshots', category),
        filePath = path.join(dir, filename);
    nodeFs.mkdirSync(dir, '0777', true);
    browser.driver.takeScreenshot().then(
        function(image, err) {
            console.log('Taking picture and placing it here: ' + filePath);
            fs.writeFile(filePath, image, 'base64', function (err) {
                console.log((err) ? 'Take picture of error: ' + err : consoleMsg);
                (err) ? deferred.errback(err) : deferred.fulfill();
            });
        }, function(err) {
            console.log('Error taking picture: ' + err);
        }
    );
    return deferred;
}

var hooks = function() {
    this.registerHandler('BeforeFeatures', beforeFeatures);
    this.registerHandler('AfterFeatures', afterFeatures);

    this.registerHandler('BeforeFeature', beforeFeature);
    this.registerHandler('AfterFeature', afterFeature);

    this.registerHandler('BeforeScenario', beforeScenario);
    this.registerHandler('AfterScenario', afterScenario);

    this.registerHandler('BeforeStep', beforeStep);
    this.registerHandler('AfterStep', afterStep);

    this.registerListener(JsonFormatter);

    // TODO Set up to take screenshots on errors only and name the file based on the failing scenario
    this.After(function(scenario, callback){
        takeScreenshot('After', 'error_screenshot.png', '').then(function(err){
            if (err) console.log(err);
            callback();
        })
    })
};

module.exports = hooks;