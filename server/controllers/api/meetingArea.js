var express = require('express');
var router = express.Router();
var handlers = require('./handlers/meetingAreaHandlers')();

// TODO: add authentication
router.get('/:meetingAreaId', handlers.getMeetingArea);

// TODO: add authentication
router.post('/', handlers.createNewMeetingArea);

// TODO: add authentication
router.delete('/:meetingAreaId', handlers.deleteMeetingArea);

// TODO: add authentication
router.put('/:meetingAreaId', handlers.updateMeetingArea);

module.exports = router;
