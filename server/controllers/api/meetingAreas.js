var express = require('express');
var router = express.Router();
var handlers = require('./handlers/meetingAreasHandler');
var secUtils = require('../../utils/securityUtils');


router.get("/",
    secUtils.isAllowedResourceAccess('MeetingArea', 'parentId', true),
    secUtils.readOnlyDbConnection, handlers.getMeetingAreasWithParentId);

router.get('/:meetingAreaId',
    secUtils.isAllowedResourceAccess('MeetingArea', 'meetingAreaId', false),
    secUtils.readOnlyDbConnection, handlers.getMeetingAreaById);

router.post('/',
    secUtils.isAllowedResourceAccess('MeetingArea', 'parentMeetingAreaId', true),
    secUtils.determineDbConnection, handlers.createNewMeetingArea);

router.post('/:meetingAreaId/member/:userId',
    secUtils.isAllowedResourceAccess('MeetingArea', 'meetingAreaId', false),
    secUtils.determineDbConnection, handlers.grantUserAccess);

router.delete('/:meetingAreaId',
    secUtils.isAllowedResourceAccess('MeetingArea', 'meetingAreaId', false),
    secUtils.determineDbConnection, handlers.deleteMeetingAreaById);

router.delete('/:meetingAreaId/member/:userId',
    secUtils.isAllowedResourceAccess('MeetingArea', 'meetingAreaId', false),
    secUtils.determineDbConnection, handlers.removeUserAccess);

router.put('/:meetingAreaId',
    secUtils.isAllowedResourceAccess('MeetingArea', 'meetingAreaId', false),
    secUtils.determineDbConnection, handlers.updateMeetingAreaById);

module.exports = router;
