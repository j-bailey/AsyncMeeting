var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');
var db = require('../db');

var schema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: false },
    parentMeetingArea: { type: mongoose.Schema.Types.ObjectId, ref: 'MeetingArea' }
});

var publicFields = 'title description parentMeetingAreaUuid modifiedOn createdOn currentVersion';
schema.statics.publicFields = publicFields;

// Add static methods

// Add plugins

schema.plugin(modifiedOn);
schema.plugin(createInfo);
schema.plugin(versionInfo);


db.readOnlyConnection.model('MeetingArea', schema);
db.readWriteConnection.model('MeetingArea', schema);
db.adminConnection.model('MeetingArea', schema);

module.exports.schema = schema;

