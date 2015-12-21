"use strict";

var HTTP_PERMISSIONS =
{
    'delete': 'delete',
    get: 'get',
    post: 'post',
    put: 'put'
};

var MEETING_AREA_RESOURCE = {
        key: 'MeetingAreaResource', name: 'Meeting Area Resource', desc: '',
        allowedPermissions: {
            get: 'get',
            put: 'put',
            delete: 'delete',
            post: 'post',
            limitedToTwo: 'LimitedTo2',
            limitedTo50: 'LimitedTo50',
            unlimited: 'Unlimited'
        }
    },
    MEETING_RESOURCE = {
        key: 'MeetingResource', name: 'Meeting Resource', desc: '',
        allowedPermissions: {
            get: 'get',
            put: 'put',
            delete: 'delete',
            post: 'post',
            limitedToTen: 'LimitedTo10',
            limitedTo50: 'LimitedTo50',
            unlimited: 'Unlimited'
        }
    },
    SITE_ADMIN_RESOURCES = {
        key: 'SiteAdminResource', name: 'Site Admin Resource', desc: '',
        allowedPermisions: {
            get: 'get',
            put: 'put',
            delete: 'delete',
            post: 'post'
        }
    },
    MEETING_SECTION_ADMIN_RESOURCES = {
        key: 'MeetingSectionAdminResource', name: 'Meeting Section Admin Resource', desc: '',
        allowedPermisions: {
            get: 'get',
            put: 'put',
            delete: 'delete',
            post: 'post'
        }
    },
    MEETING_AREA_SEARCH_RESOURCE = {
        key: 'MeetingAreaSearchResource', name: 'Meeting Area Search Resource', desc: '',
        allowePermissions: {
            post: 'post',
            get: 'get'
        }
    }
    ;

module.exports.MEETING_AREA_RESOURCE = MEETING_AREA_RESOURCE;
module.exports.MEETING_RESOURCE = MEETING_RESOURCE;
module.exports.SITE_ADMIN_RESOURCES = SITE_ADMIN_RESOURCES;
module.exports.MEETING_SECTION_ADMIN_RESOURCES = MEETING_SECTION_ADMIN_RESOURCES;
module.exports.MEETING_AREA_SEARCH_RESOURCE = MEETING_AREA_SEARCH_RESOURCE;
module.exports.HTTP_PERMISSIONS = HTTP_PERMISSIONS;
