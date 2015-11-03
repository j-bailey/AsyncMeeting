/**
 * Created by jlb on 4/11/15.
 */
var r = require('./acl-resources');

var MID_TIER_USER_ROLE = { key:'MidTierUserRole', name:'Mid Tier User', desc:'',
    allows: [
        {
            resources: [
                r.MEETING_AREA_RESOURCE.key,
                r.MEETING_RESOURCE.key
            ],
            permissions: [
                r.HTTP_PERMISSIONS
            ]
        },
        {
            resources: [
                r.MEETING_AREA_SEARCH_RESOURCE
            ],
            permissions: [
                r.MEETING_AREA_RESOURCE.allowedPermissions.limitedTo50
            ]
        }
    ] };

module.exports.object = MID_TIER_USER_ROLE;
