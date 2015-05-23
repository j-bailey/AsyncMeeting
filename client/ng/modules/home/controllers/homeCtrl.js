/* globals angular, asm */
(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.home.name).controller(asm.modules.home.controllers.home, [
        '$scope',
        '$location',
        '$cookies',
        '$log',
        function ($scope, $location, $cookies) {
            $scope.currentUser = $cookies.currentUser;
        }
    ]);
}(angular, asm));