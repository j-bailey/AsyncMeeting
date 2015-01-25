

angular.module('app').service('UserSvc', function ($http) {
    var svc = this
    svc.getUser = function () {
        return $http.get('/api/users')
    }
    svc.login = function (username, password) {
        return $http.post('/api/sessions', {username: username, password: password});
    }

    svc.logout = function () {
        return
    }
})



    