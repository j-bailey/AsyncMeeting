"use strict";
var MeetingArea = require('../../../../server/models/meetingArea');
var ObjectId = require('mongoose').Types.ObjectId;
var logger = require('winston');

var getMeetingAreasWithParentId = function (req, res, next) {
    // TODO: add retrieving only meeting areas the user has access to.
    // Check for parent query parameters.
    var parentId = req.query.parentId;

    if (parentId === "null") {
        parentId = null;
        //}
        //else if (parentId === null) {
        //    return next("Error: query parameter for parentId must be specified!");
    } else if (parentId && parentId.length !== 36) {
        res.status(400).json(new Error("Error: parentId is not correct!"));
        return next();
    }
    if (parentId === null) {
        MeetingArea.find({parentMeetingArea: null}, function (err, meetingAreas) {
            if (err) {
                return next(err);
            }
            res.status(200).json(meetingAreas);
        });
    } else {
        MeetingArea.findOne({uuid: parentId}, function (err, meetingArea) {
            MeetingArea.find({parentMeetingArea: (new ObjectId(meetingArea._id))}, function (err, meetingAreas) {
                if (err) {
                    return next(err);
                }
                res.status(200).json(meetingAreas);
            });
        });
    }
};

var getMeetingAreaByUuid = function (req, res, next) {
    if (req.params && req.params.meetingAreaId && req.params.meetingAreaId === 36) {
        res.status(400).json(new Error("Error: meetingAreaId is not valid or is missing!"));
        return next();
    }

    // TODO: add retrieving only meeting areas the user has access to.
    MeetingArea.findOne({uuid: req.params.meetingAreaId}, function (err, meetingArea) {
        if (err) {
            return next(err);
        }

        res.status(200).json(meetingArea);
    });
};

var createNewMeetingArea = function (req, res, next) {
    var parentId;
    if (req.body && req.body.parentMeetingAreaId && req.body.parentMeetingAreaId === 36) {
        res.status(400).json(new Error("Error: parentMeetingAreaId is not valid or is missing!"));
        return next();
    } else {
        parentId = req.body.parentMeetingAreaId;
    }


    MeetingArea.findOne({uuid: parentId}, function (err, parentMeetingArea) {
        if (err) {
            return next(err);
        }

        var meetingArea = new MeetingArea({
            title: req.body.title,
            description: req.body.description,
            parentMeetingArea: parentMeetingArea ? new ObjectId(parentMeetingArea._id) : null
        });

        meetingArea.save(function (err, savedMeetingArea) {
            if (err) {
                logger.error("Error saving meeting area: " + err.message);
                return next(err);
            }
            res.status(201).json(savedMeetingArea);
        });
    });
};

var updateMeetingAreaByUuid = function (req, res, next) {
    if (req.params && req.params.meetingAreaId && req.params.meetingAreaId === 36) {
        res.status(400).json(new Error("Error: meetingAreaId is not valid or is missing!"));
        return next();
    }

    MeetingArea.findOne({uuid: req.params.meetingAreaId}, function (err, meetingArea) {
        if (err) {
            return next(err);
        }

        meetingArea.title = req.body.title;
        meetingArea.description = req.body.description;

        meetingArea.save(function (err, savedMeetingArea) {
            if (err) {
                logger.error("Error updating meeting area: " + err.message);
                return next(err);
            }

            res.status(200).json(savedMeetingArea);
        });
    });
};

var deleteMeetingAreaByUuid = function (req, res, next) {
    if (req.params && req.params.meetingAreaId && req.params.meetingAreaId === 36) {
        res.status(400).json(new Error("Error: meetingAreaId is not valid or is missing!"));
        return next();
    }

    MeetingArea.findOneAndRemove({uuid: req.params.meetingAreaId}, function (err) {
        if (err) {
            return next(err);
        }
        res.sendStatus(200);
    });
};

module.exports = {
    getMeetingAreaByUuid: getMeetingAreaByUuid,
    createNewMeetingArea: createNewMeetingArea,
    updateMeetingAreaByUuid: updateMeetingAreaByUuid,
    deleteMeetingAreaByUuid: deleteMeetingAreaByUuid,
    getMeetingAreasWithParentId: getMeetingAreasWithParentId
};
