var express = require('express');
var router = express.Router();
var handlers = require('./handlers/meetingsHandler');
var secUtils = require('../../utils/securityUtils');



router.get('/:meetingId',
    secUtils.isAllowedResourceAccess('Meeting', 'meetingId', false),
    secUtils.readOnlyDbConnection, handlers.getMeetingById);

router.post('/',
    secUtils.isAllowedResourceAccess('Meeting', 'parentMeetingAreaId', true),
    secUtils.determineDbConnection, handlers.createNewMeeting);

router.post('/:meetingId/member/:userId',
    secUtils.isAllowedResourceAccess('Meeting', 'meetingId', false),
    secUtils.determineDbConnection, handlers.grantUserAccess);

router.post('/:meetingId/reply',
    secUtils.isAllowedResourceAccess('Meeting', 'meetingId', false),
    secUtils.determineDbConnection, handlers.addReply);

router.delete('/:meetingId',
    secUtils.isAllowedResourceAccess('Meeting', 'meetingId', false),
    secUtils.determineDbConnection, handlers.deleteMeetingById);

router.delete('/:meetingId/member/:userId',
    secUtils.isAllowedResourceAccess('Meeting', 'meetingId', true),
    secUtils.determineDbConnection, handlers.removeUserAccess);

router.put('/:meetingId',
    secUtils.isAllowedResourceAccess('Meeting', 'meetingId', false),
    secUtils.determineDbConnection, handlers.updateMeetingById);

module.exports = router;
