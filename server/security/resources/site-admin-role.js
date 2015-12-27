"use strict";

var r = require('./acl-resources');

var SITE_ADMIN_USER_ROLE = { key:'SiteAdminUserRole', name:'Site Admin User', desc:'',
    allows: [
        {
            resources: [
                r.SITE_ADMIN_RESOURCES.key
            ],
            permissions: [
                r.HTTP_PERMISSIONS
            ]
        },
    ] };

module.exports.object = SITE_ADMIN_USER_ROLE;
