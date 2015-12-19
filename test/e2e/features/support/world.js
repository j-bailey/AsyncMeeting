/**
 * Created by jlb on 4/12/15.
 */

module.exports = function () {
    require('../../../../config/configSetup');
    var mongodb = require('mongodb'),
        Acl = require('../../../../server/security/acl'),
        nconf = require('nconf'),
        fs = require('fs'),
        nodeFs = require('node-fs'),
        path = require('path'),
        promise = require('selenium-webdriver').promise;

    var testFolder = path.normalize(path.join(__dirname, '..', '..')),
        tmpFolder = path.normalize(path.join(__dirname, '..', '..', '..', '..', 'tmp')),
        testingUtils = require('pg-testing-utils'),
        imageUtils = testingUtils.imageUtils(testFolder, tmpFolder);

    console.log('[INFO] Using base URL = ' + browser.baseUrl);

    function takeScreenshot(category, filename, consoleMsg) {
        var deferred = new promise.Deferred();
        var dir = path.join('tmp', 'e2e', 'screenshots', category),
            filePath = path.join(dir, filename);
        nodeFs.mkdirSync(dir, '0777', true);
        browser.driver.takeScreenshot().then(
            function (image) {
                console.log('Taking picture and placing it here: ' + filePath);
                fs.writeFile(filePath, image, 'base64', function (err) {
                    console.log((err) ? 'Take picture of error: ' + err : consoleMsg);
                    (err) ? deferred.errback(err) : deferred.fulfill();
                });
            }, function (err) {
                console.log('Error taking picture: ' + err);
            }
        );
        return deferred;
    }

    this.World = function World(callback) {
        this.takeScreenshot = takeScreenshot;
        this.imageUtils = imageUtils;
        var self = this;
        var protocol = nconf.get("database:acl:protocol");
        var host = (nconf.get("NODE_ENV").toUpperCase() === 'DEVELOPMENT')? 'localhost' : nconf.get("database:acl:host");
        var port = nconf.get("database:acl:port");
        var database = nconf.get("database:acl:database");

        var dbUrl = protocol + "://" + host + ":" + port + "/" + database;

        mongodb.connect(
            dbUrl,
            nconf.get("database:acl:user"),
            nconf.get("database:acl:pass"),
            function (error, db) {
                if (error) {
                    throw error;
                }
                self.mongoDb = db;
                Acl.init().then(function (aclIns) {
                    callback(); // tell Cucumber we're finished and to use 'this' as the world instance
                });
            });

    };
};
