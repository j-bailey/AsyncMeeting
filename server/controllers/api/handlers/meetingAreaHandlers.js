var MeetingArea = require('../../../../server/models/meetingArea');
var ObjectId = require('mongoose').Types.ObjectId;
var Q = require('q');
var logger = require('winston');

var getMeetingArea = function(req, res, next) {
    // TODO: add retrieving only meeting areas the user has access to.
    MeetingArea.findOne({_id: req.params.meetingAreaId}, function(err, meetingArea) {
        if ( err ) return next(err);

        res.status(200).json(meetingArea);
    });
};

var createNewMeetingArea = function(req, res, next) {
    var parentId = req.body.parentMeetingAreaId;

    var meetingArea = new MeetingArea({
        title: req.body.title,
        description: req.body.description,
        parentMeetingArea: parentId ? new ObjectId(parentId) : null
    });

    meetingArea.save(function(err, savedMeetingArea) {
        if (err) {
            logger.error("Error saving meeting area: " + err.message);
            return next(err);
        }

        res.status(201).json(savedMeetingArea);
    });
};

var deleteMeetingArea = function(req, res, next) {
    MeetingArea.findOneAndRemove({_id: req.params.meetingAreaId}, function(err, deletedMeetingArea) {
        if (err) return next(err);

        res.sendStatus(200)
    });
};

module.exports = {
    getMeetingArea: getMeetingArea,
    createNewMeetingArea: createNewMeetingArea,
    deleteMeetingArea: deleteMeetingArea
};