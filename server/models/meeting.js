var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');

var schema = new mongoose.Schema({
    type: {type: String, required: true},
    format: {type: String, required: false},
    objective: {type: String, required: false},
    agendaItems: {type: String, required: false}
});

// Add static methods

// Add plugins

schema.plugin(modifiedOn);
schema.plugin(createInfo);
schema.plugin(versionInfo);


var Meeting  = mongoose.model('Meeting', schema);

module.exports = Meeting;

