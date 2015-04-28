/**
 * Created by jlb on 4/23/15.
 */

var crypto = require('crypto'),
    easyimg = require('easyimage'),
    exec = require('child_process').exec,
    fs = require('fs'),
    nodeFs = require('node-fs'),
    os = require('os'),
    path = require('path'),
    Q = require('q'),
    promise = require('selenium-webdriver').promise;

var imageUtils = {};
var tmpFolder = path.normalize(path.join(__dirname, '..', '..', '..', 'tmp'));

Date.prototype.yearToSecondFormat = function () {
    var yyyy = this.getFullYear().toString(),
        mm = this.getMonth().toString(),
        dd = this.getDate().toString(),
        hh = this.getHours().toString(),
        mm = this.getMinutes().toString(),
        ss = this.getSeconds().toString();
    return yyyy + '-' + mm + '-' + dd + '-' + hh + '-' + mm + '-' + ss;
};

imageUtils.getBrowserName = function (webDriver) {
    var defer = promise.defer();
    webDriver.getSession().then(function (session) {
        defer.fulfill(session.getCapability('browserName'));
    }, function(err){
        console.error(err);
        defer.errback(new Error(err));
    });
    return defer.promise;
};

imageUtils.keepImagesForReview = function (screenShot, referenceFile, compareFile, webDriver, foldername, filename) {
    var defer = promise.defer();
    imageUtils.getBrowserName(webDriver).then(function (browserName) {
        var failedFolder = path.join(tmpFolder, 'screenshots', 'failed'),
            now = new Date().yearToSecondFormat(),
            screenShotFileName = path.join(failedFolder, process.platform + "-" + browserName + '-screenshot' + now + '-' + filename + '.png'),
            referenceFileName = path.join(failedFolder, process.platform + "-" + browserName + '-reference' + now + '-' + filename + '.png'),
            compareFileName = path.join(failedFolder, process.platform + "-" + browserName + '-compare' + now + '-' + filename + '.png');
        fs.createReadStream(screenShot).pipe(fs.createWriteStream(screenShotFileName));
        fs.createReadStream(referenceFile).pipe(fs.createWriteStream(referenceFileName));
        fs.createReadStream(compareFile).pipe(fs.createWriteStream(compareFileName));
        defer.fulfill();
    });
    return defer.promise;
};

imageUtils.random = function (howMany, chars) {
    chars = chars
    || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    var rnd = crypto.randomBytes(howMany)
        , value = new Array(howMany)
        , len = chars.length;

    for (var i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len]
    }

    return value.join('');
};

var tempFiles = [];
var isExiting = false;
function _deleteTempFiles() {
    if (isExiting) {
        return;
    }

    isExiting = true;
    var defer = promise.defer(),
        file,
        tempFileCount = tempFiles.length,
        closeCount = 0;

    while ((file = tempFiles.pop()) != undefined) {
        fs.close(file, function () {
            fs.unlink(file, function () {
                if (closeCount == tempFileCount) {
                    defer.fulfill();
                } else {
                    closeCount++;
                }
            })
        })
    }
    return defer.promise;
}


imageUtils.getTempFileName = function (prefix, suffix) {
    return path.join(os.tmpDir(), (prefix || 'pre-') + imageUtils.random(20) + (suffix || '.tmp'));
};

imageUtils.getTempFile = function (prefix, suffix) {
    var defer = promise.defer(),
        fileName = imageUtils.getTempFileName(prefix, suffix);

    fs.open(fileName, 'w+', function (err, fd) {
        if (err) {
            defer.errback(new Error(err));
        }
        tempFiles.push(fd);
        defer.fulfill(fd);
    });

    return defer.promise;
};

imageUtils.compareReferenceImageWithElementScreenShot = function(element, webDriver, featureName, subFeatureName, comparisonThreshold) {
    var defer = promise.defer();

    Q.allSettled([
        imageUtils.getReferenceImageFileName(webDriver, featureName, subFeatureName),
        imageUtils.takeElementScreenShot(webDriver, element)
    ]).spread(function(referenceImageFileName, elementScreenShot){
        imageUtils.compareImages(elementScreenShot.value.path, referenceImageFileName.value).then(function(comparison){
            if (comparison > comparisonThreshold) {
                imageUtils.keepImagesForReview(elementScreenShot.value.path, referenceImageFileName.value, webDriver, featureName, subFeatureName);
            }
            defer.fulfill(comparison);
        }, function(err) {
            console.error(err);
            defer.errback(new Error(err));
        })
    }, function(err){
        console.error(err);
        defer.errback(new Error(err));
    });
    return defer.promise;
};

