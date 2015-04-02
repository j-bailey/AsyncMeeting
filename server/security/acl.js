var Acl = require('acl');
//var db = require('../db');
// TODO finish getting ACL integrated
var aclSetup;
aclSetup = (function () {
    var init = function (db) {
        var backend = new Acl.mongodbBackend(db, "acl");
        var acl = new Acl(backend);
        acl.allow('GeneralUser', 'MeetingArea', 'CanViewMeetingAreas');
        acl.allow('GeneralUser', 'MeetingArea', 'CanViewMeetings');
    };
    return {
        init: init
    }
})();

module.exports = aclSetup;