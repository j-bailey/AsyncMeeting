var MeetingArea = require('../../../server/models/meetingArea');
var express = require('express');
var router = express.Router();
//var websockets = require('../../../websockets')
//var pubsub = require('../../../pubsub');
var ObjectId = require('mongoose').Types.ObjectId;
var Q = require('q');
var logger = require('winston');

router.get('/:meetingAreaId', function(req, res, next) {
    // TODO: add retrieving only meeting areas the user has access to.
    MeetingArea.findOne({_id: req.params.meetingAreaId}, function(err, meetingArea) {
        if ( err ) return next(err);

        res.status(200).json(meetingArea);
    });
});

router.post('/', function(req, res, next) {
    var parentId = req.body.parentMeetingAreaId;

    var meetingArea = new MeetingArea({
        title: req.body.title,
        description: req.body.description,
        parentMeetingArea: parentId ? new ObjectId(parentId) : null
    });

    meetingArea.save(function(err, savedMeetingArea) {
        if (err) {
            logger.error("Error saving meeting area: " + err.message);
        }

        res.status(201).json(savedMeetingArea);
    });
});

router.delete('/:meetingAreaId', function(req, res, next) {
   MeetingArea.findOneAndRemove({_id: req.params.meetingAreaId}, function(err, deletedMeetingArea) {
       if (err) return next(err);

       res.sendStatus(200)
   });
});

module.exports = router;
