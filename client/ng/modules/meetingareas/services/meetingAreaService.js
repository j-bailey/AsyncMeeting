/* globals angular, asm */
(function (angular, asm) {
    'use strict';

    /**
     * @ngdoc service
     * @name asm-meetingareas.meetingArea
     * @requires $http, $log
     *
     * @description
     * Provides meeting area services to the server.
     */
    angular.module(asm.modules.meetingareas.name).factory(asm.modules.meetingareas.services.meetingAreaService, [
        '$http', '$log',
        function ($http) {

            var getMeetingArea = function (meetingAreaId) {
                    //$log.debug('in getMeetingArea');
                    var param = "";
                    if ( meetingAreaId !== undefined && meetingAreaId !== null && meetingAreaId !== "" ) {
                        param = "/" + meetingAreaId;
                    }
                    return $http.get('/api/meetingareas' + param);
                },
                getChildMeetingAreas = function (meetingAreaId) {
                    //var param = meetingAreaId !== undefined && meetingAreaId !== "" ? "/" + meetingAreaId : "";
                    var query = "?parentId=" + (meetingAreaId !== undefined && meetingAreaId !== "" ? meetingAreaId : "null");
                    //$log.debug('in getChildMeetingAreas ' + param);
                    return $http.get('/api/meetingareas' + query);
                },
                createMeetingArea = function (title, description, parentMeetingAreaId) {
                    //$log.debug('in createMeetingArea');

                    if ( parentMeetingAreaId === undefined ) { parentMeetingAreaId = null; }
                    return $http.post('/api/meetingareas', { title: title, description: description, parentMeetingAreaId: parentMeetingAreaId });
                },
                deleteMeetingArea = function (meetingAreaId) {
                    //$log.debug('in deleteMeetingArea');
                    return $http.delete('/api/meetingareas/' + meetingAreaId);
                },
                updateMeetingArea = function (meetingAreaId, title, description) {
                    //$log.debug('in updateMeetingArea');
                    return $http.put('/api/meetingareas/' + meetingAreaId, { title: title, description: description });
                };
            return {
                getMeetingArea: getMeetingArea,
                getChildMeetingAreas: getChildMeetingAreas,
                createMeetingArea: createMeetingArea,
                deleteMeetingArea: deleteMeetingArea,
                updateMeetingArea: updateMeetingArea
            };
        }
    ]);
}(angular, asm));

