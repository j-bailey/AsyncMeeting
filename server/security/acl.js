var aclSetup = (function () {
    var Acl = require('acl'),
        logger = require('winston'),
        cfg = require('config');

    var GENERAL_USER_ROLE = 'GeneralUser';

    var MEETING_AREA_RESOURCE = 'MeetingArea',
        MEETING_RESOURCE =  'Meeting';

    var acl = null;

    function init() {
        var mongodb = require('mongodb'),
            dbUrl = cfg.get("database.url");
        var self = this;
        mongodb.connect(dbUrl, function (error, db) {
            self.aclBackend = new Acl.mongodbBackend(db, "acl");
            acl = new Acl(self.aclBackend);
            logger.info('Acl is connected to ' + dbUrl);

            acl.allow(GENERAL_USER_ROLE, MEETING_AREA_RESOURCE, ['CanCreateMeetingAreas', 'CanViewMeetingAreas', 'CanDeleteMeetingAreas', 'CanUpdateMeetings']);
            acl.allow(GENERAL_USER_ROLE, MEETING_RESOURCE, ['CanCreateMeetings', 'CanViewMeetings', 'CanDeleteMeetings', 'CanUpdateMeetings']);
        });
    }

    function getAcl() {
        return new Acl(this.aclBackend);
    }


    return {
        GENERAL_USER_ROLE: GENERAL_USER_ROLE,
        MEETING_AREA_RESOURCE: MEETING_AREA_RESOURCE,
        MEETING_RESOURCE: MEETING_RESOURCE,
        init: init,
        getAcl: getAcl
    }
})();

module.exports = aclSetup;