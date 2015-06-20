var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');
var Q = require('q');
var bcrypt = require('bcrypt');


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
var publicFields = 'username email permissions roles createdOn modifiedOn firstName lastName';
schema.statics.findPublicUserById = function (userId) {
    return this.findById(userId, publicFields)
        .populate('permissions')
        .populate('roles')
        .exec();
};
schema.statics.findPublicUserByUserName = function (userName) {
    var defer = Q.defer();
    this.findOne({ 'username': userName }, publicFields)
        .populate('permissions')
        .populate('roles')
        .exec(function (err, user) {
            defer.resolve(user);
        });
    return defer.promise;
};

schema.statics.findPublicUserByEmail = function (email) {
    var defer = Q.defer();
    this.findOne({ 'email': email }, publicFields)
        .populate('permissions')
        .populate('roles')
        .exec(function (err, user) {
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
        defer.resolve(user);
    });
    return defer.promise;
};

// Add plugins

schema.plugin(modifiedOn);
schema.plugin(createInfo);
schema.plugin(versionInfo);

var User  = mongoose.model('User', schema);

module.exports = User;

