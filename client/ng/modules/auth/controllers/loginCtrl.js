(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.auth.name).controller(asm.modules.auth.controllers.login, [
        '$scope',
        '$location',
        '$cookies',
        '$log',
        asm.modules.auth.services.authentication,
        function ($scope, $location, $cookies, $log, authentication) {
            $scope.loginModel = {};
            $scope.isBusy = false;
            $scope.invalidLogin = false;

            $scope.login = function () {
                $scope.invalidLogin = false;
                $scope.isBusy = true;
                authentication.login($scope.loginModel.email, $scope.loginModel.password).then(function (currentUser) {
                    $cookies.currentUser = currentUser;
                    $location.path(asm.modules.meetingareas.routes.meetingAreas);
                }, function () {
                    $scope.invalidLogin = true;
                })['finally'](function () {
                    $scope.isBusy = false;
                });
            };
        }
    ]);
}(angular, asm));