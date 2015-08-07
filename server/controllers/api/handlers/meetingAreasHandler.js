"use strict";

var ObjectId = require('mongoose').Types.ObjectId,
    logger = require('winston'),
    Q = require('q'),
    Acl = require('../../../../server/security/acl'),
    RouteError = require('./../../../routes/routeError');

module.exports = {
    getMeetingAreasWithParentId: function (req, res, next) {
        // TODO: add retrieving only meeting areas the user has access to.
        // Check for parent query parameters.
        var parentId = req.query.parentId;
        if (parentId === "null") {
            parentId = null;
            //}
            //else if (parentId === null) {
            //    return next("Error: query parameter for parentId must be specified!");
        } else if (parentId && parentId.length !== 24) {
            res.status(400).json(new Error("Error: parentId is not correct!"));
            return next();
        }
        var MeetingArea = req.db.model('MeetingArea');
        var UserAllowedResources = req.db.model('UserAllowedResources');
        if (parentId === null) {
            MeetingArea.find({parentMeetingArea: null})
                .exec(function (err, meetingAreas) {
                    if (err) {
                        return next(err);
                    }
                    res.status(200).json(meetingAreas);
                });
        } else {
            MeetingArea.findOne({_id: parentId}).select('+tenantId').lean().exec(function (err, meetingArea) {
                var User = req.db.model('User');
                User.findOne({username: req.session.userId}).lean().exec(function(err, user) {
                    UserAllowedResources.find({userId: user._id})
                        .and({tenantId: meetingArea.tenantId})
                        .select('resourceId')
                        .lean()
                        .exec(function (err, allowedResources) {
                            console.log(JSON.stringify(allowedResources))
                            var allowedArray = [];
                            allowedResources.forEach(function(allowedResource){
                                allowedArray.push(allowedResource.resourceId);
                                //allowedArray = allowedResource.resourceId;
                            });
                            var a = JSON.stringify(allowedArray);
                            MeetingArea.find({parentMeetingArea: (new ObjectId(meetingArea._id))})
                                .and({ancestors: { $in: allowedArray}})
                                .exec(function (err, meetingAreas) {
                                    if (err) {
                                        return next(err);
                                    }
                                    res.status(200).json(meetingAreas);
                                });
                        });
                });
            });
        }
    },
    getMeetingAreaById: function (req, res, next) {
        if (req.params && req.params.meetingAreaId && req.params.meetingAreaId === 24) {
            res.status(400).json(new Error("Error: meetingAreaId is not valid or is missing!"));
            return next();
        }
        var MeetingArea = req.db.model('MeetingArea'),
            userTenantId = req.session.tenantId;

        // TODO: add retrieving only meeting areas the user has access to.
        MeetingArea.findOne({_id: req.params.meetingAreaId})
            .exec(function (err, meetingArea) {
                if (err) {
                    return next(err);
                }
                if (meetingArea.tenantId === userTenantId) {
                    res.status(200).json(meetingArea);
                }
            });
    },
    grantUserAccess: function(req, res, next){
        var User = req.db.model('User'),
            MeetingArea = req.db.model('MeetingArea');

        var allowedUserId = req.params.userId,
            resourceTenantId = '',
            resourceId = req.params.meetingAreaId,
            permission = req.body.permission;

        MeetingArea.findById(resourceId)
            .select('+tenantId')
            .lean()
            .exec(function(err, meetingArea) {
                if (err){
                    logger.debug(err);
                    return next(new RouteError());
                }
                resourceTenantId = meetingArea.tenantId;
                User.findById(allowedUserId)
                    .lean()
                    .exec(function(err, userObj) {
                        if (err){
                            logger.debug(err);
                            return next(new RouteError());
                        }
                        User.addAllowedResource(allowedUserId, resourceTenantId, resourceId, User.MEETING_AREA_RESOURCE_TYPE)
                            .then(function () {
                                var acl = Acl.getAcl();
                                if (permission === 'viewer') {
                                    acl.allow('meetingarea-viewer-' + resourceId, '/api/meetingareas/' + resourceId, 'get');
                                    acl.addUserRoles(userObj.username, 'meetingarea-viewer-' + resourceId);
                                } else if (permission === 'editor') {
                                    acl.allow('meetingarea-editor-' + resourceId, '/api/meetingareas/' + resourceId, ['get', 'put']);
                                    acl.addUserRoles(userObj.username, 'meetingarea-editor-' + resourceId);
                                } else if (permission === 'admin') {
                                    acl.allow('meetingarea-admin-' + resourceId, '/api/meetingareas/' + resourceId, ['get', 'post', 'put', 'delete']);
                                    acl.addUserRoles(userObj.username, 'meetingarea-admin-' + resourceId);
                                } else {
                                    logger.error('Got bad permission "' + permission + '" while granting user access to meeting area');
                                    return next(new RouteError(400, 'Invalid permission'));
                                }
                                res.sendStatus(200);
                            }).catch(function (err) {
                                return next(new RouteError());
                            })
                    });
            });
    },
    removeUserAccess: function(req, res, next) {
        var User = req.db.model('User'),
            MeetingArea = req.db.model('MeetingArea');

        var allowedUserId = req.params.userId,
            resourceId = req.params.meetingAreaId,
            permission = req.body.permission;
        MeetingArea.findById(resourceId)
            .select('+tenantId')
            .lean()
            .exec(function(err, meetingArea) {
                if (err){
                    logger.debug(err);
                    return next(new RouteError());
                }
                User.findById(allowedUserId)
                    .lean()
                    .exec(function(err, userObj) {
                        if (err){
                            logger.debug(err);
                            return next(new RouteError());
                        }
                        User.removeAllowedResource(allowedUserId, resourceId, User.MEETING_AREA_RESOURCE_TYPE)
                            .then(function () {
                                var acl = Acl.getAcl();
                                if (permission === 'viewer') {
                                    acl.removeUserRoles(userObj.username, 'meetingarea-viewer-' + resourceId);
                                } else if (permission === 'editor') {
                                    acl.removeUserRoles(userObj.username, 'meetingarea-editor-' + resourceId);
                                } else if (permission === 'admin') {
                                    acl.removeUserRoles(userObj.username, 'meetingarea-admin-' + resourceId);
                                } else {
                                    logger.error('Got bad permission "' + permission + '" while granting user access to meeting area');
                                    return next(new RouteError(400, 'Invalid permission'));
                                }
                                res.sendStatus(200);
                            }).catch(function (err) {
                                return next(new RouteError());
                            })
                    });
            });
    },
    createNewMeetingArea: function (req, res, next) {
        var parentId;
        if (req.body && req.body.parentMeetingAreaId && req.body.parentMeetingAreaId === 24) {
            return next(new RouteError(400, 'parent meeting area ID is not valid or is missing.  Please provide a valid parent meeting ID.'));
        } else {
            parentId = req.body.parentMeetingAreaId;
        }

        var meetingArea = new MeetingArea({
            title: title,
            description: description,
            parentMeetingArea: parentId ? new ObjectId(parentId) : null,
            tenantId:  newTenantId
        });

        var newTenantId = req.session.tenantId,
            title = req.body.title,
            description = req.body.description,
            username = req.session.userId;
        _createMeetingArea(meetingArea, username, req.db).then(function(savedMeetingArea){
            res.status(201).json(savedMeetingArea);
        }).catch(function(err){
            return next(err);
        });
    },
    _createMeetingArea: function(meetingArea, ownerName, dbConn){
        var defer = Q.defer(),
            MeetingArea = dbConn.model('MeetingArea'),
            User = dbConn.model('User');
        MeetingArea.findOne({_id:meetingArea.parentMeetingArea}).select('+tenantId').lean().exec(function(err, parentMeetingArea) {
            if (err){
                logger.error(err);
                return defer.reject(new RouteError(500, 'Internal server issue'));
            }
            if (parentMeetingArea === null) {
                if (!meetingArea.tenantId) {
                    logger.error('Need user Tenant Id to create a new meeting area');
                    return defer.reject(new RouteError());
                }
            } else {
                meetingArea.tenantId = parentMeetingArea.tenantId;
            }
            meetingArea.parentMeetingArea =  meetingArea.parentMeetingArea ? new ObjectId(meetingArea.parentMeetingArea) : null;

            meetingArea.save(function (err, savedMeetingArea) {
                if (err) {
                    logger.error("Error saving meeting area: " + err.message);
                    return defer.reject(err);
                }
                User.findOne({username: ownerName}).lean().exec(function(err, user) {
                    User.addAllowedResource(user._id, savedMeetingArea.tenantId, savedMeetingArea._id, 'MeetingArea').then(function(response, err) {
                        if (err) {
                            logger.error("Error saving meeting area: " + err.message);
                            savedMeetingArea.remove();
                            return defer.reject(err);
                        }
                        var acl = Acl.getAcl();
                        acl.allow('meetingarea-creator-' + savedMeetingArea._id, '/api/meetingareas/' + savedMeetingArea._id, '*');
                        acl.addUserRoles(user.username, 'meetingarea-creator-' + savedMeetingArea._id);

                        return defer.resolve(savedMeetingArea);
                    }).catch(function(err){
                        logger.error("Error saving meeting area: " + err.message);
                        savedMeetingArea.remove();
                        return defer.reject(err);
                    });
                });
            });
        });
        return defer.promise;
    },
    updateMeetingAreaById: function (req, res, next) {
        if (req.params && req.params.meetingAreaId && req.params.meetingAreaId === 24) {
            res.status(400).json(new Error("Error: meetingAreaId is not valid or is missing!"));
            return next();
        }

        var meetingAreaObj = req.body;
        delete meetingAreaObj.parentMeetingArea;
        delete meetingAreaObj.__id;
        var search = {_id: req.params.meetingAreaId};
        var update = meetingAreaObj;
        var options = {new: true};

        var MeetingArea = req.db.model('MeetingArea');
        MeetingArea.findOneAndUpdate(search, update, options, function (err, meetingArea) {
            if (err) {
                return next(err);
            }
            if (meetingArea === null){
                res.status(409).json({});
            } else {
                res.status(200).json(meetingArea);
            }
        });
    },
    deleteMeetingAreaById: function (req, res, next) {
        if (req.params && req.params.meetingAreaId && req.params.meetingAreaId === 24) {
            res.status(400).json(new Error("Error: meetingAreaId is not valid or is missing!"));
            return next();
        }

        var MeetingArea = req.db.model('MeetingArea');
        MeetingArea.findOneAndRemove({_id: req.params.meetingAreaId}, function (err) {
            if (err) {
                return next(err);
            }
            res.sendStatus(200);
        });
    }
};