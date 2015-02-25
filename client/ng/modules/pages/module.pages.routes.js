(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.pages.name).config([
        '$routeProvider',
        function ($routeProvider) {
            $routeProvider.when(asm.modules.pages.routes.home, {
                controller: asm.modules.pages.controllers.default,
                templateUrl: 'ng/modules/pages/html/home.tmpl.html'
            });
        }]);
}(angular, asm));