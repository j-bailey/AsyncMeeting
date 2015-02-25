(function (angular, asm) {
    'use strict';

    asm.modules.core = {
        name: 'asm-core',
        controllers: {
            asyncMeetingCtrl: 'asyncMeetingCtrl'
        },
        services: {
            eventbus: 'eventbus',
            userService: 'userService'
        },
        filters: {
            unique: 'unique'
        }
    };

    angular.module(asm.modules.core.name, []);
}(angular, asm));
