"use strict";

var express = require('express');
var router = express.Router();
var handlers = require('./handlers/meetingAreasHandler');
var secUtils = require('../../utils/securityUtils');


router.get("/",
    secUtils.isAllowedResourceAccess('parentId', true),
    secUtils.readOnlyDbConnection, handlers.getMeetingAreasWithParentId);

router.get('/:meetingAreaId',
    secUtils.isAllowedResourceAccess('meetingAreaId', false),
    secUtils.readOnlyDbConnection, handlers.getMeetingAreaById);

router.post('/',
    secUtils.isAllowedResourceAccess('parentMeetingAreaId', true),
    secUtils.determineDbConnection, handlers.createNewMeetingArea);

router.post('/:meetingAreaId/member/:userId',
    secUtils.isAllowedResourceAccess('meetingAreaId', false),
    secUtils.canGrantResourceAccess('meetingAreaId', 'meetingarea-admin-'),
    secUtils.determineDbConnection, handlers.grantUserAccess);

router.delete('/:meetingAreaId',
    secUtils.isAllowedResourceAccess('meetingAreaId', false),
    secUtils.determineDbConnection, handlers.deleteMeetingAreaById);

router.delete('/:meetingAreaId/member/:userId',
    secUtils.isAllowedResourceAccess('meetingAreaId', false),
    secUtils.determineDbConnection, handlers.removeUserAccess);

router.put('/:meetingAreaId',
    secUtils.isAllowedResourceAccess('meetingAreaId', false),
    secUtils.determineDbConnection, handlers.updateMeetingAreaById);

module.exports = router;
