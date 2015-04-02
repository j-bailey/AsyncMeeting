var mongoose = require('mongoose');
var Q = require('q');
var acl =  require('./security/acl');

var dbVersion = '0.0.1';

var dbUrl = 'mongodb://localhost/asyncmeeting';

mongoose.connect(dbUrl, function (err, db) {
    console.log('mongodb connected to ' + dbUrl);
    acl.init(db);
});

module.exports = mongoose;

