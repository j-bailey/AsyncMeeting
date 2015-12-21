"use strict";

var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');
var db = require('../db');

var schema = new mongoose.Schema({
        name: { type: String, required: true },
        description: { type: String, required: false }
    }
);

schema.plugin(modifiedOn);
schema.plugin(createInfo);
schema.plugin(versionInfo);

db.readOnlyConnection.model('Permission', schema);
db.readWriteConnection.model('Permission', schema);
db.adminConnection.model('Permission', schema);

module.exports.schema = schema;