imageUtils.compareImages = function (screenShotFileName, referenceImageFileName) {
    var cmd = 'compare -metric AE -fuzz 0% ' + screenShotFileName + ' ' + referenceImageFileName + ' ' + imageUtils.getTempFileName('unit_test_', '_compare.png'),
        defer = promise.defer();

    exec(cmd, {
        env: process.env
    }, function (err, stdout, stderr) {
        if (err) {
            defer.errback(new Error(err));
        }
        defer.fulfill(parseInt(stderr));
    });

    return defer.promise;
};

imageUtils.getReferenceImageFileName = function (webDriver, featureName, subFeatureName) {
    var defer = new promise.Deferred();
    imageUtils.getBrowserName(webDriver).then(function (browserName) {
        var fileName = process.platform + '-' + browserName + '-' + subFeatureName + '.png';
        var absolutePath = path.normalize(path.join(__dirname, '..', '..', 'resources', 'screenshots', featureName, subFeatureName, fileName));
         defer.fulfill(absolutePath);
    }, function (err) {
        console.error(err);
        defer.errback(new Error(err));
    });
    return defer;
};

imageUtils.createReferenceImageForElement = function( webDriver, element, featureName, subFeatureName) {
    var defer = promise.defer();
    Q.allSettled([
        imageUtils.getReferenceImageFileName(webDriver, featureName, subFeatureName),
        imageUtils.takeElementScreenShot(webDriver, element)
    ]).spread(function (referenceImageFileName, screenShotFileName) {
        var referencePathObj = path.parse(referenceImageFileName.value);
        nodeFs.mkdirSync(referencePathObj.dir, 0777, true);
        fs.createReadStream(screenShotFileName.value.path).pipe(fs.createWriteStream(referenceImageFileName.value));
        defer.fulfill();
    }, function(err){
        console.error(err);
        defer.errback(new Error(err));
    });
    return defer.promise;
};

imageUtils.takeElementScreenShot = function (webDriver, element) {
    defer = new promise.Deferred();
    Q.allSettled([
        element.getLocation(),
        element.getSize(),
        imageUtils.takeScreenShot(),
        browser.driver.manage().window().getSize()
    ]).spread(function (location, size, screenShotFileName, windowSize) {
            easyimg.info(screenShotFileName.value).then(function (info) {
                var screenRatio = info.width / windowSize.value.width;
                var pathObj = path.parse(screenShotFileName.value);
                pathObj.base = 'crop_' + pathObj.base;
                var cropFileName = path.format(pathObj);
                easyimg.crop({
                    src: screenShotFileName.value,
                    dst: cropFileName,
                    cropwidth: size.value.width * screenRatio,
                    cropheight: size.value.height * screenRatio,
                    x: location.value.x * screenRatio,
                    y: location.value.y * screenRatio,
                    gravity: 'NorthWest'
                }).then(function (image) {
                    console.log('Element picture taken: ' + JSON.stringify(image));
                    defer.fulfill(image);
                }, function (err) {
                    console.error(err);
                    defer.errback(new Error(err));
                })
            }, function (err) {
                console.error(err);
                defer.errback(new Error(err));
            })
        }, function (err) {
            console.error(err);
            defer.errback(err);
        }
    );
    return defer;
};

imageUtils.takeScreenShot = function () {
    var deferred = new promise.Deferred();
    var fileName = imageUtils.getTempFileName('screenshot_', '.png');
    browser.driver.takeScreenshot().then(
        function (image, err) {
            fs.writeFile(fileName, image, 'base64', function (err) {
                (err) ? deferred.errback(new Error(err)) : deferred.fulfill(fileName);
            });
        }, function (err) {
            console.log('Error taking screenshot: ' + err);
            deferred.errback(new Error(err));
        }
    );
    return deferred;
};

process.on('SIGINT', _deleteTempFiles);
process.on('SIGHUP', _deleteTempFiles);
process.on('SIGTERM', _deleteTempFiles);
process.on('beforeExit', _deleteTempFiles);


module.exports = imageUtils;

