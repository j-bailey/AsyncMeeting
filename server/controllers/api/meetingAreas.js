var express = require('express');
var router = express.Router();
var handlers = require('./handlers/meetingAreasHandler');

// TODO: add authentication
router.get("/", handlers.getMeetingAreasWithParentId);  // takes query parameter of parentId, either id or null string.

// TODO: add authentication
router.get('/:meetingAreaId', handlers.getMeetingArea);

// TODO: add authentication
router.post('/', handlers.createNewMeetingArea);

// TODO: add authentication
router.delete('/:meetingAreaId', handlers.deleteMeetingArea);

// TODO: add authentication
router.put('/:meetingAreaId', handlers.updateMeetingArea);

module.exports = router;
