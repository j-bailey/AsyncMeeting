(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.register.name).controller(asm.modules.register.controllers.registerCtrl, [
        '$scope', '$log', '$cookies',
        asm.modules.core.services.userService,
        function ($scope, $log, $cookies, userSvc) {
            $scope.register = function () {
                userSvc.register($scope.registerModel.username, $scope.registerModel.password, $scope.registerModel.email).then(function (response) {
                    $log.debug('user created');
                }, function (data) {
                    var errorMesssage = $cookies;
                    $log.debug('error registering user: ' + $cookies);
                    $log.debug($cookies);
                });
            }
        }
    ]);
}(angular, asm));