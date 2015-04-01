(function (angular, asm) {
    'use strict';
    angular.module(asm.modules.navigation.name).controller(asm.modules.navigation.controllers.navigationCtrl, [
        '$scope',
        '$log',
        '$location',
        '$cookies',
        function ($scope, $log, $location, $cookies) {
            $scope.currentUser = $cookies.currentUser;

            $log.debug($location.path());
            // TODO: Dynamically create list of menu items based on permissions.
            $scope.menuItems = [
                { name: "My Home", path: "#/"},
                { name: "Meeting Areas", path: "#/meetingareas"},
                { name: "Meetings", path: "#/meetings"}
                ];

            $scope.isCurrentLocation = function(path) {
                // Check entire path first.
                if ( "#" + $location.path() === path ) return true;

                // If not a match see if anything matches up to the root path.
                var pathElements = $location.path().split("/");
                for ( var i = pathElements.length; i > 0; i-- ) {
                    var subPath = "#" + pathElements.slice(0, i).join("/");
                    if (subPath === path) return true;
                }

                return false;
            }

        }
    ]);
}(angular, asm));