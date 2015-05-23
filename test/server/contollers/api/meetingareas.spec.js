var expect = require('chai').expect,
    MeetingArea = require('../../../../server/models/meetingArea'),
    request = require('../../support/api');

var parentMeetingAreaId = "";
var childMeetingAreaId = "";
var child2MeetingAreaId = "";

describe('meeting areas route', function() {
    beforeEach(function(done) {
        parentMeetingAreaId = "";
        childMeetingAreaId = "";
        child2MeetingAreaId = "";

        MeetingArea.remove({}, function(err, removedItem) {
            if ( err ) console.log("remove error: " + err.message);

            var meetingArea = new MeetingArea({
                title: "Meeting Area Title",
                description: "Meeting Area Description",
                parentMeetingArea: null
            });

            meetingArea.save(function(err, savedItem) {
                if ( err ) console.log("save error: " + err.message);

                parentMeetingAreaId = savedItem.id;
                var childMeetingArea = new MeetingArea({
                    title: "Child Meeting Area Title",
                    description: "Child Meeting Area Description",
                    parentMeetingArea: savedItem._id
                });

                childMeetingArea.save(function(err, savedChildItem) {
                    if ( err ) console.log("save child error: " + err.message);
                    childMeetingAreaId = savedChildItem.id;

                    var child2MeetingArea = new MeetingArea({
                        title: "Child 2 Meeting Area Title",
                        description: "Child 2 Meeting Area Description",
                        parentMeetingArea: savedItem._id
                    });

                    child2MeetingArea.save(function(err, savedChildItem2) {
                        if (err) console.log("save child error: " + err.message);
                        child2MeetingAreaId = savedChildItem2.id;
                        done();
                    });
                });
            });
        });
    });

    describe('GET \'/\'', function() {
        it('should return meeting areas with the given parent id', function(done) {
            request
                .get('/api/meetingareas/' + parentMeetingAreaId)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function(res) {
                    var result = JSON.parse(res.text);
                    expect(result).to.have.length(2);
                    expect(result[0]._id).to.equal(childMeetingAreaId);
                    expect(result[1]._id).to.equal(child2MeetingAreaId);
                })
                .end(done);
        });
    });

    describe('GET \'/\'', function() {
        it('should return meeting areas with the no parent meeting area', function(done) {
            request
                .get('/api/meetingareas')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function(res) {
                    var result = JSON.parse(res.text);
                    expect(result).to.have.length(1);
                    expect(result[0]._id).to.equal(parentMeetingAreaId);
                })
                .end(done);
        });
    });

});
