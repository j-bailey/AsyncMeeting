var MeetingArea = require('../../../server/models/meetingArea');
var express = require('express');
var router = express.Router();
var ObjectId = require('mongoose').Types.ObjectId;
var logger = require('winston');

router.get('/:meetingAreaId', function(req, res, next) {
    // TODO: add retrieving only meeting areas the user has access to.
    MeetingArea.find({parentMeetingArea: new ObjectId(req.params.meetingAreaId)}, function(err, meetingAreas) {
        if ( err ) return next(err);

        res.status(200).json(meetingAreas);
    });
});

// TODO: add authentication
router.get('/', function(req, res, next) {
    // TODO: add retrieving only meeting areas the user has access to.
    MeetingArea.find({parentMeetingArea: null}, function(err, meetingAreas) {
        if ( err ) return next(err);

        res.status(200).json(meetingAreas);
    });
});



module.exports = router;
