(function (angular, asm) {
    'use strict';

    asm.modules.home = {
        name: 'home',
        controllers: {
            users: 'homeCtrl'
        },
        routes: {
            home: '/'
        }
    };

    angular.module(asm.modules.home.name, [
        'ngRoute'
    ]);


}(angular, asm));