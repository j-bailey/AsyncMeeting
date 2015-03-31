(function (angular, asm) {
    'use strict';
    angular.module(asm.modules.meetingareas.name).controller(asm.modules.meetingareas.controllers.meetingAreasCtrl, [
        '$scope',
        '$location',
        '$cookies',
        '$log',
        '$http',
        '$q',
        '$routeParams',
        asm.modules.meetingareas.services.breadcrumbService,
        asm.modules.meetingareas.services.meetingAreaService,
        function ($scope, $location, $cookies, $log, $http, $q, $routeParams, breadcrumbService, meetingAreaService) {
            $log.debug("Initializing controller!");
            $scope.currentUser = $cookies.currentUser;
            $scope.meetingAreas = [];
            $scope.currentMeetingAreaId = $routeParams.meetingAreaId != ':meetingAreaId' ? $routeParams.meetingAreaId : null;

            $scope.breadcrumbs = breadcrumbService;

            $log.debug("In controller breadcrumbs are " + JSON.stringify($scope.breadcrumbs));

            // Call server to get current meeting area details and it's children.
            meetingAreaService.getChildMeetingAreas($scope.currentMeetingAreaId).then(function(meetingAreas) {
                $scope.meetingAreas = meetingAreas.data;

                $scope.currentMeetingArea = null;

                if ( $scope.currentMeetingAreaId != null ) {
                    meetingAreaService.getMeetingArea($scope.currentMeetingAreaId).then(function(meetingArea) {
                        $scope.currentMeetingArea = meetingArea.data;
                        $scope.breadcrumbs.setLabel(meetingArea.data.title);  // Customize breadcrumb label
                    }, function (err) {
                        $scope.errorMsg = "Encountered error retrieving meeting area with id " + $scope.currentMeetingAreaId;
                    });
                }
                else {
                    $scope.breadcrumbs.setLabel("Meeting Areas");
                }
            }, function(err) {
                $scope.meetingAreas = null;
                $scope.errorMsg = "Encountered error retrieving meeting areas for meeting id'" + $scope.currentMeetingAreaId + "'.";
            });

            // Create a new meeting
            $scope.createMeetingArea = function() {
                meetingAreaService.createMeetingArea($scope.newMeetingArea.title, $scope.newMeetingArea.description, $scope.currentMeetingAreaId).then(
                    function(createdMeetingArea) {
                        $('#createMeetingAreaModal').modal("hide");

                        meetingAreaService.getChildMeetingAreas($scope.currentMeetingAreaId).then(function(meetingAreas) {
                            $scope.meetingAreas = meetingAreas.data;
                        }, function(err) {
                            $scope.meetingAreas = null;
                            $scope.errorMsg = "Encountered error retrieving meeting areas for '" + createdMeetingArea.data.title + "'.";
                        });
                    },
                    function(err) {

                    }
                );
            };
        }
    ]);
}(angular, asm));