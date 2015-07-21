"use strict";

var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');
var Q = require('q');
var bcrypt = require('bcrypt');
var logger = require('winston');
var db = require('../db');


var schema = new mongoose.Schema({
    username: { type: String, required: false },
    password: { type: String, required: true },
    email: { type: String, required: true },
    firstName: String,
    lastName: String,
    permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }]
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

schema.statics.hashPassword = function(password){
    return bcrypt.hashSync(password, 10);
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

schema.statics.getModel = function(conn) {
    return conn.model('User', schema);
};

// Add plugins

schema.plugin(modifiedOn);
schema.plugin(createInfo);
schema.plugin(versionInfo);

db.readOnlyConnection.model('User', schema);
db.readWriteConnection.model('User', schema);
db.adminConnection.model('User', schema);

