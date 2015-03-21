var mongoose = require('mongoose');
var acl = require('acl');

var dbVersion = '0.0.1';

var dbUrl = 'mongodb://localhost/asyncmeeting';
var self = this;
var db = null;

mongoose.connect(dbUrl, function (err, db) {
    console.log('mongodb connected to ' + dbUrl);
    self.backend = new acl.mongodbBackend(db, "acl");
    require('./security/acl');
});

exports.getDb = function() {

}

module.exports = mongoose;

