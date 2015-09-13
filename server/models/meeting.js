"use strict";

var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');
var db = require('../db');

var agendaItemSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    approvers: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false}],
    approvalRequest: {type: String, required: true},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});

var reminderSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true}
});

var meetingTypeDef = {
    name: {type: String, required: true},
    description: {type: String, required: true}
};

var meetingFormatDef = {
    name: {type: String, required: true},
    description: {type: String, required: true}
};


var schema = new mongoose.Schema({
    name: {type: String, required: true},
    type: meetingTypeDef,
    format: meetingFormatDef,
    objective: { type: String, required: false },
    agendaItems: [agendaItemSchema],
    invitees: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false}],
    inviteesOnly: {type: Boolean, required: true, default: false},
    reminders: [reminderSchema],
    endDate: {type: Date, required: true, select:true},
    parentMeetingAreaId: {type: mongoose.Schema.Types.ObjectId, ref: 'MeetingArea', required: true}
});

// Schema Methods

var convertReminders = function(meeting){
    for ( var i = 0; meeting.reminders.length > i; i++){
        var validReminder = false;
        for (var ii = 0;  schema.statics.allowedReminders.length > ii; ii++) {
            if (meeting.reminders[i].name === schema.statics.allowedReminders[ii].name){
                meeting.reminders[i] = schema.statics.allowedReminders[ii];
                validReminder = true;
            }
        }
        if (!validReminder){
            throw new Error('Not a valid reminder for a meeting: ' + meeting.reminders[i]);
        }
    }
};

var convertMeetingType = function(meeting){
    var validType = false;
    for (var i = 0;  schema.statics.allowedMeetingTypes.length > i; i++) {
        if (meeting.type.name === schema.statics.allowedMeetingTypes[i].name){
            meeting.type = schema.statics.allowedMeetingTypes[i];
            validType = true;
        }
    }
    if (!validType){
        throw new Error('Not a valid meeting type for a meeting: ' + meeting.type);
    }
};

var convertMeetingFormat = function(meeting){
    var validFormat = false;
    for (var i = 0;  schema.statics.allowedMeetingFormats.length > i; i++) {
        if (meeting.format.name === schema.statics.allowedMeetingFormats[i].name){
            meeting.format = schema.statics.allowedMeetingTypes[i];
            validFormat = true;
        }
    }
    if (!validFormat){
        throw new Error('Not a valid meeting format for a meeting: ' + meeting.format);
    }
};

schema.pre('validate', function(next){
    var meeting = this;
    if (meeting.isNew){
        if (meeting.reminders || meeting.reminders.length > 0) {
            convertReminders(meeting);
        }
        if (meeting.type) {
            convertMeetingType(meeting);
        }
        if (meeting.type) {
            convertMeetingFormat(meeting);
        }
    }
    next();
});


// Add static methods

schema.statics.allowedReminders = [
    {
        id: 200,
        name: "1/4",
        description: "Send a reminder 1/4 way through the meeting"
    },
    {
        id: 210,
        name: "1/2",
        description: "Send a reminder 1/2 way through the meeting"
    },
    {
        id: 220,
        name: "3/4",
        description: "Send a reminder 3/4 way through the meeting"
    },
    {
        id: 230,
        name: "4 hours left",
        description: "Send a reminder when there is 4 hours left"
    },
    {
        id: 240,
        name: "2 hours left",
        description: "Send a reminder when there is 2 hours left"
    },
    {
        id: 250,
        name: "1 hour left",
        description: "Send a reminder when there is 1 hour left"
    }
];

schema.statics.allowedMeetingTypes = [
    {
        id: 1,
        name:'Presentation',
        description:"The meeting organizer is going to present a set of point and the meeting will start."
    },
    {
        id: 2,
        name: 'Collaboration',
        description: "Meeting attendees are going to create something form this meeting"
    },
    {
        id: 3,
        name: 'In-Person',
        description: "This allows people to capture details of meetings outside of the AsyncMeeting platform."
    }
];

schema.statics.allowedMeetingFormats = [
    {
        id: 100,
        name: "Screencast",
        description: "Allows a meeting attendee to record their screen along with their voice for consumption by other meeting attendees"
    },
    {
        id: 110,
        name: "Audio",
        description: "Allows a meeting attendee to record their voice for consumption by other meeting attendees"
    },
    {
        id: 120,
        name: "Text",
        description: "Allows a meeting attendee to record their thoughts in written form"
    }
];

// Add plugins

schema.plugin(modifiedOn);
schema.plugin(createInfo);
schema.plugin(versionInfo);

db.readOnlyConnection.model('Meeting', schema);
db.readWriteConnection.model('Meeting', schema);
db.adminConnection.model('Meeting', schema);

module.exports.schema = schema;

