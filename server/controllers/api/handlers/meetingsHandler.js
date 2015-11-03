"use strict";

var ObjectId = require('mongoose').Types.ObjectId,
    logger = require('winston'),
    Q = require('q'),
    Acl = require('../../../../server/security/acl'),
    queryUtils = require('../../../utils/queryUtils'),
    jsonResponse = require('../../../utils/jsonResponseWrapper'),
    handlerUtils = require('../../../utils/handlerUtils'),
    meetingAreaHandler = require('./meetingAreasHandler'),
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
    //getMeetingById: function (req, res, next) {
    //
    //},
    getMeetings: function (req, res, next) {
        try {
            var dbConn = req.db,
                Meeting = dbConn.model('Meeting'),
                skip = req.query.skip || 0,
                sort = req.query.sort || '',
                inTheTrash = (req.query.inTheTrash) ? true : false,
                limit = queryUtils.getMaxQueryLimit('meeting', req.query.limit);

            var UserAllowedResources = req.db.model('UserAllowedResources');
            UserAllowedResources.find({userId: req.session.userDbId})
                .lean()
                .exec()
                .then(function (uarObjs) {
                    var tenantIds = [];
                    uarObjs.forEach(function (uarObj) {
                        tenantIds.push(uarObj.tenantId);
                    });
                    return meetingAreaHandler._findAllowedMeetingArea(req.session.userDbId, tenantIds, {}, 0, 0, req.db);
                })
                .then(function (meetingAreas) {
                    var areaIds = [];
                    meetingAreas.forEach(function (obj) {
                        areaIds.push(obj._id);
                    });
                    return Meeting.find({
                        $and: [
                            {parentMeetingAreaId: {$in: areaIds}},
                            {inTheTrash: inTheTrash}
                        ]
                    })
                        .skip(skip)
                        .limit(limit)
                        .sort(sort)
                        .lean()
                        .exec();
                }).then(function (meetings) {
                    res.status(200).json(jsonResponse.successResponse(meetings));
                })
                .catch(function (err) {
                    return next(handlerUtils.catchError(err, 'Unable to create new meeting right now, please again later.'));
                }).done();
        } catch (e) {
            return next(handlerUtils.catchError(e, 'Unable to create new meeting right now, please again later.'));
        }
    },
    _createMeeting: _createMeeting,
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
    //grantUserAccess: function (req, res, next) {
    //
    //},
    deleteMeetingById: function (req, res, next) {
        try {
            var dbConn = req.db,
                Meeting = dbConn.model('Meeting'),
                meetingId = req.params.meetingId;
            Meeting.findById(meetingId).select('inTheTrash').exec()
                .then(function (meeting) {
                    if (meeting.inTheTrash) {
                        meeting.remove()
                            .then(function () {
                                var acl = Acl.getAcl();
                                acl.removeResource('/api/meetings/' + meetingId, function (err) {
                                    if (err) {
                                        next(err);
                                    }
                                });
                                res.status(200).json(jsonResponse.successResponse({}));
                            });
                    } else {
                        meeting.inTheTrash = true;
                        meeting.isRootTrashedItem = true;
                        meeting.save()
                            .then(function () {
                                res.status(200).json(jsonResponse.successResponse({}));
                            }).catch(function (err) {
                                return next(handlerUtils.catchError(err, 'Unable to delete meeting area right now, please again later.'));
                            }).done();
                    }
                }).catch(function (err) {
                    return next(handlerUtils.catchError(err, 'Unable to delete meeting right now, please again later.'));
                }).done();

        } catch (e) {
            return next(handlerUtils.catchError(e, 'Unable to delete meeting right now, please again later.'));
        }
    },
    //removeUserAccess: function (req, res, next) {
    //
    //},
    //addReply: function (req, res, next) {
    //
    //},
    updateMeetingById: function (req, res, next) {
        try {
            var dbConn = req.db,
                Meeting = dbConn.model('Meeting'),
                newMeeting = req.body,
                meetingId = req.params.meetingId;
            delete newMeeting.parentMeetingAreaId;
            delete newMeeting._id;
            delete newMeeting.format;
            delete newMeeting.type;
            Meeting.findByIdAndUpdate(meetingId, newMeeting).exec()
                .then(function (updatedMeeting) {
                    res.status(200).json(jsonResponse.successResponse(updatedMeeting));
                })
                .catch(function (err) {
                    return next(handlerUtils.catchError(err, 'Unable to update meeting right now, please again later.'));
                }).done();
        } catch (e) {
            return next(handlerUtils.catchError(e, 'Unable to update meeting right now, please again later.'));
        }
    }
};
