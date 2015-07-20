var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');


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


var MeetingArea  = mongoose.model('MeetingArea', schema);

module.exports = MeetingArea;

