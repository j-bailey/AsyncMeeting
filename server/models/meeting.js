"use strict";

var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');
var db = require('../db');
var logger = require('winston');


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
    type: {type: String, enum: ['Presentation', 'Collaboration', 'In-Person']},
    format: {type: String, enum: ['Screencast', 'Audio', 'Text']},
    objective: { type: String, required: true },
    agendaItems: [agendaItemSchema],
    invitees: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false}],
    inviteesOnly: {type: Boolean, required: true, default: false},
    reminders: [{type: String, enum: ['1/4', '1/2', '3/4', '4 hours left', '2 hours left', '1 hours left' ]}],
    endDate: {type: Date, required: true, select:true},
    parentMeetingAreaId: {type: mongoose.Schema.Types.ObjectId, ref: 'MeetingArea', required: true}
});

// Schema Methods


schema.pre('validate', function(next){
    try {
        var meeting = this;
        if (meeting.isNew) {
            if (meeting.agendaItems && meeting.agendaItems.length > 0) {
                meeting.agendaItems.forEach(function (agendaItem) {
                    agendaItem.approvers.forEach(function (approver) {
                        if (meeting.invitees.indexOf(approver) === -1) {
                            meeting.invitees.push(approver);
                        }
                    })
                });
            }
        }
    } catch (e){
        logger.error(e);
        next(e);
    }
    next();
});


// Add static methods

schema.statics.allowedReminders = [
    {
        name: "1/4",
        description: "Send a reminder 1/4 way through the meeting"
    },
    {
        name: "1/2",
        description: "Send a reminder 1/2 way through the meeting"
    },
    {
        name: "3/4",
        description: "Send a reminder 3/4 way through the meeting"
    },
    {
        name: "4 hours left",
        description: "Send a reminder when there is 4 hours left"
    },
    {
        name: "2 hours left",
        description: "Send a reminder when there is 2 hours left"
    },
    {
        name: "1 hour left",
        description: "Send a reminder when there is 1 hour left"
    }
];

schema.statics.allowedMeetingTypes = [
    {
        name:'Presentation',
        description:"The meeting organizer is going to present a set of point and the meeting will start."
    },
    {
        name: 'Collaboration',
        description: "Meeting attendees are going to create something form this meeting"
    },
    {
        name: 'In-Person',
        description: "This allows people to capture details of meetings outside of the AsyncMeeting platform."
    }
];

schema.statics.allowedMeetingFormats = [
    {
        name: "Screencast",
        description: "Allows a meeting attendee to record their screen along with their voice for consumption by other meeting attendees"
    },
    {
        name: "Audio",
        description: "Allows a meeting attendee to record their voice for consumption by other meeting attendees"
    },
    {
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

