"use strict";

var ObjectId = require('mongoose').Types.ObjectId;
var logger = require('winston');
var RouteError = require('./../../../routes/routeError');

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
        var User = req.db.model('User');
        if (parentId === null) {
            MeetingArea.find({parentMeetingArea: null})
                .exec(function (err, meetingAreas) {
                    if (err) {
                        return next(err);
                    }
                    res.status(200).json(meetingAreas);
                });
        } else {
            MeetingArea.findOne({_id: parentId}, function (err, meetingArea) {
                User.find({_id: req.session.userId}).and()
                MeetingArea.find({parentMeetingArea: (new ObjectId(meetingArea._id))})
                    .exec(function (err, meetingAreas) {
                        if (err) {
                            return next(err);
                        }
                        res.status(200).json(meetingAreas);
                    });
            });
        }
    },
    getMeetingAreaById: function (req, res, next) {
        if (req.params && req.params.meetingAreaId && req.params.meetingAreaId === 24) {
            res.status(400).json(new Error("Error: meetingAreaId is not valid or is missing!"));
            return next();
        }
        var MeetingArea = req.db.model('MeetingArea');

        // TODO: add retrieving only meeting areas the user has access to.
        MeetingArea.findOne({_id: req.params.meetingAreaId})
            .exec(function (err, meetingArea) {
                if (err) {
                    return next(err);
                }

                res.status(200).json(meetingArea);
            });
    },
    createNewMeetingArea: function (req, res, next) {
        var parentId;
        if (req.body && req.body.parentMeetingAreaId && req.body.parentMeetingAreaId === 24) {
            return next(new RouteError(400, 'parent meeting area ID is not valid or is missing.  Please provide a valid parent meeting ID.'));
        } else {
            parentId = req.body.parentMeetingAreaId;
        }

        var MeetingArea = req.db.model('MeetingArea');
        MeetingArea.findOne({_id:parentId}).select('+tenantId').lean().exec(function(err, parentMeetingArea) {
            if (err){
                logger.error(err);
                return next(new RouteError(500, 'Internal server issue'));
            }
            var newTenantId;
            if (parentMeetingArea === null) {
                if (!req.session || !req.session.tenantId) {
                    logger.error('Need user Tenant Id to create a new meeting area');
                    return next(new RouteError());
                }
                newTenantId = req.session.tenantId;
            } else {
                newTenantId = parentMeetingArea.tenantId;
            }
            var meetingArea = new MeetingArea({
                title: req.body.title,
                description: req.body.description,
                parentMeetingArea: parentId ? new ObjectId(parentId) : null,
                tenantId:  newTenantId
            });

            meetingArea.save(function (err, savedMeetingArea) {
                if (err) {
                    logger.error("Error saving meeting area: " + err.message);
                    return next(err);
                }
                res.status(201).json(savedMeetingArea);
            });
        });
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