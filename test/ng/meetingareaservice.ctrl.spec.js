describe('meeting area service', function() {
    var meetingAreaService;
    var $httpBackend;

    beforeEach(module(asm.modules.meetingareas.name));
    beforeEach(inject(function(_meetingAreaService_, _$httpBackend_) {
        meetingAreaService = _meetingAreaService_;
        $httpBackend = _$httpBackend_;
    }));

    describe('#getMeetingArea', function() {
        context("meeting area for the id given exists", function () {
            it('should return a meeting area', function () {
                $httpBackend
                    .expectGET('/api/meetingarea/123')
                    .respond({
                        id: "123"
                    });

                var response = null;

                meetingAreaService
                    .getMeetingArea("123")
                    .then(function (result) {
                        response = result;
                    });

                $httpBackend.flush();

                expect(response.data.id).to.equal("123");
            });
        });

        context("meeting area for the id given does not exist", function() {
            it('should return an error that the meeting area was not found', function () {
                $httpBackend
                    .expectGET('/api/meetingarea/123')
                    .respond(404);

                var response = null;

                meetingAreaService
                    .getMeetingArea("123")
                    .then(
                        function (res) {
                            response = res;
                        },
                        function (errRes) {
                            response = errRes;
                        });

                $httpBackend.flush();

                expect(response.status).to.equal(404);
            });
        });
    });

    describe('#getChildMeetingAreas', function() {
        context('the meeting area for the given id exists', function() {
            it('should return an array of child meeting areas', function() {
                $httpBackend
                    .expectGET('/api/meetingareas/123')
                    .respond([
                        { id: "111" },
                        { id: "222" },
                        { id: "333" }
                    ]);

                var response = null;

                meetingAreaService
                    .getChildMeetingAreas("123")
                    .then(function(result) {
                        response = result;
                    });

                $httpBackend.flush();

                expect(response.data).to.have.length(3);
                expect(response.data[0].id).to.equal("111");
                expect(response.data[1].id).to.equal("222");
                expect(response.data[2].id).to.equal("333");
            });
        });

        context('the meeting area for the given id does not exist', function() {
            it('should return an error that the meeting area was not found', function() {
                $httpBackend
                    .expectGET('/api/meetingareas/123')
                    .respond(404);

                var response = null;

                meetingAreaService
                    .getChildMeetingAreas("123")
                    .then(
                        function(res)
                        {
                            response = res;
                        },
                        function(errRes) {
                            response = errRes;
                        });

                $httpBackend.flush();

                expect(response.status).to.equal(404);
            });
        });

        context('the meeting area for the given id has no children', function() {
            it('should return no child meeting areas', function() {
                $httpBackend
                    .expectGET('/api/meetingareas/123')
                    .respond(200, []);

                var response = null;

                meetingAreaService
                    .getChildMeetingAreas("123")
                    .then(
                        function(res)
                        {
                            response = res;
                        });

                $httpBackend.flush();

                expect(response.status).to.equal(200);
                expect(response.data).to.have.length(0);
            });
        });
    });

    describe('#createMeetingArea', function() {
        it('should create a meeting area', function() {
            $httpBackend
                .expectPOST('/api/meetingarea',
                {
                    title: "Meeting Area 1",
                    description: "Meeting area 1 description",
                    parentMeetingAreaId: "abc"
                })
                .respond(201, {title: "Meeting Area 1"});

            var response = null;

            meetingAreaService
                .createMeetingArea("Meeting Area 1", "Meeting area 1 description", "abc")
                .then(function(result) {
                    response = result;
                });

            $httpBackend.flush();

            expect(response.status).to.equal(201);
            expect(response.data.title).to.equal("Meeting Area 1");
        });
    });

    describe('#deleteMeetingArea', function() {
        context('the meeting area for the given id exists', function() {
            it('should delete a meeting area', function () {
                $httpBackend
                    .expectDELETE('/api/meetingarea/123')
                    .respond(200);

                var response = null;

                meetingAreaService
                    .deleteMeetingArea("123")
                    .then(function (result) {
                        response = result;
                    });

                $httpBackend.flush();

                expect(response.status).to.equal(200);
            });
        });

        context('the meeting area for the given id does not exist', function() {
            it('should return an error that the meeting area was not found', function () {
                $httpBackend
                    .expectDELETE('/api/meetingarea/123')
                    .respond(404);

                var response = null;

                meetingAreaService
                    .deleteMeetingArea("123")
                    .then(
                        function (res) {
                            response = res;
                        },
                        function (errRes) {
                            response = errRes;
                        });

                $httpBackend.flush();

                expect(response.status).to.equal(404);
            });
        });
    });

    describe('#updateMeetingArea', function() {
        context('the meeting area for the given id exists', function() {
            it('should update a meeting area', function () {
                $httpBackend
                    .expectPUT('/api/meetingarea/123', {
                        title: "New Title",
                        description: "New Description"
                    })
                    .respond(200);

                var response = null;

                meetingAreaService
                    .updateMeetingArea("123", "New Title", "New Description")
                    .then(function (result) {
                        response = result;
                    });

                $httpBackend.flush();

                expect(response.status).to.equal(200);
            });
        });

        context('the meeting area for the given id does not exist', function() {
            it('should update a meeting area', function () {
                $httpBackend
                    .expectPUT('/api/meetingarea/123', {
                        title: "New Title",
                        description: "New Description"
                    })
                    .respond(404);

                var response = null;

                meetingAreaService
                    .updateMeetingArea("123", "New Title", "New Description")
                    .then(
                        function (res) {
                            response = res;
                        },
                        function (errRes) {
                            response = errRes;
                        });

                $httpBackend.flush();

                expect(response.status).to.equal(404);
            });
        });
    });
});