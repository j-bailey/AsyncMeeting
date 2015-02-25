

angular.module('app').service('UserSvc', function ($http) {
    var svc = this
    svc.getUser = function () {
        return $http.get('/api/users')
    };
    svc.login = function (username, password) {
        return $http.post('/login', {username: username, password: password});
    };

    svc.register = function (username, password, email) {
        return $http.post('/signup', {username: username, password: password, email: email});
    };
    svc.logout = function () {

    }
});



    