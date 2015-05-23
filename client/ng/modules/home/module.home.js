/* globals angular, asm */
(function (angular, asm) {
    'use strict';

    asm.modules.home = {
        name: 'home',
        controllers: {
            home: 'homeCtrl'
        },
        routes: {
            home: '/'
        }
    };

    angular.module(asm.modules.home.name, [
        'ngRoute'
    ]);


}(angular, asm));