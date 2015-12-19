"use strict";

var mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;

var logger = require('winston');
var nconf = require('nconf');

var hostReadOnly = (nconf.get("NODE_ENV").toUpperCase() === 'DEVELOPMENT')? 'localhost' : nconf.get("database:read-only:host");
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


var hostReadWrite = (nconf.get("NODE_ENV").toUpperCase() === 'DEVELOPMENT')? 'localhost' : nconf.get("database:read-write:host");
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

var hostAdmin = (nconf.get("NODE_ENV").toUpperCase() === 'DEVELOPMENT')? 'localhost' : nconf.get("database:admin:host");
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


var hostSession = (nconf.get("NODE_ENV").toUpperCase() === 'DEVELOPMENT')? 'localhost' : nconf.get("database:session:host");
var databaseSession = nconf.get("database:session:database");
var portSession = nconf.get("database:session:port");
var optionsSession = nconf.get("database:session:options");
var sessionConnection = mongoose.createConnection(hostSession, databaseSession, portSession, optionsSession);
sessionConnection.on('error', function (err) {
    if (err) {
        logger.error('Error with Session DB from mongoose', err);
        throw err;
    }
});
sessionConnection.on('connected', function(err){
    if (err) {
        logger.error('Error connecting with Session DB from mongoose', err);
        throw err;
    }
    logger.info('Mongoose is connected to Session DB via ' + hostSession + ':' + portSession + '/' +
        databaseSession );
});



module.exports.readOnlyConnection = readOnlyConnection;
module.exports.readWriteConnection = readWriteConnection;
module.exports.sessionConnection = sessionConnection;
module.exports.adminConnection = adminConnection;

