/* globals angular, asm */
(function (angular, asm) {
    'use strict';

    asm.modules.navigation = {
        name: 'navigation',
        controllers: {
            navigationCtrl: 'navigationCtrl'
        }
    };

    angular.module(asm.modules.navigation.name, [
        'ngRoute', 'ngCookies'
    ]);

}(angular, asm));
