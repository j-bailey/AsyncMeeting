var express = require('express');
var router = express.Router();
var handlers = require('./handlers/meetingAreasHandler');
var acl = require('../../security/acl').getAcl();
var secUtils = require('../../security/securityUtils');


router.get("/", secUtils.isAllowedToResourceBasedOnUrlQueryValue('parentId', true), secUtils.readOnlyDbConnection,
    handlers.getMeetingAreasWithParentId);

router.get('/:meetingAreaId', acl.middleware(), secUtils.readOnlyDbConnection, handlers.getMeetingAreaById);

router.post('/', acl.middleware(), secUtils.determineDbConnection, handlers.createNewMeetingArea);

router.delete('/:meetingAreaId', acl.middleware(), secUtils.determineDbConnection, handlers.deleteMeetingAreaById);

router.put('/:meetingAreaId', acl.middleware(), secUtils.determineDbConnection, handlers.updateMeetingAreaById);

module.exports = router;
