var mongoose = require('mongoose');
//var ObjectId = mongoose.Types.ObjectId;
var expect = require('chai').expect;
var sinon = require('sinon');
var MeetingArea = require('../../../../../server/models/meetingArea');
var meetingAreaHandler = require('../../../../../server/controllers/api/handlers/meetingAreaHandlers');

describe('meeting area route', function() {
    var sandbox;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        sandbox.restore();
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
                    expect(jsonSpy.calledWith(meetingArea).to.equal(true));
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

    //describe('POST \'/\'', function() {
    //    it('should create a meeting area', function(done) {
    //        request
    //            .post('/api/meetingarea')
    //            .send({
    //                parentMeetingAreaId: meetingAreaId,
    //                title: "New Meeting Area",
    //                description: "New Meeting Area Description"
    //            })
    //            .set('Accept', 'application/json')
    //            .expect('Content-Type', /json/)
    //            .expect(201)
    //            .end(function(err, res) {
    //                var result = JSON.parse(res.text);
    //                expect(result._id).to.not.be.null;
    //                MeetingArea.find({}, function(err, meetingAreas) {
    //                    expect(meetingAreas).to.have.length(2);
    //                    done();
    //                });
    //            });
    //    });
    //});
    //
    //describe('DELETE \'/\'', function() {
    //    it('should remove a meeting area', function(done) {
    //        request
    //            .delete('/api/meetingarea/' + meetingAreaId)
    //            .expect(200)
    //            .end(function(err, res) {
    //                MeetingArea.find({}, function (err, meetingAreas) {
    //                    expect(meetingAreas).to.be.empty;
    //                    done();
    //                });
    //            });
    //    });
    //});
});
