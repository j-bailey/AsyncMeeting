"use strict";

var mongoose = require('mongoose');
var logger = require('winston');
var nconf = require('nconf');


var dbUrl = nconf.get("database:acl:url");

mongoose.connect(dbUrl, function (err) {
    if (err) {
        logger.error('Error connecting to DB from mongoose', err);
        throw err;
    }
    logger.info('Mongoose is connected to ' + dbUrl);
});

module.exports = mongoose;

var hostReadOnly = nconf.get("database:read-only:host");
var databaseReadOnly = nconf.get("database:read-only:database");
var portReadOnly = nconf.get("database:read-only:port");
var optionsReadOnly = nconf.get("database:read-only:options");

var readOnlyConnection = mongoose.createConnection(hostReadOnly, databaseReadOnly, portReadOnly, optionsReadOnly);
readOnlyConnection.on('error', function (err) {
    if (err) {
        logger.error('Error with Read-Only DB from mongoose', err);
        throw err;
    }
});
readOnlyConnection.on('connected', function(err){
    if (err) {
        logger.error('Error connecting with Read-Only DB from mongoose', err);
        throw err;
    }

    logger.info('Mongoose is connected to Read-Only DB via ' + hostReadOnly + ':' + portReadOnly +
        '/' + databaseReadOnly);
});


var hostReadWrite = nconf.get("database:read-write:host");
var databaseReadWrite = nconf.get("database:read-write:database");
var portReadWrite = nconf.get("database:read-write:port");
var optionsReadWrite = nconf.get("database:read-write:options");
var readWriteConnection = mongoose.createConnection(hostReadWrite, databaseReadWrite, portReadWrite, optionsReadWrite);
readWriteConnection.on('error', function (err) {
    if (err) {
        logger.error('Error with Read-Write DB from mongoose', err);
        throw err;
    }
});
readWriteConnection.on('connected', function(err){
    if (err) {
        logger.error('Error connecting with Read-Write DB from mongoose', err);
        throw err;
    }
    logger.info('Mongoose is connected to Read-Write DB via ' + hostReadWrite + ':' + portReadWrite + '/' +
        databaseReadWrite );
});

var hostAdmin = nconf.get("database:admin:host");
var databaseAdmin = nconf.get("database:admin:database");
var portAdmin = nconf.get("database:admin:port");
var optionsAdmin = nconf.get("database:admin:options");
var adminConnection = mongoose.createConnection(hostAdmin, databaseAdmin, portAdmin, optionsAdmin);
adminConnection.on('error', function (err) {
    if (err) {
        logger.error('Error with Admin DB from mongoose', err);
        throw err;
    }
});
adminConnection.on('connected', function(err){
    if (err) {
        logger.error('Error connecting with Admin DB from mongoose', err);
        throw err;
    }
    logger.info('Mongoose is connected to Admin DB via ' + hostAdmin + ':' + portAdmin + '/' +
        databaseAdmin );
});

module.exports.readOnlyConnection = readOnlyConnection;
module.exports.readWriteConnection = readWriteConnection;
module.exports.adminConnection = adminConnection;

