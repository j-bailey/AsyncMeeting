(function (angular, asm) {
    'use strict';

    asm.modules.auth = {
        name: 'auth',
        enums: {
            authorised: {
                authorised: 0,
                loginRequired: 1,
                notAuthorised: 2
            },
            permissionCheckType: {
                atLeastOne: 0,
                combinationRequired: 1
            }
        },
        events: {
          userLoggedIn: 'auth:user:loggedIn',
          userLoggedOut: 'auth:user:loggedOut'
        },
        controllers: {
            login: 'loginCtrl',
            logout: 'logoutCtrl'
        },
        services: {
            authentication: 'authentication',
            authorization: 'authorization'
        },
        routes: {
            login: '/login',
            notAuthorised: '/not-authorised',
            logout: '/logout'
        }
    };

    angular.module(asm.modules.auth.name, [
        'ngRoute',
        asm.modules.core.name
    ]);


}(angular, asm));