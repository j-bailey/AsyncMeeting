(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.home.name).controller(asm.modules.home.controllers.home, [
        '$scope',
        '$location',
        '$cookies',
        '$log',
        function ($scope, $location, $cookies, $log) {
            $scope.currentUser = $cookies.currentUser;
        }
    ]);
}(angular, asm));