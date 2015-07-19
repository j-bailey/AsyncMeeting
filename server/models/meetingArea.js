var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');
var uuid = require('./plugins/uuid');


var schema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: false },
    parentMeetingArea: { type: mongoose.Schema.Types.ObjectId, ref: 'MeetingArea' },
    parentMeetingAreaUuid: {type: String}
});

// Add static methods

// Add plugins

schema.plugin(modifiedOn);
schema.plugin(createInfo);
schema.plugin(versionInfo);
schema.plugin(uuid);


var MeetingArea  = mongoose.model('MeetingArea', schema);

module.exports = MeetingArea;

