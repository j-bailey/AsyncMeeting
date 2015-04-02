(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.auth.name).controller(asm.modules.auth.controllers.logout, [
        '$scope',
        '$location',
        '$log',
        asm.modules.auth.services.authentication,
        function ($scope, $location, $log, authentication) {
            $scope.logout = function () {
                authentication.logout().then(function () {
                    $log.debug("User logged out, sending to login page")
;                   $location.path(asm.modules.auth.routes.login);
                }, function () {
                    $log.error("Unable to log user out!");
                });
            };
        }
    ]);
}(angular, asm));