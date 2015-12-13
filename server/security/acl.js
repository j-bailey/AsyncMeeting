"use strict";

var Acl = require('acl'),
    logger = require('winston'),
    fs = require('fs'),
    nconf = require('nconf'),
    mongodb = require('mongodb'),
    Q = require('q');

var acl = null;

function setUpRoles() {
    fs.readdirSync(__dirname + '/resources').forEach(function (file) {
        if (file.indexOf('-role') > -1) {
            var role = require('./resources/' + file);
            role.object.allows.forEach(function (allow) {
                acl.allow(role.object.key, allow.resources, allow.permissions);
            });
        }
    });
}

var init = function () {
    var defer = Q.defer();

    var protocol = nconf.get("database:acl:protocol");
    var host = (nconf.get("NODE_ENV").toUpperCase() === 'DEVELOPMENT')? 'localhost' : nconf.get("database:acl:host");
    var port = nconf.get("database:acl:port");
    var database = nconf.get("database:acl:database");

    var dbUrl = protocol + "://" + host + ":" + port + "/" + database;
    var self = this;
    mongodb.connect(
        dbUrl,
        nconf.get("database:acl:user"),
        nconf.get("database:acl:pass"),
        function (error, db) {
            if (error) {
                logger.error('Error connecting to database for ACL set up.  ' + error);
                defer.reject(error);
            }
            self.aclBackend = new Acl.mongodbBackend(db, "acl");
            acl = new Acl(self.aclBackend);
            logger.info('Acl is connected to ' + dbUrl);
            setUpRoles();
            defer.resolve(acl);
        });
    return defer.promise;
};

function getAcl() {
    return acl;
}

module.exports.init = init;
module.exports.getAcl = getAcl;
module.exports.setUpRoles = setUpRoles;
