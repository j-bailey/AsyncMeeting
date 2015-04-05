var mongoose = require('mongoose');
var Q = require('q');
var acl =  require('./security/acl');
var logger = require('winston');
var cfg = require('config');

var dbVersion = '0.0.1';

var dbUrl = cfg.get("database.url");

mongoose.connect(dbUrl, function (err, db) {
    logger.info('mongodb connected to ' + dbUrl);
    //acl.init(db);
});

module.exports = mongoose;

