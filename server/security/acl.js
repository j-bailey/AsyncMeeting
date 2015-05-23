var Acl = require('acl'),
    logger = require('winston'),
    fs = require('fs'),
    cfg = require('config');

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
    var mongodb = require('mongodb'),
        dbUrl = cfg.get("database.url");
    var self = this;
    mongodb.connect(dbUrl, function (error, db) {
        self.aclBackend = new Acl.mongodbBackend(db, "acl");
        acl = new Acl(self.aclBackend);
        logger.info('Acl is connected to ' + dbUrl);
        setUpRoles();

    });
}

function getAcl() {
    if (acl === null) {
        init();
    }
    return acl;
}

module.exports.init = init;
module.exports.getAcl = getAcl;
module.exports.setUpRoles = setUpRoles;
