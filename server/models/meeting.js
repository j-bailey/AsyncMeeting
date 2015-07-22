var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');
var db = require('../db');

var schema = new mongoose.Schema({
    type: { type: String, required: true },
    format: { type: String, required: false },
    objective: { type: String, required: false },
    agendaItems: { type: String, required: false }
});

// Add static methods

// Add plugins

schema.plugin(modifiedOn);
schema.plugin(createInfo);
schema.plugin(versionInfo);

db.readOnlyConnection.model('Meeting', schema);
db.readWriteConnection.model('Meeting', schema);
db.adminConnection.model('Meeting', schema);

module.exports.schema = schema;

