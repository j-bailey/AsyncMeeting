"use strict";

var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');
var tenantInfo = require('./plugins/tenantInfo');
var trashable = require('./plugins/trashable');
var logger = require('winston');
var db = require('../db');

var schema = new mongoose.Schema({
    title: { type: String, required: true, select: true },
    description: { type: String, required: false, select: true },
    inheritsParentAccess: {type: Boolean, required: true, default: true, select: true},
    parentMeetingArea: { type: mongoose.Schema.Types.ObjectId, ref: 'MeetingArea', select: true },
    ancestors: {type: [mongoose.Schema.Types.ObjectId], ref: 'MeetingArea', default:[], select:true}
});

schema.pre('init', function(next) {
    try {
        var meeting = this;
        if (!meeting.trashSetIds){
            meeting.trashSetIds = [];
        }
        //meeting.trashSetIds.push('ancestors|MeetingArea');  // This walks up the tree which is bad
        meeting.trashSetIds.push('ancestors|MeetingArea|others');
        meeting.trashSetIds.push('Meeting:parentMeetingAreaId');
    } catch (e){
        logger.error(e);
        next(e);
    }
    next();
});


schema.pre('validate', function (next) {
    var meetingArea = this;
    if (meetingArea.isNew){
        if (!meetingArea.parentMeetingArea || (meetingArea.parentMeetingArea && meetingArea.parentMeetingArea === null)) {
            meetingArea.ancestors = [];
            return next();
        } else if (meetingArea.parentMeetingArea) {
            setAncestors(meetingArea, meetingArea.parentMeetingArea,next);
        } else {
            return next();
        }
    } else {
        if (meetingArea.isModified('ancestors') || meetingArea.isModified('parentMeetingArea')){
            delete meetingArea.ancestors; // changing the parent of a meeting area is not allowed
            delete meetingArea.parentMeetingArea;
            //result = arePropertiesInSync(meetingArea);
        }
        if (meetingArea.isModified('parentMeetingArea')){
            return next('Not allowed to change the parent of a meeting area at this time.');
        }
        return next();
    }
});

var setAncestors = function(meetingArea, parentMeetingArea, next) {
    if (!parentMeetingArea  || parentMeetingArea === null) {
        meetingArea.ancestors = [];
        return next();
    } else {
        db.readOnlyConnection.model('MeetingArea').findById(parentMeetingArea).lean().exec(function (err, parent) {
            if (err) {
                next(err);
                return;
            }
            if (parent === null) {
                logger.warn('Could not find meeting area for id: ' + parentMeetingArea.toString());
                return next('Could not find meeting area for id: ' + parentMeetingArea.toString());
            } else {
                var ancestors = parent.ancestors;
                ancestors.push(parent._id);
                meetingArea.ancestors = ancestors;
                return next();
            }
        });
    }
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
schema.plugin(tenantInfo);
schema.plugin(trashable);


db.readOnlyConnection.model('MeetingArea', schema);
db.readWriteConnection.model('MeetingArea', schema);
db.adminConnection.model('MeetingArea', schema);

module.exports.schema = schema;

