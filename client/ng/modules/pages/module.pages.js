(function (angular, asm) {
    'use strict';

    asm.modules.pages = {
        name: 'pages',
        controllers: {
            default: 'defaultCtrl'
        },
        routes: {
            home: '/home'
        }
    };

    angular.module(asm.modules.pages.name, [
        'ngRoute'
    ]);
}(angular, asm));
