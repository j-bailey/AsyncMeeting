(function (angular, asm) {
    'use strict';

    asm.modules.meetingareas = {
        name: 'meetingAreas',
        controllers: {
            meetingAreasCtrl: 'meetingAreasCtrl'
        },
        services: {
            meetingAreaService: 'meetingAreaService',
            breadcrumbService: 'breadcrumbService'
        },
        routes: {
            meetingAreas: '/meetingareas'
        }
    };

    angular.module(asm.modules.meetingareas.name, [
        'ngRoute'
    ]);


}(angular, asm));