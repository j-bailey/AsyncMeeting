(function (angular, asm) {
    'use strict';

angular.module(asm.modules.auth.name).run([
    '$rootScope',
    '$location',
    asm.modules.auth.services.authorization,
    function ($rootScope, $location, authorization) {
        var routeChangeRequiredAfterLogin = false,
            loginRedirectUrl;
        $rootScope.$on('$routeChangeStart', function (event, next) {
            var authorised;
            if (routeChangeRequiredAfterLogin && next.originalPath !== asm.modules.auth.routes.login) {
                routeChangeRequiredAfterLogin = false;
                $location.path(loginRedirectUrl).replace();
            } else if (next.access !== undefined) {
                authorised = authorization.authorize(next.access.loginRequired,
                                                     next.access.permissions,
                                                     next.access.permissionCheckType);
                if (authorised === asm.modules.auth.enums.authorised.loginRequired) {
                    routeChangeRequiredAfterLogin = true;
                    loginRedirectUrl = next.originalPath;
                    $location.path(asm.modules.auth.routes.login);
                } else if (authorised === asm.modules.auth.enums.authorised.notAuthorised) {
                    $location.path(asm.modules.auth.routes.notAuthorised).replace();
                }
            }
        });
    }]);
}(angular, asm));