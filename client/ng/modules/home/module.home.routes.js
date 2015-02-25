(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.home.name).config([
        '$routeProvider',
        function ($routeProvider) {
            $routeProvider.when(asm.modules.home.routes.users, {
                controller: asm.modules.home.controllers.users,
                templateUrl: 'ng/modules/home/html/home.tmpl.html',
                access: {
                    loginRequired: false
                }
            });
        }]);


}(angular, asm));