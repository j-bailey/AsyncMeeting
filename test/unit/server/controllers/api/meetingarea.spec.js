var MeetingArea = require('../../../../../server/models/meetingArea');
var meetingAreaHandler = require('../../../../../server/controllers/api/handlers/meetingAreasHandler');
var ObjectId = require('mongoose').Types.ObjectId;

describe('meeting area route', function() {
    var sandbox;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('getMeetingAreasWithParentId', function() {
        it('should return all meeting areas with the given parent id', function(done) {
            var id = ObjectId();

            var meetingArea1 = new MeetingArea({
                title: "Meeting Area Title 1",
                description: "Meeting Area Description 1",
                parentMeetingArea: id
            });

            var meetingArea2 = new MeetingArea({
                title: "Meeting Area Title 2",
                description: "Meeting Area Description 2",
                parentMeetingArea: id
            });

            var meetingAreas = [meetingArea1, meetingArea2];

            sandbox.stub(MeetingArea.base.Model, 'find').yields(null, meetingAreas);

            var req = { query: { parentId: id } };
            var res = {
                status: function(status) {
                    expect(statusSpy.calledWith(200)).to.equal(true);
                    return this
                },
                json: function(json) {
                    expect(jsonSpy.calledWith(meetingAreas)).to.equal(true);
                    done();
                }
            };

            var statusSpy = sandbox.spy(res, 'status');
            var jsonSpy = sandbox.spy(res, 'json');

            meetingAreaHandler.getMeetingAreasWithParentId(req, res);
        });
    });

    describe('getMeetingArea', function() {
        it('should return a meeting area', function(done) {
            var meetingArea = new MeetingArea({
                title: "Meeting Area Title",
                description: "Meeting Area Description"
            });

            sandbox.stub(MeetingArea.base.Model, 'findOne').yields(null, meetingArea);

            var req = { params: { meetingAreaId: "1" } };
            var res = {
                status: function(status) {
                    expect(statusSpy.calledWith(200)).to.equal(true);
                    return this
                },
                json: function(json) {
                    expect(jsonSpy.calledWith(meetingArea)).to.equal(true);
                    done();
                }
            };

            var statusSpy = sandbox.spy(res, 'status');
            var jsonSpy = sandbox.spy(res, 'json');

            meetingAreaHandler.getMeetingArea(req, res);
        });
    });

    describe('createNewMeetingArea', function() {
        it('should create a meeting area', function(done) {
            var meetingArea = new MeetingArea({
                title: "Meeting Area Title",
                description: "Meeting Area Description"
            });

            var parentMeetingArea = new MeetingArea({
                title: "Parent Meeting Area Title",
                description: "Parent Meeting Area Description"
            });

            meetingArea.parentMeetingArea = parentMeetingArea._id;

            sandbox.stub(MeetingArea.prototype, 'save').yields(null, meetingArea);

            var req = {
                body: {
                    title: meetingArea.title,
                    description: meetingArea.description,
                    parentMeetingAreaId: parentMeetingArea.id
                }
            };

            var res = {
                status: function(status) {
                    expect(statusSpy.calledWith(201)).to.equal(true);
                    return this
                },
                json: function(json) {
                    expect(jsonSpy.calledWith(meetingArea)).to.equal(true);
                    done();
                }
            };

            var statusSpy = sandbox.spy(res, "status");
            var jsonSpy = sandbox.spy(res, "json");

            meetingAreaHandler.createNewMeetingArea(req, res);
        });
    });

    describe('deleteMeetingArea', function() {
        it('should delete a meeting area', function(done) {
            var id = ObjectId();

            sandbox.stub(MeetingArea.base.Model, 'findOneAndRemove').yields(null);

            var req = { params: { meetingAreaId: id } };
            var res = {
                sendStatus: function(status) {
                    expect(sendStatusSpy.calledWith(200)).to.equal(true);
                    done();
                }
            };

            var sendStatusSpy = sandbox.spy(res, 'sendStatus');

            meetingAreaHandler.deleteMeetingArea(req, res);
        });
    });

    describe('updateMeetingArea', function() {
        it('should update a meeting area', function(done) {
            var id = ObjectId();

            var meetingArea = new MeetingArea({
                title: "My Meeting Area",
                description: ""
            });

            sandbox.stub(MeetingArea.base.Model, 'findOne').yields(null, meetingArea);
            sandbox.stub(meetingArea, 'save').yields(null, meetingArea);

            var req = {
                params: {
                    meetingAreaId: id,
                    title: "My New Meeting Area Title",
                    description: ""
                }
            };

            var res = {
                status: function(status) {
                    expect(statusSpy.calledWith(200)).to.equal(true);
                    return this
                },
                json: function(json) {
                    expect(jsonSpy.calledWith(meetingArea)).to.equal(true);
                    done();
                }
            };

            var statusSpy = sandbox.spy(res, 'status');
            var jsonSpy = sandbox.spy(res, "json");

            meetingAreaHandler.updateMeetingArea(req, res);
        });
    });
});
