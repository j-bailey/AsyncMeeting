var express = require('express');
var router = express.Router();
var handlers = require('./handlers/meetingAreasHandler');
var acl = require('../../security/acl').getAcl();

// TODO add authorization
router.get("/", handlers.getMeetingAreasWithParentId);  // takes query parameter of parentId, either id or null string.

router.get('/:meetingAreaId', acl.middleware(), handlers.getMeetingArea);

router.post('/', acl.middleware(), handlers.createNewMeetingArea);

router.delete('/:meetingAreaId', acl.middleware(), handlers.deleteMeetingArea);

router.put('/:meetingAreaId', acl.middleware(), handlers.updateMeetingArea);

module.exports = router;
