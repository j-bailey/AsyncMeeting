(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.register.name).controller(asm.modules.register.controllers.registerCtrl, [
        '$scope',
        asm.modules.core.services.userService,
        function ($scope, userSvc) {
            $scope.register = function () {
                userSvc.register($scope.registerModel.username, $scope.registerModel.password, $scope.registerModel.email).then(function () {
                    console.log('user created');
                }, function (val) {
                    console.log('error registering user: ' + val.data);
                });
            }
        }
    ]);
}(angular, asm));