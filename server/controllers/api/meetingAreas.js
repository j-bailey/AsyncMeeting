var express = require('express');
var router = express.Router();
var handlers = require('./handlers/meetingAreasHandler');
var acl = require('../../security/acl').getAcl();
var secUtils = require('../../security/securityUtils');


// FIXME need to get acl.middleware working for this express entry
router.get("/", secUtils.readOnlyDbConnection, handlers.getMeetingAreasWithParentId);
// takes query parameter of parentId, either id or null string.

router.get('/:meetingAreaId', acl.middleware(), secUtils.readOnlyDbConnection, handlers.getMeetingAreaById);

router.post('/', acl.middleware(), secUtils.determineDbConnection, handlers.createNewMeetingArea);

router.delete('/:meetingAreaId', acl.middleware(), secUtils.determineDbConnection, handlers.deleteMeetingAreaById);

router.put('/:meetingAreaId', acl.middleware(), secUtils.determineDbConnection, handlers.updateMeetingAreaById);

module.exports = router;
