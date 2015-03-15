var mongoose = require('mongoose');

var dbVersion = '0.0.1';

var dbUrl = 'mongodb://localhost/asyncmeeting';

mongoose.connect(dbUrl, function () {
    console.log('mongodb connected to ' + dbUrl);
});
module.exports = mongoose;

