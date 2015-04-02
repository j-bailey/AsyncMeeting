(function (angular, asm) {
    'use strict';
    angular.module(asm.modules.meetingareas.name).controller(asm.modules.meetingareas.controllers.meetingAreasCtrl, [
        '$scope',
        '$log',
        '$routeParams',
        '$cookies',
        asm.modules.meetingareas.services.breadcrumbService,
        asm.modules.meetingareas.services.meetingAreaService,
        function ($scope, $log, $routeParams, $cookies, breadcrumbService, meetingAreaService) {
            $scope.currentUser = $cookies.currentUser;
            $scope.meetingAreas = [];
            $scope.currentMeetingAreaId = $routeParams.meetingAreaId != ':meetingAreaId' ?
                                                                $routeParams.meetingAreaId : null;
            $scope.breadcrumbs = breadcrumbService;
            $scope.createMeetingAreaErrorMessage = "";

            // Call server to get current meeting area details and direct children.
            meetingAreaService.getChildMeetingAreas($scope.currentMeetingAreaId).then(function(meetingAreas) {
                $scope.meetingAreas = meetingAreas.data;
                $scope.currentMeetingArea = null;

                // Retrieve the current meeting area data.
                if ( $scope.currentMeetingAreaId !== null ) {
                    meetingAreaService.getMeetingArea($scope.currentMeetingAreaId).then(function(meetingArea) {
                        $scope.currentMeetingArea = meetingArea.data;

                        // Customize breadcrumb label
                        $scope.breadcrumbs.setLabel(meetingArea.data.title);

                        // Reset the form data.
                        $scope.resetForms($scope.currentMeetingArea);
                    }, function (err) {
                        $scope.errorMsg = "Encountered error retrieving meeting area with id " + $scope.currentMeetingAreaId;
                    });
                }
                else {
                    $scope.newMeetingArea = $scope.resetForms($scope.currentMeetingArea);

                    // No parent meeting area, so this is the highest level.
                    $scope.breadcrumbs.setLabel("Meeting Areas");
                }
            }, function(err) {
                $scope.meetingAreas = null;
                $scope.errorMsg = "Encountered error retrieving meeting areas for meeting id'" + $scope.currentMeetingAreaId + "'.";
            });

            // Initialize create new meeting area form values.
            $scope.resetForms = function(currentMeetingArea) {
                // Reset input fields
                $scope.basicInfoForm.$setPristine();
                $scope.adminsForm.$setPristine();
                $scope.inviteesForm.$setPristine();
                $scope.summaryForm.$setPristine();

                $('#rootwizard').data('bootstrapWizard').resetWizard();
                $('#rootwizard').data('bootstrapWizard').show(0);
                console.log($('#rootwizard').data('bootstrapWizard'));
                //console.log("After reset " + $('#rootwizard').data('bootstrapWizard').currentIndex());

                // Fill in empty form with pointer to parent.
                $scope.newMeetingArea =  {title: "",
                    description: "",
                    administrators: "",
                    invitees: "",
                    accessRestriction: "",
                    parentMeetingArea: currentMeetingArea}
            };

            $scope.cancelForms = function (rc) {
                rc.basicInfoForm.reset();
                rc.adminsForm.reset();
                rc.inviteesForm.reset();
                rc.summaryForm.reset();
            }


            // Create a new meeting
            $scope.createMeetingArea = function() {
                // TODO: Handle saving admins, invitees, etc.
                meetingAreaService.createMeetingArea($scope.newMeetingArea.title, $scope.newMeetingArea.description,
                    $scope.currentMeetingAreaId).then(
                    function(createdMeetingArea) {
                        $scope.closeCreateMeetingAreaModal();

                        // Reset values
                        $scope.resetForms($scope.currentMeetingArea);

                        // Retrieve the list of child meeting areas again because it has now changed with the addition
                        // of the one just created.
                        meetingAreaService.getChildMeetingAreas($scope.currentMeetingAreaId)
                            .then(function(meetingAreas) {
                            $scope.meetingAreas = meetingAreas.data;
                        }, function(err) {
                            $scope.meetingAreas = null;
                            $scope.errorMsg = "Encountered error retrieving meeting areas for '" + createdMeetingArea.data.title + "'.";
                        });
                    },
                    function(err) {
                        $scope.createMeetingAreaErrorMessage = "Error occurred, meeting area was not created!";
                    }
                );
            };

            // Close the modal that shows the add new meeting area form.
            $scope.closeCreateMeetingAreaModal = function() {
                $('#createMeetingAreaModal').modal("hide");
            }
        }
    ]);
}(angular, asm));