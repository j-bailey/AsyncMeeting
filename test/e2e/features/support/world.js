/**
 * Created by jlb on 4/12/15.
 */
module.exports = function() {
    var mongodb = require('mongodb'),
        cfg = require('config'),
        dbUrl = cfg.get("database.url"),
        fs = require('fs'),
        nodeFs = require('node-fs'),
        path = require('path'),
        promise = require('selenium-webdriver').promise,
        self = this;


    var testFolder = path.normalize(path.join(__dirname, '..', '..')),
        tmpFolder = path.normalize(path.join(__dirname, '..', '..', '..', 'tmp')),
        testingUtils = require('pg-testing-utils'),
        imageUtils = testingUtils.imageUtils(testFolder, tmpFolder);

    console.log('[INFO] Using base URL = ' + browser.baseUrl);

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


    this.World = function World(callback) {
        this.takeScreenshot = takeScreenshot;
        this.imageUtils = imageUtils;
        mongodb.connect(dbUrl, function (error, db) {
            if (error) {
                throw error;
            }
            this.mongoDb = db;
            callback(); // tell Cucumber we're finished and to use 'this' as the world instance
        });

    };
};