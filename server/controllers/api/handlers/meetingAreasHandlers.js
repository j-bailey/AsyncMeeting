var MeetingArea = require('../../../../server/models/meetingArea');
var ObjectId = require('mongoose').Types.ObjectId;

var getMeetingAreasWithParentId = function(req, res, next) {
    // TODO: add retrieving only meeting areas the user has access to.
    MeetingArea.find({parentMeetingArea: new ObjectId(req.params.meetingAreaId)}, function(err, meetingAreas) {
        if ( err ) { return next(err); }
        res.status(200).json(meetingAreas);
    });
};

var getMeetingAreasWithNoParent = function(req, res, next) {
    // TODO: add retrieving only meeting areas the user has access to.
    MeetingArea.find({parentMeetingArea: null}, function(err, meetingAreas) {
        if ( err ) { return next(err); }
        res.status(200).json(meetingAreas);
    });
};

module.exports = {
    getMeetingAreasWithParentId: getMeetingAreasWithParentId,
    getMeetingAreasWithNoParent: getMeetingAreasWithNoParent
};