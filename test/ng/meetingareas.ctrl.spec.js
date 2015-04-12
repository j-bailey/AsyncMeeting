describe('viewing meeting areas', function() {
    var $scope;
    var $log;
    var $routeParams;
    var $controller;
    var meetingAreaCtrl;

    //beforeEach(module('rcWizard'));
    beforeEach(function() {
        module('ngCookies')
    })
    beforeEach(module(asm.modules.meetingareas.name));

    beforeEach(inject(function(_$rootScope_, _$controller_, _$routeParams_) {
        $scope = _$rootScope_;
        //$log = _$log_;
        //$scope = {};
        $controller = _$controller_;
        $routeParams = _$routeParams_;
        meetingAreaCtrl = $controller(asm.modules.meetingareas.controllers.meetingAreasCtrl, {$scope: $scope, $routeParams: {meetingAreaId: '123'}});
    }));

    it('should read the current meeting area id from the route parameters', function() {
       expect($scope.currentMeetingAreaId).to.equal('123');
    });
});