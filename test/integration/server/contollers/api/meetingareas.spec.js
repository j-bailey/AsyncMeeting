var expect = require('chai').expect,
    MeetingArea = require('../../../../../server/models/meetingArea'),
    app = require('../../../../../app'),
    request = require('supertest'),
    //user1 = request.agent(app),
    User = require('../../../../../server/models/user'),
    bcrypt = require('bcrypt-nodejs'),
    db = require('../../../../../server/db');



var parentMeetingAreaId = "";
var childMeetingAreaId = "";
var child2MeetingAreaId = "";
var accessToken;
var email = 'tom@tom.com';
var pass = 'password123';
var username = 'tom';
var user1 = request('http://localhost:3001');



describe('meeting areas route', function() {
    beforeEach(function(done) {
        parentMeetingAreaId = "";
        childMeetingAreaId = "";
        child2MeetingAreaId = "";

            db.connection.db.dropCollection('users', function (err, result) {
                //if (err) next(err);
                var user = new User({ username: username, email: email, password: pass });
                user.password = bcrypt.hashSync(pass, bcrypt.genSaltSync(10), null);
                user.save(function (err) {
                    if (err) {
                        return next(err)
                    }
                    //acl.getAcl().addUserRoles(user.username, freeTierRole.key);

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
                                    user1
                                        .post('/email-login')
                                        .set('Accept', 'application/json, text/plain, */*')
                                        .set('Accept-encoding', 'gzip, deflate')
                                        .set('Content-type', 'application/json;charset=UTF-8')
                                        .send({email:email, password: pass})
                                        .end(function(err, res) {
                                            // user1 will manage its own cookies
                                            // res.redirects contains an Array of redirects
                                            if (err) console.error('err = ' + err);

                                            accessToken = res.body.access_token;
                                            done();
                                        });
                                });
                            });
                        });
                    });
                })
            });
        });


    describe('GET \'/\'', function() {
        it('should return meeting areas with the given parent id', function(done) {
            user1
                .get('/api/meetingareas?parentId=' + parentMeetingAreaId)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken)
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
        it('should return meeting areas with no parent meeting area', function(done) {
            user1
                .get('/api/meetingareas?parentId=null')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken)
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
