var express = require('express');
var router = express.Router();
var handlers = require('./handlers/meetingAreasHandler');
var acl = require('../../security/acl').getAcl();

// TODO add authorization
router.get("/", acl.middleware(), handlers.getMeetingAreasWithParentId);  // takes query parameter of parentId, either id or null string.

router.get('/:meetingAreaId', acl.middleware(), handlers.getMeetingAreaById);

router.post('/', acl.middleware(), handlers.createNewMeetingArea);

router.delete('/:meetingAreaId', acl.middleware(), handlers.deleteMeetingAreaById);

router.put('/:meetingAreaId', acl.middleware(), handlers.updateMeetingAreaById);

module.exports = router;
