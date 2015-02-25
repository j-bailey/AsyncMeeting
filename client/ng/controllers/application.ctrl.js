angular.module('app').controller('ApplicationCtrl', function ($scope, $location) {
    $scope.$on('login', function (_, user) {
        $scope.currentUser = user;
        $location.path('/meetingareas');
    });
    $scope.$on('logout', function (event, msg) {
        $scope.currentUser = null;
        $location.path('/logout');
    })
});

angular.module('app').run([
    '$rootScope',
    '$location',
    'authorization',
    function ($rootScope, $location, authorization) {
        $rootScope.$on('$routeChangeStart', function (event, next) {
            var authorised;
            if (next.access !== undefined) {
                authorised = authorization.authorize(next.access.loginRequired,
                    next.access.permissions,
                    next.access.permissionCheckType);
                if (authorised === jcs.modules.auth.enums.authorised.loginRequired) {
                    $location.path('/login');
                } else if (authorised === jcs.modules.auth.enums.authorised.notAuthorised) {
                    $location.path('/login').replace();
                }
            }
        });
    }]);
