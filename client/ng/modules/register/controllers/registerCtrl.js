(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.register.name).controller(asm.modules.register.controllers.registerCtrl, [
        '$scope', '$log',
        asm.modules.core.services.userService,
        function ($scope, $log, userSvc) {
            $scope.register = function () {
                userSvc.register($scope.registerModel.username, $scope.registerModel.password, $scope.registerModel.email).then(function () {
                    $log.debug('user created');
                }, function (val) {
                    $log.debug('error registering user: ' + val.data);
                });
            }
        }
    ]);
}(angular, asm));