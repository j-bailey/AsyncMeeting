(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.meetingareas.name).controller(asm.modules.meetingareas.controllers.meetingAreasCtrl, [
        '$scope',
        '$location',
        function ($scope, $location) {
            //$scope.loginModel = {};
            //$scope.isBusy = false;
            //$scope.invalidLogin = false;
            //
            //$scope.login = function () {
            //    $scope.invalidLogin = false;
            //    $scope.isBusy = true;
            //    authentication.login($scope.loginModel.email, $scope.loginModel.password).then(function () {
            //        $location.path(asm.modules.pages.routes.home);
            //    }, function () {
            //        $scope.invalidLogin = true;
            //    })['finally'](function () {
            //        $scope.isBusy = false;
            //    });
            //};
        }
    ]);
}(angular, asm));