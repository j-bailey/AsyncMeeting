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
    User.findOne({username: ownerName})
        .select('+tenantId')
        .lean().exec(function (err, user) {
            if (err) {
                logger.error(err);
                return defer.reject(new RouteError(500, 'Internal server issue'));
            }
            MeetingArea.findOne({_id: new ObjectId(meeting.parentMeetingAreaId)})
                .select('+tenantId').lean().exec(function (err, parentMeetingArea) {
                    if (err) {
                        logger.error(err);
                        return defer.reject(new RouteError(500, 'Internal server issue'));
                    }
                    if (!parentMeetingArea) {
                        return defer.reject(new RouteError(404));
                    }
                    meeting.tenantId = parentMeetingArea.tenantId;
                    meeting.parentMeetingArea = parentMeetingArea._id;
                    meeting.save(function (err, savedMeeting) {
                        if (err) {
                            logger.error("Error saving meeting area: " + err.message);
                            return defer.reject(err);
                        }
                        User.addAllowedResource(user._id, savedMeeting.tenantId,
                            savedMeeting._id, 'Meeting').then(function (response, err) {
                                if (err) {
                                    logger.error("Error saving meeting area: " + err.message);
                                    savedMeeting.remove();
                                    return defer.reject(err);
                                }
                                var acl = Acl.getAcl();
                                acl.allow('meeting-creator-' + savedMeeting._id, '/api/meetings/' + savedMeeting._id, '*');
                                acl.addUserRoles(user.username, 'meeting-creator-' + savedMeeting._id);
                                acl.allow('meeting-viewer', '/api/meetings', 'get');
                                acl.addUserRoles(user.username, 'meeting-viewer');

                                return defer.resolve(savedMeeting);
                            }).catch(function (err) {
                                logger.error("Error saving meeting area: " + err.message);
                                savedMeeting.remove();
                                return defer.reject(err);
                            }).done();
                    });
                });
        });
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

    },
    removeUserAccess: function (req, res, next) {

    },
    updateMeetingById: function (req, res, next) {

    },
    addReply: function (req, res, next) {

    }
};
