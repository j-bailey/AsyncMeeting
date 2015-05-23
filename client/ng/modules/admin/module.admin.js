/* globals angular, asm */
(function (angular, asm) {
    'use strict';

    asm.modules.admin = {
        name: 'admin',
        controllers: {
            users: 'userListCtrl'
        },
        routes: {
            users: '/users'
        }
    };

    angular.module(asm.modules.admin.name, [
        'ngRoute'
    ]);

}(angular, asm));
