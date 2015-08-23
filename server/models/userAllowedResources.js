"use strict";

var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');
var db = require('../db');

var schema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    tenantId: {type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true},
    resourceId: {type: mongoose.Schema.Types.ObjectId, required: true},
    resourceType: {type: String, required: true}
});

schema.plugin(modifiedOn);
schema.plugin(createInfo);
schema.plugin(versionInfo);

db.readOnlyConnection.model('UserAllowedResources', schema);
db.readWriteConnection.model('UserAllowedResources', schema);
db.adminConnection.model('UserAllowedResources', schema);

module.exports.schema = schema;
