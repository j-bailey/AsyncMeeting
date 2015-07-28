"use strict";

var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');
var db = require('../db');

var schema = new mongoose.Schema({
    title: { type: String, required: true, select: true },
    description: { type: String, required: false, select: true },
    parentMeetingArea: { type: mongoose.Schema.Types.ObjectId, ref: 'MeetingArea', select: true },
    ancestors: {type: [mongoose.Schema.Types.ObjectId], ref: 'MeetingArea', default:[], select:true}
});


schema.pre('validate', function (next) {
    var meetingArea = this;
    if (meetingArea.isNew){
        if (!meetingArea.parentMeetingArea || (meetingArea.parentMeetingArea && meetingArea.parentMeetingArea === null)) {
            meetingArea.ancestors = [];
            next();
        } else if (meetingArea.parentMeetingArea) {
            setAncestors(meetingArea, meetingArea.parentMeetingArea, undefined,next);
        } else {
            next();
        }
    } else {
        if (meetingArea.isModified('ancestors') || meetingArea.isModified('parentMeetingArea')){
            delete meetingArea.ancestors; // changing the parent of a meeting area is not allowed
            delete meetingArea.parentMeetingArea;
            //result = arePropertiesInSync(meetingArea);
            next();
        }
        next();
    }
});

var setAncestors = function(meetingArea, parentMeetingArea, ancestors, next) {
    if (ancestors === undefined || ancestors === null) {
        ancestors = [];
    }
    db.readOnlyConnection.model('MeetingArea').findById(parentMeetingArea).lean().exec(function(err, parent){
        if (err) {
            next(err);
            return;
        }
        ancestors.unshift(parent._id);
        if (parent.parentMeetingArea && parent.parentMeetingArea !== null) {
            setAncestors(meetingArea, parent.parentMeetingArea, ancestors, next);
        } else {
            meetingArea.ancestors = ancestors;
            next();
        }
    });
};

//var arePropertiesInSync = function(meetingArea){
//    if (!meetingArea.ancestros || !meetingArea.parentMeetingArea) {
//        return new Error('This item is missing ancestors and/or parent meeting area ' + meetingArea._id);
//    } else if (meetingArea.ancestors.length > 0 && meetingArea.parentMeetingArea != null) {
//        var lastEntry = meetingArea.ancestors[meetingArea.ancestors.length - 1];
//        if (lastEntry === meetingArea.parentMeetingArea) {
//            return null;
//        } else {
//            return new Error('Ancestors last entry does not match the parent meeting area');
//        }
//    } else if (meetingArea.ancestors.length > 0 && meetingArea.parentMeetingArea === null) {
//        return new Error ('Ancestors and parent are not in sync, parent meeting area is null while ancestors is not empty');
//    } else if (meetingArea.ancestors.length === 0 && meetingArea.parentMeetingArea != null) {
//        return new Error ('Ancestors and parent are not in sync, ancestors is empty while parent meeting area is not null');
//    }
//};

// Add static methods

// Add plugins

schema.plugin(modifiedOn);
schema.plugin(createInfo);
schema.plugin(versionInfo);


db.readOnlyConnection.model('MeetingArea', schema);
db.readWriteConnection.model('MeetingArea', schema);
db.adminConnection.model('MeetingArea', schema);

module.exports.schema = schema;

