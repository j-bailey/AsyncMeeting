var express = require('express');
var router = express.Router();
var handlers = require('./handlers/meetingAreasHandler');
var acl = require('../../security/acl').getAcl();

// TODO: add authentication
router.get("/", handlers.getMeetingAreasWithParentId);  // takes query parameter of parentId, either id or null string.

// TODO: add authentication
router.get('/:meetingAreaId', acl.middleware(), handlers.getMeetingArea);

// TODO: add authentication
router.post('/', acl.middleware(), handlers.createNewMeetingArea);

// TODO: add authentication
router.delete('/:meetingAreaId', acl.middleware(), handlers.deleteMeetingArea);

// TODO: add authentication
router.put('/:meetingAreaId', acl.middleware(), handlers.updateMeetingArea);

module.exports = router;
