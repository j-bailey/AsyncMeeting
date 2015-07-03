var Acl = require('acl'),
    logger = require('winston'),
    fs = require('fs'),
    cfg = require('config'),
    mongodb = require('mongodb'),
    Q = require('q');

var acl = null;

function setUpRoles() {
    fs.readdirSync(__dirname + '/resources').forEach(function (file) {
        if (file.indexOf('-role') > -1) {
            var role = require('./resources/' + file);
            role.object.allows.forEach(function(allow) {
                acl.allow(role.object.key, allow.resources, allow.permissions);
            });
        }
    });
}

function init() {
    var defer = Q.defer();
    var dbUrl = cfg.get("database.url");
    var self = this;
    mongodb.connect(dbUrl, function (error, db) {
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
}

function getAcl() {
    return acl;
}

module.exports.init = init;
module.exports.getAcl = getAcl;
module.exports.setUpRoles = setUpRoles;
