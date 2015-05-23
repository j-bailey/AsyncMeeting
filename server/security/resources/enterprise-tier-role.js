/**
 * Created by jlb on 4/11/15.
 */
var r = require('./acl-resources');

var ENTERPRISE_TIER_USER_ROLE = { key:'EnterpriseTierUserRole', name:'Enterprise Tier User', desc:'',
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
                r.MEETING_AREA_RESOURCE.allowedPermissions.unlimited
            ]
        }
    ] };

module.exports.object = ENTERPRISE_TIER_USER_ROLE;
