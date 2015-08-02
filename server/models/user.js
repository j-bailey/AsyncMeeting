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
var Tenant = db.readOnlyConnection.model('Tenant');
var MeetingArea = db.readOnlyConnection.model('MeetingArea');
var dictValidator = require('../security/dictionary-validator');
var acl = require('../security/acl'),
    freeTier = require('../security/resources/free-tier-role');


var schema = new mongoose.Schema({
    username: {type: String, required: false, select: true},
    password: {type: String, required: true, select: false},
    email: {type: String, required: true},
    firstName: String,
    lastName: String,
    permissions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Permission'}],
    roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role'}],
    allowedTenantResources: [
        {
            tenantId: {type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true},
            resourceId:  {type: mongoose.Schema.Types.ObjectId, required: true},
            resourceType: {type: String, required: true}
        }
    ]
});

schema.path('allowedTenantResources').validate(function tenantResourcesValidator(val) {
    return (val.tenantId && val.resourceId && val.resourceType);
}, 'User tenant resource is incorrect');

schema.path('allowedTenantResources').select(false);

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

schema.statics.createNewSignedUpUser = function (newUser) {
    var defer = Q.defer();
    var newTenantName = Tenant.createPersonalTenantName(newUser.username);
    var newTenant = new Tenant({
        name: newTenantName,
        type: Tenant.PERSONAL_TYPE,
        description: 'Personal tenant created by Signup'
    });
    newTenant.save(function (err, savedTenant) {
        if (err) {
            logger.error('Error in saving new tenant: ' + err);
            return defer.reject({message: "We're sorry, we could not create your account at this time!"});
        }
        logger.debug('new tenant ' + savedTenant + ' has been saved');
        var firstMeetingArea = new MeetingArea({
            title: 'My First Meeting Area',
            description: 'This is your meeting area, which can contain multiple meetings and other areas.  ' +
            'Please feel to change me or add to me.',
            parentMeetingArea: null,
            ancestors: [],
            tenantId: savedTenant._id
        });
        firstMeetingArea.save(function(err, savedArea) {
            if (err) {
                logger.error('Error in saving meeing area for new tenant: ' + err);
                return defer.reject({message: "We're sorry, we could not create your account at this time!"});
            }
            var allowedResources = {
                tenantId: savedTenant._id,
                resourceId: savedArea._id,
                resourceType: 'MeetingArea'
            };
            acl.getAcl().addUserRoles(newUser.username, freeTier.object.key);
            newUser.allowedTenantResources = allowedResources;
            newUser.tenantId = savedTenant._id;

            newUser.save(function (err, savedUser) {
                if (err) {
                    logger.error('Error in Saving user: ' + err);
                    savedTenant.remove(function (err) {
                        if (err) {
                            logger.error('Unable to delete Tenant for new user with ID: ' + savedTenant._id);
                        }
                        savedArea.remove(function(err){
                            if (err) {
                                logger.error('Unable to delete Meeting Area for new user with ID: ' + savedTenant._id);
                            }
                            return defer.reject({message: "We're sorry, we could not create your account at this time!"});
                        });
                    });
                }
                logger.debug('User Registration successful');
                db.readOnlyConnection.model('User').findById(savedUser._id).lean().exec(function(err, safeUser) {
                    if (err) {
                        logger.error('Error in Saving user: ' + err);
                        savedTenant.remove(function (err) {
                            if (err) {
                                logger.error('Unable to delete Tenant for new user with ID: ' + savedTenant._id);
                            }
                            savedArea.remove(function(err){
                                if (err) {
                                    logger.error('Unable to delete Meeting Area for new user with ID: ' + savedTenant._id);
                                }
                                return defer.reject({message: "We're sorry, we could not create your account at this time!"});
                            });
                        });
                    }
                    defer.resolve(safeUser);
                });
            });
        });
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
