var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');
var Q = require('q');

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
schema.statics.findPublicUserById = function (userId) {
    return this.findById(userId, 'username email permissions roles createdOn modifiedOn firstName lastName')
        .populate('permissions')
        .populate('roles')
        .exec();
};
schema.statics.findPublicUserByUserName = function (userName) {
    var defer = Q.defer();  //TODO Bug need to figure out how to do a Promise in NodeJS or Mongoose
    this.findOne({ 'username': userName }, 'username email permissions roles createdOn modifiedOn firstName lastName')
        .populate('permissions')
        .populate('roles')
        .exec(function (err, user) {
            defer.resolve(user);
        });
    return defer.promise;
};

schema.statics.findPublicUserByEmail = function (email) {
    var defer = Q.defer();  //TODO Bug need to figure out how to do a Promise in NodeJS or Mongoose
    this.findOne({ 'email': email }, 'username email permissions roles createdOn modifiedOn firstName lastName')
        .populate('permissions')
        .populate('roles')
        .exec(function (err, user) {
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

