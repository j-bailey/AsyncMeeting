"use strict";

var ObjectId = require('mongoose').Types.ObjectId,
    logger = require('winston'),
    Q = require('q'),
    Acl = require('../../../../server/security/acl'),
    queryUtils = require('../../../utils/queryUtils'),
    jsonResponse = require('../../../utils/jsonResponseWrapper'),
    handlerUtils = require('../../../utils/handlerUtils'),
    modelUtils = require('../../../utils/modelUtils'),
    RouteError = require('../../../routes/routeError');

var _findAllowedMeetingArea = function (userId, tenantIds, criteria, requestedSkip, requestedLimit, dbConn) {
    var defer = Q.defer();
    var skip = requestedSkip || 0;
    var limit = queryUtils.getMaxQueryLimit('meetingArea', requestedLimit);
    var MeetingArea = dbConn.model('MeetingArea'),
        UserAllowedResources = dbConn.model('UserAllowedResources');
    var uarCriteria = {userId: new ObjectId(userId)};
    var tenantIdArray = [];
    if (tenantIds && tenantIds !== null) {
        if (tenantIds.constructor !== Array) {
            tenantIdArray[0] = tenantIds;
        } else {
            tenantIdArray = tenantIds;
        }
        uarCriteria = {$and: [{userId: uarCriteria.userId}, {tenantId: {$in: tenantIdArray}}]};
    }

    UserAllowedResources.find(uarCriteria)
        .select('resourceId')
        .lean()
        .exec(function (err, allowedResources) {
            if (err) {
                return defer.reject(err);
            }
            var allowedArray = [];
            allowedResources.forEach(function (allowedResource) {
                allowedArray.push(allowedResource.resourceId);
            });
            MeetingArea.find({
                $and: [criteria,
                    {
                        $or: [
                            {ancestors: {$in: allowedArray}},
                            {_id: {$in: allowedArray}}
                        ]
                    }
                ]
            })
                .skip(skip)
                .limit(limit)
                .exec(function (err, meetingAreas) {
                    if (err) {
                        return defer.reject(err);
                    }
                    defer.resolve(meetingAreas);
                });
        });
    return defer.promise;
};

var _grantUserAccess = function (allowedUserId, resourceTenantId, resourceId, permission, dbConn) {
    var defer = Q.defer();
    var User = dbConn.model('User'),
        MeetingArea = dbConn.model('MeetingArea');
    MeetingArea.findById(resourceId)
        .select('+tenantId')
        .lean()
        .exec(function (err, meetingArea) {
            if (err) {
                logger.debug(err);
                defer.reject(new RouteError());
            }
            resourceTenantId = meetingArea.tenantId;
            User.findById(allowedUserId)
                .lean()
                .exec(function (err, userObj) {
                    if (err) {
                        logger.debug(err);
                        defer.reject(new RouteError());
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
                                return defer.reject(new RouteError(400, 'Invalid permission'));
                            }
                            return defer.resolve();
                        }).catch(function (err) {
                            logger.debug(err);
                            return defer.reject(new RouteError());
                        }).done();
                });
        });
    return defer.promise;
};

var _removeUserAccess = function (resourceId, allowedUserId, permission, dbConn) {
    var defer = Q.defer();

    var User = dbConn.model('User');
    User.findById(allowedUserId)
        .lean()
        .exec(function (err, userObj) {
            if (err) {
                logger.debug(err);
                return defer.reject(new RouteError());
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
                        return defer.reject(new RouteError(400, 'Invalid permission'));
                    }
                    defer.resolve();
                }).catch(function (err) {
                    logger.error(err);
                    return defer.reject(new RouteError());
                }).done();
        });
    return defer.promise;
};

