"use strict";

var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');
var tenantInfo = require('./plugins/tenantInfo');
var Q = require('q');
var bcrypt = require('bcrypt');
var logger = require('winston');
var db = require('../db');
require('./tenant');
require('./userAllowedResources');
var dictValidator = require('../security/dictionary-validator');
var UserAllowedResources = db.readWriteConnection.model('UserAllowedResources');


var schema = new mongoose.Schema({
    username: {type: String, required: false, select: true},
    password: {type: String, required: true, select: false},
    email: {type: String, required: true},
    firstName: String,
    lastName: String,
    permissions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Permission'}],
    roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role'}]
});


schema.pre('validate', function (next) {
    var user = this;
// only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        return next();
    }
    if (dictValidator.isImproper(this.username, this.password)) {
        next(new Error('Either the password cannot contain your username or be on the list of commonly used passwords.'));
    }
    bcrypt.hash(user.password, 12, function (err, hash) {
        if (err) {
            next(err);
            return;
        }
        user.password = hash;
        next();
    });
});

// Add static methods

schema.statics.findPublicUserByUserName = function (userName) {
    var defer = Q.defer();
    this.findOne({'username': userName})
        .populate('permissions')
        .populate('roles')
        .exec(function (err, user) {
            if (err) {
                logger.error('error in findPublicUserByUserName with ' + err);
                defer.reject(err);
            }
            defer.resolve(user);
        });
    return defer.promise;
};

schema.statics.findPublicUserByEmail = function (email) {
    var defer = Q.defer();
    this.findOne({'email': email})
        .populate('permissions')
        .populate('roles')
        .exec(function (err, user) {
            if (err) {
                logger.error('error in findPublicUserByEmail with with ' + err);
                defer.reject(err);
            }
            defer.resolve(user);
        });
    return defer.promise;
};


schema.static.quickFind = function (searchCriteria) {
    var defer = Q.defer();
    this.find().or([
        {'username': {$regex: searchCriteria}},
        {'firstName': {$regex: searchCriteria}},
        {'lastName': {$regex: searchCriteria}}
    ], ['_id', 'username', 'firstName', 'lastName']).sort('firstName', 1).exec(function (err, users) {
        if (err) {
            logger.error('error in quickFind with with ' + err);
            defer.reject(err);
        }
        defer.resolve(users);
    });
    return defer.promise;
};


schema.statics.MEETING_AREA_RESOURCE_TYPE = 'MeetingArea';

schema.statics.addAllowedResource = function (userId, tenantId, resourceId, resourceType) {
    var defer = Q.defer();

    var allowedResources = {
        userId: userId,
        tenantId: tenantId,
        resourceId: resourceId,
        resourceType: resourceType
    };
    allowedResources = new UserAllowedResources(allowedResources);
    allowedResources.save(function (err) {
        if (err) {
            logger.error('Error in Saving allowed resource: ' + err);
            return defer.reject({message: "We're sorry, we could not add an allowed resource at this time!"});
        }
        defer.resolve();
    });
    return defer.promise;
};

schema.statics.removeAllowedResource = function (userId, resourceId, resourceType) {
    var defer = Q.defer();

    var allowedResources = {
        userId: userId,
        resourceId: resourceId,
        resourceType: resourceType
    };
    allowedResources = new UserAllowedResources(allowedResources);

    UserAllowedResources.findOneAndRemove({
        userId: userId,
        resourceId: resourceId,
        resourceType: resourceType
    }, function (err) {
        if (err) {
            logger.error('Error in Saving user: ' + err);
            return defer.reject({message: "We're sorry, we could not add an allowed resource at this time!"});
        }
        defer.resolve();
    });

    return defer.promise;
};


// Add plugins

schema.plugin(modifiedOn);
schema.plugin(createInfo);
schema.plugin(versionInfo);
schema.plugin(tenantInfo);

db.readOnlyConnection.model('User', schema);
db.readWriteConnection.model('User', schema);
db.adminConnection.model('User', schema);

module.exports.schema = schema;
