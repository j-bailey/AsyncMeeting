(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.meetingareas.name).config([
        '$routeProvider',
        function ($routeProvider) {
            $routeProvider
                .when(asm.modules.meetingareas.routes.meetingAreas, {
                    controller: asm.modules.meetingareas.controllers.meetingAreasCtrl,
                    templateUrl: 'ng/modules/meetingAreas/html/meetingAreas.html',
                    access: {
                        loginRequired: true,
                        permissions: ['CanViewMeetingAreas', 'CanEditMeetingAreas', 'CanDeleteMeetingAreas']},
                    label: 'Meeting Areas'
                })
                .when(asm.modules.meetingareas.routes.meetingAreas + "/:meetingAreaId", {
                    controller: asm.modules.meetingareas.controllers.meetingAreasCtrl,
                    templateUrl: 'ng/modules/meetingAreas/html/meetingAreas.html',
                    access: {
                        loginRequired: true,
                        permissions: ['CanViewMeetingAreas', 'CanEditMeetingAreas', 'CanDeleteMeetingAreas']},
                    label: 'Meeting Area'
            });
        }]);


}(angular, asm));