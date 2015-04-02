var express = require('express');
var router = express.Router();
var handlers = require('./handlers/meetingAreaHandlers');

// TODO: add authentication
router.get('/:meetingAreaId', handlers.getMeetingAreaWithId);

// TODO: add authentication
router.post('/', handlers.createNewMeetingArea);

// TODO: add authentication
router.delete('/:meetingAreaId', handlers.deleteMeetingArea);

module.exports = router;
