"use strict";

var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');
var Q = require('q');
var bcrypt = require('bcrypt');
var logger = require('winston');
var db = require('../db');
var dictValidator = require('../security/dictionary-validator');


var schema = new mongoose.Schema({
    username: { type: String, required: false },
    password: { type: String, required: true },
    email: { type: String, required: true },
    firstName: String,
    lastName: String,
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }]
});


schema.pre('validate', function(next){
    var user = this;
// only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        return next();
    }
    if (dictValidator.isImproper(this.username, this.password)){
        next(new Error('Either the password cannot contain your username or be on the list of commonly used passwords.'));
    }
    bcrypt.hash(user.password, 12, function (err, hash) {
        if(err) {
            next(err);
            return;
        }
        user.password = hash;
        next();
    });
});

// Add static methods
var publicFields = 'uuid username email permissions roles createdOn modifiedOn firstName lastName currentVersion';
schema.statics.publicFields = publicFields;

schema.statics.findPublicUserById = function (userId) {
    return this.findById(userId)
        .select(publicFields)
        .populate('permissions')
        .populate('roles')
        .exec();
};
schema.statics.findPublicUserByUserName = function (userName) {
    var defer = Q.defer();
    this.findOne({ 'username': userName })
        .select(publicFields)
        .populate('permissions')
        .populate('roles')
        .exec(function (err, user) {
            if (err){
                logger.error('error in findPublicUserByUserName with ' + err);
                defer.reject(err);
            }
            defer.resolve(user);
        });
    return defer.promise;
};

schema.statics.findPublicUserByEmail = function (email) {
    var defer = Q.defer();
    this.findOne({ 'email': email })
        .select(publicFields)
        .populate('permissions')
        .populate('roles')
        .exec(function (err, user) {
            if (err){
                logger.error('error in findPublicUserByEmail with with ' + err);
                defer.reject(err);
            }
            defer.resolve(user);
        });
    return defer.promise;
};


schema.static.quickFind = function(searchCriteria) {
    var defer = Q.defer();
    this.find().or([
        { 'username': { $regex: searchCriteria }},
        { 'firstName': { $regex: searchCriteria }},
        { 'lastName': { $regex: searchCriteria }}
    ], ['_id', 'username', 'firstName', 'lastName']).sort('firstName', 1).exec(function(err, users) {
        if (err){
            logger.error('error in quickFind with with ' + err);
            defer.reject(err);
        }
        defer.resolve(users);
    });
    return defer.promise;
};

// Add plugins

schema.plugin(modifiedOn);
schema.plugin(createInfo);
schema.plugin(versionInfo);

db.readOnlyConnection.model('User', schema);
db.readWriteConnection.model('User', schema);
db.adminConnection.model('User', schema);

module.exports.schema = schema;
