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
        '$http',
        function ($http) {

            var getUser = function () {
                    console.log('in get user')
                    return $http.get('/api/users')
                },
                login = function (username, password) {
                    console.log('in login')
                    return $http.post('/login', {username: username, password: password});
                },

                register = function (username, password, email) {
                    console.log('in logout')
                    return $http.post('/signup', {username: username, password: password, email: email});
                },
                logout = function () {

                };
            return {
                getUser: getUser,
                login: login,
                register: register,
                logout: logout
            };
        }
    ]);
}(angular, asm));



    