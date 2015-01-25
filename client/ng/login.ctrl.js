angular.module('app').controller('LoginCtrl', function ($rootScope, UserSvc, $http) {
    $rootScope.login = function (username, password) {
        UserSvc.login(username, password).then(function (response) {
            UserSvc.token = response.data
            $http.defaults.headers.common['X-Auth'] = response.data

            UserSvc.getUser().then(function (user) {
                $rootScope.$broadcast('login', user.data);
            }).catch(function (msg) {
                $scope.logout();
                if (msg && msg.data) {
                    console.log('get user error = ' + msg)
                } else {
                    console.log('error getting user')
                }
            });
        }, function (val) {
            $scope.logout();
            console.log('login error = ' + val.data)
        })
    }
    $rootScope.logout = function () {
        UserSvc.token = null;
        $http.defaults.headers.common['X-Auth'] = null;
        $rootScope.$broadcast('logout', '');

    }
})

   