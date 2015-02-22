var mongoose = require('mongoose');

var dbUrl = 'mongodb://localhost/asyncmeeting';

mongoose.connect(dbUrl, function () {
    console.log('mongodb connected to ' + dbUrl);
});
module.exports = mongoose;

