/**
 * Created by jlb on 4/11/15.
 */
var r = require('./acl-resources');

var FREE_TIER_USER_ROLE = {key:'FreeTierUserRole', name:'Free Tier User', desc:'',
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
                r.MEETING_AREA_RESOURCE.allowedPermissions.limitedToTwo
            ]
        }
    ]};

module.exports.object = FREE_TIER_USER_ROLE;