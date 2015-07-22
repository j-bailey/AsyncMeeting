"use strict";
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
    } else if (parentId && parentId.length !== 24) {
        res.status(400).json(new Error("Error: parentId is not correct!"));
        return next();
    }
    var MeetingArea = req.db.model('MeetingArea');
    if (parentId === null) {
        MeetingArea.find({parentMeetingArea: null})
            .select(MeetingArea.publicFields)
            .exec(function (err, meetingAreas) {
            if (err) {
                return next(err);
            }
            res.status(200).json(meetingAreas);
        });
    } else {
        MeetingArea.findOne({_id: parentId}, function (err, meetingArea) {
            MeetingArea.find({parentMeetingArea: (new ObjectId(meetingArea._id))})
                .select(MeetingArea.publicFields)
                .exec(function (err, meetingAreas) {
                if (err) {
                    return next(err);
                }
                res.status(200).json(meetingAreas);
            });
        });
    }
};

var getMeetingAreaById = function (req, res, next) {
    if (req.params && req.params.meetingAreaId && req.params.meetingAreaId === 24) {
        res.status(400).json(new Error("Error: meetingAreaId is not valid or is missing!"));
        return next();
    }
    var MeetingArea = req.db.model('MeetingArea');

    // TODO: add retrieving only meeting areas the user has access to.
    MeetingArea.findOne({_id: req.params.meetingAreaId})
        .select(MeetingArea.publicFields)
        .exec(function (err, meetingArea) {
        if (err) {
            return next(err);
        }

        res.status(200).json(meetingArea);
    });
};

var createNewMeetingArea = function (req, res, next) {
    var parentId;
    if (req.body && req.body.parentMeetingAreaId && req.body.parentMeetingAreaId === 24) {
        res.status(400).json(new Error("Error: parentMeetingAreaId is not valid or is missing!"));
        return next();
    } else {
        parentId = req.body.parentMeetingAreaId;
    }

    var MeetingArea = req.db.model('MeetingArea');
    MeetingArea.findOne({_id: parentId}, function (err, parentMeetingArea) {
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

var updateMeetingAreaById = function (req, res, next) {
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
        res.status(200).json(meetingArea);
    });
};

var deleteMeetingAreaById = function (req, res, next) {
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
};

module.exports = {
    getMeetingAreaById: getMeetingAreaById,
    createNewMeetingArea: createNewMeetingArea,
    updateMeetingAreaById: updateMeetingAreaById,
    deleteMeetingAreaById: deleteMeetingAreaById,
    getMeetingAreasWithParentId: getMeetingAreasWithParentId
};
