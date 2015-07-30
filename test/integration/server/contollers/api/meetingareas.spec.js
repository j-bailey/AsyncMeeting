var Acl = require('../../../../../server/security/acl'),
    expect = require('chai').expect,
    MeetingArea,
    request = require('supertest'),
    User,
    bcrypt = require('bcrypt-nodejs'),
    db = require('../../../../../server/db');

// Load the models, so they get tied to the DB connections
require('../../../../../server/models/meetingArea');
require('../../../../../server/models/user');


var parentMeetingAreaId = "";
var childMeetingAreaId = "";
var child2MeetingAreaId = "";
var accessToken1,
    email1 = 'tom@tom.com',
    pass1 = 'pword123',
    username1 = 'tom',
    userModel1,
    user1 = request('http://localhost:3001');
var accessToken2,
    email2 = 'terry@terry.com',
    pass2 = 'pword123',
    username2 = 'terry',
    userModel2,
    user2 = request('http://localhost:3001');
var acl = null;


describe('meeting areas route', function () {
    before(function (done) {
        Acl.init().then(function (aclIns) {
            acl = aclIns;
            User = db.readWriteConnection.model('User');
            User.remove().exec();
            //if (err) next(err);
            var user1Obj = new User({username: username1, email: email1, password: pass1});
            var user2Obj = new User({username: username2, email: email2, password: pass2});
            User.createNewSignedUpUser(user1Obj).then(function (savedUser1, err) {
                if (err) {
                    return next(err)
                }
                userModel1 = savedUser1;
                User.createNewSignedUpUser(user2Obj).then(function (savedUser2, err) {
                    if (err) {
                        return next(err)
                    }
                    userModel2 = savedUser2;
                    user1
                        .post('/email-login')
                        .set('Accept', 'application/json, text/plain, */*')
                        .set('Accept-encoding', 'gzip, deflate')
                        .set('Content-type', 'application/json;charset=UTF-8')
                        .send({email: email1, password: pass1})
                        .end(function (err, res) {
                            // user1 will manage its own cookies
                            // res.redirects contains an Array of redirects
                            if (err) console.error('err = ' + err);

                            accessToken1 = res.body.access_token;
                            user2
                                .post('/email-login')
                                .set('Accept', 'application/json, text/plain, */*')
                                .set('Accept-encoding', 'gzip, deflate')
                                .set('Content-type', 'application/json;charset=UTF-8')
                                .send({email: email2, password: pass2})
                                .end(function (err, res) {
                                    // user1 will manage its own cookies
                                    // res.redirects contains an Array of redirects
                                    if (err) console.error('err = ' + err);

                                    accessToken2 = res.body.access_token;
                                    done();
                                });
                        });

                });
            });
        });
    });

    beforeEach(function (done) {
        parentMeetingAreaId = "";
        childMeetingAreaId = "";
        child2MeetingAreaId = "";
        MeetingArea = db.readWriteConnection.model('MeetingArea');

        MeetingArea.remove({}, function (err, removedItem) {
            if (err) console.log("remove error: " + err.message);

            var meetingArea = new MeetingArea({
                title: "Meeting Area Title",
                description: "Meeting Area Description",
                parentMeetingArea: null,
                tenantId: userModel1.tenantId
            });

            meetingArea.save(function (err, savedItem) {
                if (err) console.log("save error: " + err.message);

                parentMeetingAreaId = savedItem.id;
                acl.allow('meetingarea-creator', '/api/meetingareas/' + parentMeetingAreaId, 'get');
                acl.addUserRoles(userModel1.username, 'meetingarea-creator');
                acl.allow('meetingarea-creator-parent', '/api/meetingareas', 'get');
                acl.addUserRoles(userModel1.username, 'meetingarea-creator-parent');

                var childMeetingArea = new MeetingArea({
                    title: "Child Meeting Area Title",
                    description: "Child Meeting Area Description",
                    parentMeetingArea: savedItem._id,
                    tenantId: userModel1.tenantId
                });

                childMeetingArea.save(function (err, savedChildItem) {
                    if (err) console.log("save child error: " + err.message);
                    childMeetingAreaId = savedChildItem.id;

                    var child2MeetingArea = new MeetingArea({
                        title: "Child 2 Meeting Area Title",
                        description: "Child 2 Meeting Area Description",
                        parentMeetingArea: savedItem._id,
                        tenantId: userModel1.tenantId
                    });

                    child2MeetingArea.save(function (err, savedChildItem2) {
                        if (err) console.log("save child error: " + err.message);
                        child2MeetingAreaId = savedChildItem2.id;
                        done();
                    });
                });
            });
        });
    });


    describe('GET \'/\'', function () {
        it('should return meeting areas with the given parent id', function (done) {
            user1
                .get('/api/meetingareas?parentId=' + parentMeetingAreaId)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result).to.have.length(2);
                    expect(result[0]._id).to.equal(childMeetingAreaId);
                    expect(result[1]._id).to.equal(child2MeetingAreaId);
                })
                .end(done);
        });
        it('should be denied access', function (done) {
            user2
                .get('/api/meetingareas?parentId=' + parentMeetingAreaId)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken2)
                .expect('Content-Type', /json/)
                .expect(401)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result).to.not.be.null;
                    expect(result.msg).to.equal('Not allowed');
                    expect(result.status).to.equal(401);
                })
                .end(done);
        });
        it('should return meeting areas with no parent meeting area', function (done) {
            user1
                .get('/api/meetingareas?parentId=null')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result).to.have.length(1);
                    expect(result[0]._id).to.equal(parentMeetingAreaId);
                })
                .end(done);
        });
        it('should return 401 when given parent id and injection attack', function (done) {
            user1
                .get('/api/meetingareas?parentId=' + parentMeetingAreaId + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(401)
                .expect(function (res) {
                    expect(res.error.message).to.equal('cannot GET /api/meetingareas?parentId=' + parentMeetingAreaId + '%3Bvar%20date%3Dnew%20Date()%3B%20do%7BcurDate%20%3D%20new%20Date()%3B%7Dwhile(cur-Date-date%3C10000 (401)');
                    expect(JSON.parse(res.error.text).status).to.equal(401);
                    expect(JSON.parse(res.error.text).msg).to.equal('Not allowed');
                })
                .end(done);
        });
        it('should return 401 with no parent meeting area and injection attack', function (done) {
            user1
                .get('/api/meetingareas?parentId=null' + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                //.expect('Content-Type', /json/)
                //.expect(401)
                .expect(function (res) {
                    expect(res.error.message).to.equal('cannot GET /api/meetingareas?parentId=null' + '%3Bvar%20date%3Dnew%20Date()%3B%20do%7BcurDate%20%3D%20new%20Date()%3B%7Dwhile(cur-Date-date%3C10000 (401)');
                    expect(JSON.parse(res.error.text).status).to.equal(401);
                    expect(JSON.parse(res.error.text).msg).to.equal('Not allowed');
                })
                .end(done);
        });
    });
});
