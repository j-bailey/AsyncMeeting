describe('viewing meeting areas', function() {
    var $scope,
        $routeParams,
        $controller,
        $cookies,
        $q,
        meetingAreaService,
        meetingAreaCtrl,
        childMeetingAreasDeferred,
        meetingAreaDeferred,
        createMeetingAreaDeferred;

    beforeEach(module(asm.modules.meetingareas.name));

    beforeEach(module(function($provide) {
        $provide.value('meetingAreaService', meetingAreaService);
    }));

    beforeEach(inject(function($rootScope, _$controller_, _$q_) {
        $scope = $rootScope.$new();

        // Stub $scope view specific methods
        $scope.closeCreateMeetingAreaModal = function() {};
        $scope.cancelForms = function() {};
        $scope.resetForms = function() {};

            $controller = _$controller_;
        $routeParams = { meetingAreaId: '123' };
        $cookies = { currentUser: "testUser" };
        $q = _$q_;

        // Setup mock meetingAreaService
        meetingAreaService = {
            getChildMeetingAreas: function () {
                childMeetingAreasDeferred = $q.defer();
                return childMeetingAreasDeferred.promise;
            },
            getMeetingArea: function () {
                meetingAreaDeferred = $q.defer();
                return meetingAreaDeferred.promise;
            },
            createMeetingArea: function () {
                createMeetingAreaDeferred = $q.defer();
                return createMeetingAreaDeferred.promise;
            }
         };

        meetingAreaCtrl = $controller(asm.modules.meetingareas.controllers.meetingAreasCtrl, { $scope: $scope, $routeParams: $routeParams, $cookies: $cookies, meetingAreaService: meetingAreaService });
    }));

    describe("on initialization", function() {
        it('should initialize the current meeting area and child meeting areas for the view', function () {
            expect($scope.currentMeetingAreaId).to.equal('123');
            expect($scope.currentUser).to.equal('testUser');

            childMeetingAreasDeferred.resolve(
                { data: [{ title: "Child 1", description: "" }, { title: "Child 2", description: "" }] });
            $scope.$digest();
            expect($scope.meetingAreas).to.have.length(2);

            meetingAreaDeferred.resolve({ data: { title: "Parent", description: "" } });
            $scope.$digest();
            expect($scope.currentMeetingArea.title).to.equal("Parent");
        });
    });

    describe("#createMeetingArea", function() {
        var createMeetingAreaSpy;

        beforeEach(function() {
            createMeetingAreaSpy = sinon.spy(meetingAreaService, "createMeetingArea");
            $scope.newMeetingArea = {};
            $scope.newMeetingArea.title = "New Meeting Area";
            $scope.newMeetingArea.description = "New Meeting Area Description";
            $scope.currentMeetingAreaId = "123";
            $scope.createMeetingArea();
        });

        afterEach(function() {
            meetingAreaService.createMeetingArea.restore();
        });

        it('should create a new meeting area', function() {
            createMeetingAreaDeferred.resolve({ title: "New Meeting Area", description: "New Meeting Area Description", parentMeetingAreaId: "123" });
            $scope.$digest();
            createMeetingAreaSpy.should.have.been.calledOnce;
        });

        it('should retrieve the list of child meeting areas', function() {
            childMeetingAreasDeferred.resolve({ data: [{ title: "Child 1", description: "" }, { title: "Child 2", description: "" }] });
            $scope.$digest();
            expect($scope.meetingAreas).to.have.length(2);
        })
    });
});
