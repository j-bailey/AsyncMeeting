angular.module('app').config(function ($routeProvider, $locationProvider) {
        $locationProvider.html5Mode(true);
        $routeProvider.when('/', {
            controller: 'HomeCtrl',
            templateUrl: 'views/home.html'
        }).when('/register', {
            controller: 'RegisterCtrl',
            templateUrl: 'views/register.html'
        }).when('/meetingareas', {
            controller: 'MeetingAreasCtrl',
            templateUrl: 'views/meetingAreas.html',
            access: {
                requiresLogin: true,
                requiredPermissions: ['CanViewMeetingAreas', 'CanEditMeetingAreas', 'CanDeleteMeetingAreas'],
                permissionType: 'AtLeastOne'
            }
        }).when('/logout', {
            controller: 'LogoutCtrl',
            templateUrl: 'views/logout.html',
            access: {
                requiresLogin: true
            }
        }).when('/login', {
            controller: 'LoginCtrl',
            templateUrl: 'views/login.html'
        });
        $routeProvider.otherwise({ redirectTo: '/login' });
    }
);