var _createMeetingArea = function (meetingArea, ownerName, dbConn, myFirstMeetingArea) {
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
            MeetingArea.find({
                $or: [{_id: meetingArea.parentMeetingArea},
                    {
                        $and: [
                            {parentMeetingArea: null},
                            {tenantId: user.tenantId},
                            {ancestors: []}
                        ]
                    }
                ]
            })
                .sort('-parentMeetingArea')
                .select('+tenantId').lean().exec(function (err, parentMeetingArea) {
                    if (err) {
                        logger.error(err);
                        return defer.reject(new RouteError(500, 'Internal server issue'));
                    }
                    if (parentMeetingArea === null || parentMeetingArea.length === 0) {
                        if (myFirstMeetingArea) {
                            meetingArea.tenantId = user.tenantId;
                            meetingArea.parentMeetingArea = null;
                        } else {
                            logger.error('Need user Tenant Id to create a new meeting area');
                            return defer.reject(new RouteError());
                        }
                    } else {
                        meetingArea.tenantId = parentMeetingArea[0].tenantId;
                        meetingArea.parentMeetingArea = parentMeetingArea[0]._id;
                    }
                    meetingArea.save(function (err, savedMeetingArea) {
                        if (err) {
                            logger.error("Error saving meeting area: " + err.message);
                            return defer.reject(err);
                        }
                        User.addAllowedResource(user._id, savedMeetingArea.tenantId,
                            savedMeetingArea._id, 'MeetingArea').then(function (response, err) {
                                if (err) {
                                    logger.error("Error saving meeting area: " + err.message);
                                    savedMeetingArea.remove();
                                    return defer.reject(err);
                                }
                                var acl = Acl.getAcl();
                                acl.allow('meetingarea-creator-' + savedMeetingArea._id, '/api/meetingareas/' + savedMeetingArea._id, '*');
                                acl.addUserRoles(user.username, 'meetingarea-creator-' + savedMeetingArea._id);
                                acl.allow('meetingarea-viewer', '/api/meetingareas', 'get');
                                acl.addUserRoles(user.username, 'meetingarea-viewer');

                                return defer.resolve(savedMeetingArea);
                            }).catch(function (err) {
                                logger.error("Error saving meeting area: " + err.message);
                                savedMeetingArea.remove();
                                return defer.reject(err);
                            }).done();
                    });
                });
        });
    return defer.promise;
};


