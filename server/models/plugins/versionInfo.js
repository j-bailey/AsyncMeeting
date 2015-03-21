var mongoose = require('mongoose');
var db = require('../../db');

module.exports = exports = function versionInfo(schema, options) {
    schema.add({currentVersion: {type: String, default: '0.0.1'}});  // TODO need to figure out the best way to handle the version number
};

