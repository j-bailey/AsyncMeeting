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
var accessToken;
var email = 'tom@tom.com';
var pass = 'password123';
var username = 'tom';
var user1 = request('http://localhost:3001');
var acl = null;


describe('meeting areas route', function () {
    before(function (done) {
        Acl.init().then(function (aclIns) {
            acl = aclIns;
            done();
        });
    });

    beforeEach(function (done) {
        parentMeetingAreaId = "";
        childMeetingAreaId = "";
        child2MeetingAreaId = "";

        User = db.readWriteConnection.model('User');
        MeetingArea = db.readWriteConnection.model('MeetingArea');
        User.remove().exec();
        //if (err) next(err);
        var user1Obj = new User({username: username, email: email, password: pass});
        user1Obj.password = bcrypt.hashSync(pass, bcrypt.genSaltSync(10), null);
        user1Obj.save(function (err) {
            if (err) {
                return next(err)
            }
            //acl.getAcl().addUserRoles(user.username, freeTierRole.key);

            MeetingArea.remove({}, function (err, removedItem) {
                if (err) console.log("remove error: " + err.message);

                var meetingArea = new MeetingArea({
                    title: "Meeting Area Title",
                    description: "Meeting Area Description",
                    parentMeetingArea: null
                });

                meetingArea.save(function (err, savedItem) {
                    if (err) console.log("save error: " + err.message);

                    parentMeetingAreaId = savedItem.id;
                    acl.allow('meetingarea-creator', '/api/meetingareas', 'get');
                    acl.addUserRoles(user1Obj.username, 'meetingarea-creator');

                    var childMeetingArea = new MeetingArea({
                        title: "Child Meeting Area Title",
                        description: "Child Meeting Area Description",
                        parentMeetingArea: savedItem._id
                    });

                    childMeetingArea.save(function (err, savedChildItem) {
                        if (err) console.log("save child error: " + err.message);
                        childMeetingAreaId = savedChildItem.id;

                        var child2MeetingArea = new MeetingArea({
                            title: "Child 2 Meeting Area Title",
                            description: "Child 2 Meeting Area Description",
                            parentMeetingArea: savedItem._id
                        });

                        child2MeetingArea.save(function (err, savedChildItem2) {
                            if (err) console.log("save child error: " + err.message);
                            child2MeetingAreaId = savedChildItem2.id;
                            user1
                                .post('/email-login')
                                .set('Accept', 'application/json, text/plain, */*')
                                .set('Accept-encoding', 'gzip, deflate')
                                .set('Content-type', 'application/json;charset=UTF-8')
                                .send({email: email, password: pass})
                                .end(function (err, res) {
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


    describe('GET \'/\'', function () {
        it('should return meeting areas with the given parent id', function (done) {
            user1
                .get('/api/meetingareas?parentId=' + parentMeetingAreaId)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken)
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
        it('should return meeting areas with no parent meeting area', function (done) {
            user1
                .get('/api/meetingareas?parentId=null')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result).to.have.length(1);
                    expect(result[0]._id).to.equal(parentMeetingAreaId);
                })
                .end(done);
        });
        it('should return 400 when given parent id and injection attack', function (done) {
            user1
                .get('/api/meetingareas?parentId=' + parentMeetingAreaId + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken)
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(function (res) {
                    expect(res.error.message).to.equal('cannot GET /api/meetingareas?parentId=' + parentMeetingAreaId + '%3Bvar%20date%3Dnew%20Date()%3B%20do%7BcurDate%20%3D%20new%20Date()%3B%7Dwhile(cur-Date-date%3C10000 (400)');
                })
                .end(done);
        });
        it('should return 400 with no parent meeting area and injection attack', function (done) {
            user1
                .get('/api/meetingareas?parentId=null' + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken)
                .expect('Content-Type', /json/)
                .expect(400)
                .expect(function (res) {
                    expect(res.error.message).to.equal('cannot GET /api/meetingareas?parentId=null' + '%3Bvar%20date%3Dnew%20Date()%3B%20do%7BcurDate%20%3D%20new%20Date()%3B%7Dwhile(cur-Date-date%3C10000 (400)');
                })
                .end(done);
        });
    });

});
