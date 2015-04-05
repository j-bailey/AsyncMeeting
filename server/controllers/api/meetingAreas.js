var express = require('express');
var router = express.Router();
var handlers = require("./handlers/meetingAreasHandlers");

// TODO: add authentication
router.get('/:meetingAreaId', handlers.getMeetingAreasWithParentId);

// TODO: add authentication
router.get('/', handlers.getMeetingAreasWithNoParent);

module.exports = router;
