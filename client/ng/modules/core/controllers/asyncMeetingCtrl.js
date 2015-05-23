/* globals angular, asm */
(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.core.name).controller(asm.modules.core.controllers.asyncMeetingCtrl, [
        'eventbus',
        '$scope',
        function (eventbus, $scope) {
            eventbus.subscribe(asm.modules.auth.events.userLoggedIn, function (_, user) {
                $scope.currentUser = user;
            });
            eventbus.subscribe(asm.modules.auth.events.userLoggedOut, function () {
                $scope.currentUser = null;
            });
        }
    ]);
}(angular, asm));


