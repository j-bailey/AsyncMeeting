'use strict';
var fs = require('fs');
var dictionary = {};
// Since we are doing it only once on startup then use sync function
var file = fs.readFileSync(__dirname + '/../../config/bad-password-dictionary.txt', 'utf8');
file.split('\n').forEach(function (password) {
    dictionary[password] = true;
});
file = null; // free memory
// This function will return an error message if the password is not good
// or false if it is proper
module.exports.isImproper = function check(username, password) {
// About 3 percent of users derive the password from the username
// This is not very secure and should be disallowed
    if(password.indexOf(username) !== -1) {
        return 'Password must not contain the username';
    }
    // Compare against dictionary
    if(dictionary[password]) {
        return 'Do not use a common password like: ' + password;
    }
    return false;
};