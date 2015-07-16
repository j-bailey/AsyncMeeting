var express = require('express');
var router = express.Router();
var handlers = require('./handlers/meetingAreasHandler');
var acl = require('../../security/acl').getAcl();

// TODO add authorization
router.get("/", acl.middleware(), handlers.getMeetingAreasWithParentId);  // takes query parameter of parentId, either id or null string.

router.get('/:meetingAreaId', acl.middleware(), handlers.getMeetingAreaByUuid);

router.post('/', acl.middleware(), handlers.createNewMeetingArea);

router.delete('/:meetingAreaId', acl.middleware(), handlers.deleteMeetingAreaByUuid);

router.put('/:meetingAreaId', acl.middleware(), handlers.updateMeetingAreaByUuid);

module.exports = router;
