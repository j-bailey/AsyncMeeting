var express = require('express');
var router = express.Router();
var handlers = require('./handlers/meetingsHandler');
var secUtils = require('../../utils/securityUtils');



//router.get('/:meetingId',
//    secUtils.isAllowedResourceAccess('meetingId', false),
//    secUtils.readOnlyDbConnection, handlers.getMeetingById);

router.get('/',
    secUtils.isAllowedResourceAccess('parentMeetingAreaId', true, '/api/meetingareas'),
    secUtils.readOnlyDbConnection, handlers.getMeetings);

router.post('/',
    secUtils.isAllowedResourceAccess('parentMeetingAreaId', true, '/api/meetingareas'),
    secUtils.determineDbConnection, handlers.createNewMeeting);

//router.post('/:meetingId/member/:userId',
//    secUtils.isAllowedResourceAccess('meetingId', false),
//    secUtils.determineDbConnection, handlers.grantUserAccess);

//router.post('/:meetingId/reply',
//    secUtils.isAllowedResourceAccess('meetingId', false),
//    secUtils.determineDbConnection, handlers.addReply);

router.delete('/:meetingId',
    secUtils.isAllowedResourceAccess('meetingId', false),
    secUtils.determineDbConnection, handlers.deleteMeetingById);

//router.delete('/:meetingId/member/:userId',
//    secUtils.isAllowedResourceAccess('meetingId', true),
//    secUtils.determineDbConnection, handlers.removeUserAccess);

router.put('/:meetingId',
    secUtils.isAllowedResourceAccess('meetingId', false),
    secUtils.determineDbConnection, handlers.updateMeetingById);

module.exports = router;
