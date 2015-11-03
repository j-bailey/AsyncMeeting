/* globals angular, asm */
(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.auth.name).config([
        '$routeProvider',
        function ($routeProvider) {
            $routeProvider.when(asm.modules.auth.routes.login, {
                controller: asm.modules.auth.controllers.login,
                templateUrl: 'ng/modules/auth/html/login.tmpl.html'
            });
            $routeProvider.when(asm.modules.auth.routes.logout, {
                controller: asm.modules.auth.controllers.logout,
                templateUrl: 'ng/modules/auth/html/logout.tmpl.html'
            });
            $routeProvider.when(asm.modules.auth.routes.notAuthorised, {
                controller: asm.modules.auth.controllers.login,
                templateUrl: 'ng/modules/auth/html/not-authorised.tmpl.html'
            });

            $routeProvider.otherwise({ redirectTo: asm.modules.auth.routes.login });
        }]);

}(angular, asm));
