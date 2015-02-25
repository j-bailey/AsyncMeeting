angular.module('app').controller('RegisterCtrl', function ($rootScope, UserSvc, $http) {
    $rootScope.register = function (username, password, email) {
        UserSvc.register(username, password, email).then( function(response){
            console.log('user created');
        }, function (val) {
            console.log('error registering user: ' + val.data);
        });
    }

});

