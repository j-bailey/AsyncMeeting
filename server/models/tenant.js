"use strict";

var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');
var db = require('../db');

var typeOptions = 'organization personal'.split(' ');

var schema = new mongoose.Schema({
    name: { type: String, required: true, select: true },
    type: {type: String, required: true, enum: typeOptions, select: true},
    description: { type: String, required: false, select: true }
});

schema.pre('validate', function (next) {
    var tenant = this;
    if (tenant.type === 'personal') {
        if (tenant.name.length < 7 || tenant.name.substring(0,3) !== ':::' ||  tenant.name.substring(tenant.name.length-4) !== ':::') {
            next('tenant name for personal tenants is not correct ' + tenant.name);
        }
    } else {
        if (tenant.name.substring(0,3) === ':::' ||  tenant.name.substring(tenant.name.length-4) === ':::') {
            next('tenant name for organization tenants is not correct ' + tenant.name);
        }
    }
    next();
});

// Add static methods
schema.statics.ORGANIZATION_TYPE = typeOptions[0];
schema.statics.PERSONAL_TYPE = typeOptions[1];

schema.statics.createPersonalTenantName = function(userName) {
    return ':::' + userName + ':::';
};

// Add plugins

schema.plugin(modifiedOn);
schema.plugin(createInfo);
schema.plugin(versionInfo);


db.readOnlyConnection.model('Tenant', schema);
db.readWriteConnection.model('Tenant', schema);
db.adminConnection.model('Tenant', schema);

module.exports.schema = schema;


