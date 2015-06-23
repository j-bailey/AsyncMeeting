/* globals angular, asm */
(function (angular, asm) {
    'use strict';
    angular.module(asm.modules.auth.name).factory(asm.modules.auth.services.authentication, [
        '$q',
        '$timeout',
        '$http',
        '$log',
        'eventbus',
        asm.modules.core.services.userService,
        function ($q, $timeout, $http, $log, eventbus, userSvc) {
            $log.debug("Instantiating authentication service");

            var currentUser;

            function login(email, password) {
                var defer = $q.defer();
                userSvc.emailLogin(email, password).then(function (response) {
                    userSvc.access_token = response.data.access_token;
                    $log.debug('in userSvc login');
                    $http.defaults.headers.common['X-Auth'] = response.data.access_token;
                    currentUser = response.data.user;
                    currentUser.permissions = response.data.permissions;
                    eventbus.broadcast(asm.modules.auth.events.userLoggedIn, currentUser);
                    defer.resolve(currentUser);
                }, function (err) {
                    $log.error("login error = " + err);
                    defer.reject(err);
                });
                return defer.promise;
            }

            function logout() {
                var defer = $q.defer();
                // we should only remove the current user.
                // routing back to login login page is something we shouldn't
                // do here as we are mixing responsibilities if we do.
                $log.debug("in userSvc logout");
                userSvc.logout().then(function () {
                    $log.debug("User " + currentUser.username + " logout on server successful");
                    userSvc.access_token = null;
                    currentUser = undefined;
                    delete $http.defaults.headers.common['X-Auth'];
                    eventbus.broadcast(asm.modules.auth.events.userLoggedOut);
                    defer.resolve();
                }, function (err) {
                    $log.error("logout error = " + err);
                    defer.reject(err);
                });
                return defer.promise;
            }

            function getCurrentLoginUser() {
                $log.debug("Calling getCurrentLoginUser " + (currentUser !== undefined ? currentUser.username : "currentUser is undefined"));
                return currentUser;
            }

            return {
                login: login,
                logout: logout,
                getCurrentLoginUser: getCurrentLoginUser
            };
        }
    ]);
}(angular, asm));
