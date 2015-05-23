/* globals angular, asm */
(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.register.name).config([
        '$routeProvider',
        function ($routeProvider) {
            $routeProvider.when(asm.modules.register.routes.register, {
                controller: asm.modules.register.controllers.registerCtrl,
                templateUrl: 'ng/modules/register/html/register.tmpl.html',
                access: {
                    loginRequired: false
                }
            });
        }]);


}(angular, asm));