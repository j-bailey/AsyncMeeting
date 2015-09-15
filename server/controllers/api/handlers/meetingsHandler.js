"use strict";

var ObjectId = require('mongoose').Types.ObjectId,
    logger = require('winston'),
    Q = require('q'),
    Acl = require('../../../../server/security/acl'),
    jsonResponse = require('../../../utils/jsonResponseWrapper'),
    handlerUtils = require('../../../utils/handlerUtils'),
    modelUtils = require('../../../utils/modelUtils'),
    RouteError = require('../../../routes/routeError');

var _createMeeting = function (meeting, ownerName, dbConn) {
    var defer = Q.defer(),
        MeetingArea = dbConn.model('MeetingArea'),
        User = dbConn.model('User');
    var foundUser, newMeeting;
    User.findOne({username: ownerName})
        .select('+tenantId')
        .lean().exec()
        .then(function (user) {
            foundUser = user;
            return MeetingArea.findOne({_id: new ObjectId(meeting.parentMeetingAreaId)}).select('+tenantId').lean().exec();
        }).then(function (parentMeetingArea) {
            if (!parentMeetingArea) {
                return defer.reject(new RouteError(404));
            }
            meeting.tenantId = parentMeetingArea.tenantId;
            meeting.parentMeetingArea = parentMeetingArea._id;
            return meeting.save();
        }).then(function (savedMeeting) {
            newMeeting = savedMeeting;
            return User.addAllowedResource(foundUser._id, savedMeeting.tenantId, savedMeeting._id, 'Meeting');
        }).then(function () {
            var acl = Acl.getAcl();
            acl.allow('meeting-creator-' + newMeeting._id, '/api/meetings/' + newMeeting._id, '*');
            acl.addUserRoles(foundUser.username, 'meeting-creator-' + newMeeting._id);
            acl.allow('meeting-viewer', '/api/meetings', 'get');
            acl.addUserRoles(foundUser.username, 'meeting-viewer');

            return defer.resolve(newMeeting);
        }).catch(function (err) {
            logger.error("Error saving meeting area: " + err.message);
            if (newMeeting) {
                newMeeting.remove();
            }
            return defer.reject(err);
        }).done();
    return defer.promise;
};

module.exports = {
    getMeetingById: function (req, res, next) {

    },
    createNewMeeting: function (req, res, next) {
        try {
            var dbConn = req.db,
                Meeting = dbConn.model('Meeting'),
                username = req.session.userId,
                newMeeting = new Meeting(req.body);
            _createMeeting(newMeeting, username, dbConn).then(function (savedMeeting) {
                res.status(201).json(jsonResponse.successResponse(savedMeeting));
            }).catch(function (err) {
                return next(handlerUtils.catchError(err, 'Unable to create new meeting right now, please again later.'));
            }).done();
        } catch (e) {
            return next(handlerUtils.catchError(e, 'Unable to create new meeting right now, please again later.'));
        }
    },
    grantUserAccess: function (req, res, next) {

    },
    deleteMeetingById: function (req, res, next) {
        try {
            var dbConn = req.db,
                Meeting = dbConn.model('Meeting'),
                meetingId = req.params.meetingId;
            Meeting.findById(meetingId).exec()
                .then(function(meeting){
                    return meeting.remove();
                })
                .then(function(deletedMeeting){
                    res.status(200).json(jsonResponse.successResponse(deletedMeeting));
                })
                .catch(function(err){
                    return next(handlerUtils.catchError(err, 'Unable to delete meeting right now, please again later.'));
                }).done();
        } catch (e) {
            return next(handlerUtils.catchError(e, 'Unable to delete meeting right now, please again later.'));
        }
    },
    removeUserAccess: function (req, res, next) {

    },
    updateMeetingById: function (req, res, next) {

    },
    addReply: function (req, res, next) {

    }
};
