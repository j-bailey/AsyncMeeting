(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.register.name).controller(asm.modules.register.controllers.registerCtrl, [
        '$scope', '$log', '$cookies', '$location',
        asm.modules.core.services.userService,
        function ($scope, $log, $cookies, $location, userSvc) {
            $scope.errorMessage = null;
            $scope.invalidRegistration = false;

            $scope.register = function () {
                userSvc.register($scope.registerModel.username, $scope.registerModel.password, $scope.registerModel.email).then(function () {
                    $log.debug('user created');
                    $location.path(asm.modules.auth.routes.login);
                }, function (data) {
                    $scope.invalidRegistration = true;
                    $scope.errorMessage = data.data.message;
                });
            }
        }
    ]);
}(angular, asm));