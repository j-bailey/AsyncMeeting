var config = require('config'),
    expect = require('chai').expect,
    MeetingArea = require(__dirname + '/../../../../../server/models/meetingArea'),
    app = require(__dirname + '/../../../../../app'),
    jwt = require('jwt-simple'),
    request = require('supertest'),
    logger = require('winston'),
    user1 = request.agent(app);

var meetingAreaId = "",
    accessToken;

describe('meeting area route', function() {
    beforeEach(function(done) {
        meetingAreaId = "";

        user1
            .post('http://localhost:3000/email-login')
            .set('Accept', 'application/json, text/plain, */*')
            .set('Accept-encoding', 'gzip, deflate')
            .set('Content-type', 'application/json;charset=UTF-8')
            .send({
                email:'tom@tom.com',
                password: 'password123'
            })
            .end(function(err, res) {
                // user1 will manage its own cookies
                // res.redirects contains an Array of redirects
                logger.info('err = ' + err);
                accessToken = res.access_token;
            });

        MeetingArea.remove({}, function(err, removedItem) {
            if ( err ) console.log("remove error: " + error.message);

            var meetingArea = new MeetingArea({
                title: "Meeting Area Title",
                description: "Meeting Area Description"
            });

            meetingArea.save(function(err, savedItem) {
                if ( err ) console.log("save error: " + error.message);

                meetingAreaId = savedItem.id;
                done();
            });
        });

    });

    describe('GET \'/\'', function() {
        it('should return a meeting area', function(done) {
            user1
                .get('/api/meetingareas/' + meetingAreaId)
                .set('Accept', 'application/json')
                .set('access_token', accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function(res) {
                    var result = JSON.parse(res.text);
                    expect(result._id).to.equal(meetingAreaId);
                })
                .end(done);
        });
    });

    describe('POST \'/\'', function() {
        it('should create a meeting area', function(done) {
            user1
                .post('/api/meetingareas')
                .send({
                    parentMeetingAreaId: meetingAreaId,
                    title: "New Meeting Area",
                    description: "New Meeting Area Description"
                })
                .set('Accept', 'application/json')
                .set('access_token', accessToken)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function(err, res) {
                    var result = JSON.parse(res.text);
                    expect(result._id).to.not.be.null;
                    MeetingArea.find({}, function(err, meetingAreas) {
                        expect(meetingAreas).to.have.length(2);
                        done();
                    });
                });
        });
    });

    describe('DELETE \'/\'', function() {
        it('should remove a meeting area', function(done) {
            user1
                .delete('/api/meetingareas/' + meetingAreaId)
                .set('access_token', accessToken)
                .expect(200)
                .end(function(err, res) {
                    MeetingArea.find({}, function (err, meetingAreas) {
                        expect(meetingAreas).to.be.empty;
                        done();
                    });
                });
        });
    });
});
