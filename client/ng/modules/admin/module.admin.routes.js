/* globals angular, asm */
(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.admin.name).config([
        '$routeProvider',
        function ($routeProvider) {
            $routeProvider.when(asm.modules.admin.routes.users, {
                controller: asm.modules.admin.controllers.users,
                templateUrl: 'ng/modules/admin/html/users.tmpl.html',
                access: {
                    loginRequired: true,
                    permissions: ['Admin']
                }
            });
        }]);


}(angular, asm));