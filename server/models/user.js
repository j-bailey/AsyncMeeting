var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');

var schema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: String,
    firstName: String,
    lastName: String,
    permissions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Permission'}],
    roles: [{type: mongoose.Schema.Types.ObjectId, ref: 'Role'}]

});

// Add static methods
schema.statics.findPublicUserById = function (userId, callback) {
    return this.findById(userId, 'username email permissions roles createdOn modifiedOn firstName lastName')
        .populate('permissions')
        .populate('roles')
        .exec();
};
schema.statics.findPublicUserByUserName = function (userName, Promise, callback) {
    var defer = new Promise();  //TODO Bug need to figure out how to do a Promise in NodeJS or Mongoose
    this.findOne({'username': userName}, 'username email permissions roles createdOn modifiedOn firstName lastName')
        .populate('permissions')
        .populate('roles')
        .exec(function (err, user) {
            defer.resolve(user);
        });
    return defer.promise();
};

// Add plugins

schema.plugin(modifiedOn);
schema.plugin(createInfo);
schema.plugin(versionInfo);


var User  = mongoose.model('User', schema);

module.exports = User;

