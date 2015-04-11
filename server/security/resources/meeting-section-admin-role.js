/**
 * Created by jlb on 4/11/15.
 */
var r = require('./acl-resources');

var MEETING_SECTION_ADMIN_USER_ROLE = {key:'MeetingSectionAdminUserRole', name:'Meeting Section Admin User', desc:'',
    allows: [
        {
            resources: [
                r.MEETING_SECTION_ADMIN_RESOURCES.key
            ],
            permissions: [
                r.HTTP_PERMISSIONS
            ]
        },
    ]};

module.exports.object = MEETING_SECTION_ADMIN_USER_ROLE;