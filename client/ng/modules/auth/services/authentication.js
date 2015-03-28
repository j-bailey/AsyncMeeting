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
            var currentUser,
                login = function (email, password) {
                    var defer = $q.defer();

                    userSvc.emailLogin(email, password).then(function (response) {
                        userSvc.token = response.data.token;
                        $log.debug('in userSvc login');
                        $http.defaults.headers.common['X-Auth'] = response.data.token;

                        currentUser = response.data.user;
                        currentUser.permissions = response.data.permissions;
                        eventbus.broadcast(asm.modules.auth.events.userLoggedIn, currentUser);
                        defer.resolve(currentUser);
                        //userSvc.getUser().then(function (user) {
                        //    currentUser = user.data;
                        //    defer.resolve(currentUser);
                        //    eventbus.broadcast(asm.modules.auth.events.userLoggedIn, currentUser);
                        //}).catch(function (msg) {
                        //    if (msg && msg.data) {
                        //        console.log('get user error = ' + msg)
                        //    } else {
                        //        console.log('error getting user')
                        //    }
                        //    throw msg;
                        //});

                    }, function (err) {
                        $log.error("login error = " + err);
                        //console.log('login error = ' + err);
                        defer.reject(err);
                    });
                    return defer.promise;
                },
                logout = function () {
                    var defer = $q.defer();
                    // we should only remove the current user.
                    // routing back to login login page is something we shouldn't
                    // do here as we are mixing responsibilities if we do.
                    $log.debug("in userSvc logout");
                    userSvc.logout().then(function (response) {
                        $log.debug("User " + currentUser.username + " logout on server successful");
                        userSvc.token = null;
                        currentUser = undefined;
                        delete $http.defaults.headers.common['X-Auth'];
                        eventbus.broadcast(asm.modules.auth.events.userLoggedOut);
                        defer.resolve();
                    }, function (err) {
                        $log.error("logout error = " + err);
                        defer.reject(err);
                    });
                    return defer.promise;
                },
                getCurrentLoginUser = function () {
                    return currentUser;
                };

            return {
                login: login,
                logout: logout,
                getCurrentLoginUser: getCurrentLoginUser
            };
        }
    ]);
}(angular, asm));