(function (angular, asm) {
    'use strict';

    /**
     * @ngdoc service
     * @name asm-core.user
     * @requires $http
     *
     * @description
     * Provides user services to the server.
     */
    angular.module(asm.modules.core.name).factory(asm.modules.core.services.userService, [
        '$http', '$log',
        function ($http, $log) {

            var getUser = function () {
                    $log.debug('in get user')
                    return $http.get('/api/users')
                },
                login = function (username, password) {
                    $log.debug('in login')
                    return $http.post('/login', {username: username, password: password});
                },
                emailLogin = function (email, password) {
                    $log.debug('in emailLogin')
                    return $http.post('/email-login', {email: email, password: password});
                },
                register = function (username, password, email) {
                    $log.debug('in logout')
                    return $http.post('/signup', {username: username, password: password, email: email});
                },
                logout = function () {

                };
            return {
                getUser: getUser,
                login: login,
                emailLogin: emailLogin,
                register: register,
                logout: logout
            };
        }
    ]);
}(angular, asm));



    