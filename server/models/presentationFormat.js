"use strict";

var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');
var db = require('../db');

var schema = new mongoose.Schema({
    name: {type: String, required: true},
    description: { type: String, required: true }
});

// Add static methods

// Add plugins

schema.plugin(modifiedOn);
schema.plugin(createInfo);
schema.plugin(versionInfo);

db.readOnlyConnection.model('PresentationFormat', schema);
db.readWriteConnection.model('PresentationFormat', schema);
db.adminConnection.model('PresentationFormat', schema);

module.exports.schema = schema;

