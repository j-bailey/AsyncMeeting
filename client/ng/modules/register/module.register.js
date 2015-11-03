/* globals angular, asm */
(function (angular, asm) {
    'use strict';

    asm.modules.register = {
        name: 'register',
        controllers: {
            registerCtrl: 'registerCtrl'
        },
        routes: {
            register: '/register'
        }
    };

    angular.module(asm.modules.register.name, [
        'ngRoute', 'ngCookies'
    ]);

}(angular, asm));
