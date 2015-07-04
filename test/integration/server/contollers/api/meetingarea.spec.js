var Acl = require('../../../../../server/security/acl'),
    expect = require('chai').expect,
    MeetingArea = require(__dirname + '/../../../../../server/models/meetingArea'),
    request = require('supertest'),
    User = require('../../../../../server/models/user'),
    secUtil = require('../../../../../server/security/securityUtils'),
    bcrypt = require('bcrypt-nodejs'),
    db = require('../../../../../server/db');

var meetingAreaId = "",
    accessToken;
var email = 'tom@tom.com';
var pass = 'password123';
var username = 'tom';
var user1 = request('http://localhost:3001');
var acl = null;

describe('meeting area route', function () {
    before(function (done) {
        Acl.init().then(function (aclIns) {
            acl = aclIns;
            done();
        });
    });

    beforeEach(function (done) {
        meetingAreaId = "";
        db.connection.db.dropCollection('users', function (err, result) {
            //if (err) next(err);
            var user = new User({username: username, email: email, password: pass});
            user.password = bcrypt.hashSync(pass, bcrypt.genSaltSync(10), null);
            user.save(function (err) {
                if (err) {
                    return next(err)
                }
                secUtil.clearAllAccessTokens().then(function () {

                    MeetingArea.remove({}, function (err, removedItem) {
                        if (err) console.log("remove error: " + error.message);

                        var meetingArea = new MeetingArea({
                            title: "Meeting Area Title",
                            description: "Meeting Area Description"
                        });

                        meetingArea.save(function (err, savedItem) {
                            if (err) console.log("save error: " + error.message);

                            meetingAreaId = savedItem.id;
                            acl.allow('meetingarea-creator', '/api/meetingareas', 'post');
                            acl.addUserRoles(user.username, 'meetingarea-creator');
                            acl.allow('meetingarea-editor-'+ meetingAreaId, '/api/meetingareas/' + meetingAreaId, 'put');
                            acl.addUserRoles(user.username, 'meetingarea-editor-'+ meetingAreaId);
                            acl.allow('meetingarea-editor-'+ meetingAreaId, '/api/meetingareas/' + meetingAreaId, 'delete');
                            acl.addUserRoles(user.username, 'meetingarea-editor-'+ meetingAreaId);
                            acl.allow('meetingarea-viewer-'+ meetingAreaId, '/api/meetingareas/' + meetingAreaId, 'get');
                            acl.addUserRoles(user.username, 'meetingarea-viewer-'+ meetingAreaId);

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
            })
        });
    });

    describe('GET \'/\'', function () {
        it('should return a meeting area', function (done) {
            user1
                .get('/api/meetingareas/' + meetingAreaId)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result._id).to.equal(meetingAreaId);
                })
                .end(done);
        });
    });

    describe('POST \'/\'', function () {
        it('should create a meeting area', function (done) {
            user1
                .post('/api/meetingareas')
                .send({
                    parentMeetingAreaId: meetingAreaId,
                    title: "New Meeting Area",
                    description: "New Meeting Area Description"
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result._id).to.not.be.null;
                    MeetingArea.find({}, function (err, meetingAreas) {
                        expect(meetingAreas).to.have.length(2);
                        done();
                    });
                });
        });
    });

    describe('DELETE \'/\'', function () {
        it('should remove a meeting area', function (done) {
            user1
                .delete('/api/meetingareas/' + meetingAreaId)
                .set('Authorization', 'Bearer ' + accessToken)
                .expect(200)
                .end(function (err, res) {
                    MeetingArea.find({}, function (err, meetingAreas) {
                        expect(meetingAreas).to.be.empty;
                        done();
                    });
                });
        });
    });
});
