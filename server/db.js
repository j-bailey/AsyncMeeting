"use strict";

var mongoose = require('mongoose');
var logger = require('winston');
var nconf = require('nconf');

var dbUrl = nconf.get("database:url");

mongoose.connect(dbUrl, function (err) {
    if (err) {
        logger.error('Error connecting to DB from mongoose', err);
        throw err;
    }
    logger.info('Mongoose is connected to ' + dbUrl);
});

module.exports = mongoose;