module.exports = {
    _findAllowedMeetingArea: _findAllowedMeetingArea,
    getMeetingAreasWithParentId: function (req, res, next) {
        try {
            var parentId = req.query.parentId,
                skip = req.query.skip,
                inTheTrash = (req.query.inTheTrash) ? true : false,
                showAllTrashed = !!(inTheTrash && req.query.inTheTrash.toLowerCase() === 'all'),
                limit = req.query.limit;
            if (parentId === "null") {
                parentId = null;
            }
            modelUtils.throwErrorIfNotObjectId(parentId, true);
            var MeetingArea = req.db.model('MeetingArea');
            var UserAllowedResources = req.db.model('UserAllowedResources');
            var criteria = {};
            if (parentId === null) {
                UserAllowedResources.find({userId: req.session.userDbId})
                    .lean()
                    .exec(function (err, uarObjs) {
                        if (err) {
                            return next(handlerUtils.catchError(err, 'Unable to retrieve meeting areas right now, please again later.'));
                        }
                        var tenantIds = [];
                        uarObjs.forEach(function (uarObj) {
                            tenantIds.push(uarObj.tenantId);
                        });
                        if (!showAllTrashed && inTheTrash) {
                            criteria = {$and: [{inTheTrash: inTheTrash}, {isRootTrashedItem: true}]};
                        } else {
                            criteria.inTheTrash = inTheTrash;
                        }
                        _findAllowedMeetingArea(req.session.userDbId, tenantIds, criteria, skip, limit, req.db).then(function (meetingAreas) {
                            res.status(200).json(jsonResponse.successResponse(meetingAreas));
                        }).catch(function (err) {
                            return next(handlerUtils.catchError(err, 'Unable to retrieve meeting areas right now, please again later.'));
                        }).done();
                    });
            } else {
                MeetingArea.findOne({_id: parentId}).select('+tenantId').lean().exec(function (err, meetingArea) {
                    if (!showAllTrashed && inTheTrash) {
                        criteria = {$and: [{parentMeetingArea: (new ObjectId(meetingArea._id))}, {inTheTrash: inTheTrash}, {isRootTrashedItem: true}]};
                    } else {
                        criteria = {$and: [{parentMeetingArea: (new ObjectId(meetingArea._id))}, {inTheTrash: inTheTrash}]};
                    }
                    _findAllowedMeetingArea(req.session.userDbId, meetingArea.tenantId,
                        criteria, skip, limit, req.db).then(function (meetingAreas) {
                            res.status(200).json(jsonResponse.successResponse(meetingAreas));
                        }).catch(function (err) {
                            return next(handlerUtils.catchError(err, 'Unable to retrieve meeting areas right now, please again later.'));
                        }).done();
                });
            }
        } catch (e) {
            return next(handlerUtils.catchError(e, 'Unable to retrieve meeting areas right now, please again later.'));
        }
    },
    getMeetingAreaById: function (req, res, next) {
        try {
            modelUtils.throwErrorIfNotObjectId(req.params.meetingAreaId, false, 'Need a valid Meeting Area ID');
            var meetingAreaId = req.params.meetingAreaId,
                criteria = {},
                inTheTrash = (req.params.inTheTrash) ? true : false,
                showAllTrashed = !!(inTheTrash && req.params.inTheTrash.toLowerCase() === 'all');

            if (!showAllTrashed && inTheTrash) {
                criteria = {$and: [{_id: new ObjectId(meetingAreaId)}, {inTheTrash: inTheTrash}, {isRootTrashedItem: true}]};
            } else {
                criteria = {$and: [{_id: new ObjectId(meetingAreaId)}, {inTheTrash: inTheTrash}]};
            }
            _findAllowedMeetingArea(req.session.userDbId, null, criteria,
                0, 1, req.db).then(function (meetingAreas) {
                    if (meetingAreas && meetingAreas.length > 0) {
                        res.status(200).json(jsonResponse.successResponse(meetingAreas[0]));
                    } else {
                        res.status(200).json(jsonResponse.successResponse({}));
                    }
                }).catch(function (err) {
                    return next(handlerUtils.catchError(err, 'Unable to retrieve meeting areas right now, please again later.'));
                }).done();
        } catch (e) {
            return next(handlerUtils.catchError(e, 'Unable to retrieve meeting areas right now, please again later.'));
        }
    },
    grantUserAccess: function (req, res, next) {
        try {
            var allowedUserId = req.params.userId,
                resourceTenantId = '',
                resourceId = req.params.meetingAreaId,
                permission = req.body.permission,
                dbConn = req.db;

            modelUtils.throwErrorIfNotObjectId(allowedUserId);
            modelUtils.throwErrorIfNotObjectId(resourceId);

            _grantUserAccess(allowedUserId, resourceTenantId, resourceId, permission, dbConn).then(function () {
                res.status(200).json(jsonResponse.successResponse({}));
            }).catch(function (err) {
                return handlerUtils.catchError(err, 'Unable to grant user access right now, please again later.');
            }).done();
        } catch (e) {
            return next(handlerUtils.catchError(e, 'Unable to grant user access right now, please again later.'));
        }
    },
    _grantUserAccess: _grantUserAccess,
    removeUserAccess: function (req, res, next) {
        try {
            var allowedUserId = req.params.userId,
                resourceId = req.params.meetingAreaId,
                permission = req.body.permission,
                dbConn = req.db;

            modelUtils.throwErrorIfNotObjectId(allowedUserId);
            modelUtils.throwErrorIfNotObjectId(resourceId);

            _removeUserAccess(resourceId, allowedUserId, permission, dbConn).then(function () {
                res.status(200).json(jsonResponse.successResponse({}));
            }).catch(function (err) {
                return next(handlerUtils.catchError(err, 'Unable to remove user access right now, please again later.'));
            }).done();
        } catch (e) {
            return next(handlerUtils.catchError(e, 'Unable to remove user access right now, please again later.'));
        }
    },
    _removeUserAccess: _removeUserAccess,
    createNewMeetingArea: function (req, res, next) {
        try {
            var parentId;
            var dbConn = req.db;

            modelUtils.throwErrorIfNotObjectId((req.body) ? req.body.parentMeetingAreaId : '', true,
                "parent meeting area ID is not valid or is missing.  ' +" +
                "Please provide a valid parent meeting ID.");

            parentId = req.body.parentMeetingAreaId;

            var newTenantId = req.session.tenantId,
                title = req.body.title,
                description = req.body.description,
                username = req.session.userId;

            var MeetingArea = dbConn.model('MeetingArea');
            var meetingArea = new MeetingArea({
                title: title,
                description: description,
                parentMeetingArea: parentId ? new ObjectId(parentId) : null,
                tenantId: newTenantId
            });
            _createMeetingArea(meetingArea, username, req.db).then(function (savedMeetingArea) {
                res.status(201).json(jsonResponse.successResponse(savedMeetingArea));
            }).catch(function (err) {
                return next(handlerUtils.catchError(err, 'Unable to create new meeting area right now, please again later.'));
            }).done();
        } catch (e) {
            return next(handlerUtils.catchError(e, 'Unable to create new meeting area right now, please again later.'));
        }
    },
    _createMeetingArea: _createMeetingArea,
    updateMeetingAreaById: function (req, res, next) {
        try {
            var meetingAreaObj = req.body;
            delete meetingAreaObj.parentMeetingArea;
            delete meetingAreaObj._id;

            var meetingAreaId = req.params.meetingAreaId;
            modelUtils.throwErrorIfNotObjectId(meetingAreaId);

            var search = {_id: meetingAreaId};
            var update = meetingAreaObj;
            var options = {new: true};

            var MeetingArea = req.db.model('MeetingArea');
            MeetingArea.findOneAndUpdate(search, update, options, function (err, meetingArea) {
                if (err) {
                    return handlerUtils.catchError(err, 'Unable to update meeting area right now, please again later.');
                }
                if (meetingArea === null) {
                    res.status(409).json(jsonResponse.successResponse({}));
                } else {
                    res.status(200).json(jsonResponse.successResponse(meetingArea));
                }
            });
        } catch (e) {
            return next(handlerUtils.catchError(e, 'Unable to update meeting area right now, please again later.'));
        }
    },
    deleteMeetingAreaById: function (req, res, next) {
        try {
            modelUtils.throwErrorIfNotObjectId(req.params.meetingAreaId, false, 'Error: meetingAreaId is not valid or is missing!');

            var MeetingArea = req.db.model('MeetingArea');
            MeetingArea.findById(req.params.meetingAreaId)
                .select('inTheTrash')
                .exec()
                .then(function (ma) {
                    if (ma.inTheTrash) {
                        MeetingArea.findOneAndRemove({_id: req.params.meetingAreaId}, function (err) {
                            if (err) {
                                return next(handlerUtils.catchError(err, 'Unable to delete meeting area right now, please again later.'));
                            }
                            res.status(200).json(jsonResponse.successResponse({}));
                        });
                    } else {
                        MeetingArea.findById(req.params.meetingAreaId).exec().then(function (meetingArea) {
                            meetingArea.inTheTrash = true;
                            meetingArea.isRootTrashedItem = true;
                            return meetingArea.save();
                        }).then(function (raw) {
                            res.status(200).json(jsonResponse.successResponse({}));
                        }).catch(function (err) {
                            return next(handlerUtils.catchError(err, 'Unable to delete meeting area right now, please again later.'));
                        }).done();
                    }
                })
        } catch (e) {
            return next(handlerUtils.catchError(e, 'Unable to delete meeting area right now, please again later.'));
        }
    }
};
