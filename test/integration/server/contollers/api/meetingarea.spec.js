var Acl = require('../../../../../server/security/acl'),
    expect = require('chai').expect,
    MeetingArea = require(__dirname + '/../../../../../server/models/meetingArea'),
    request = require('supertest'),
    User = require('../../../../../server/models/user'),
    secUtil = require('../../../../../server/security/securityUtils'),
    bcrypt = require('bcrypt-nodejs'),
    db = require('../../../../../server/db');

var meetingAreaId = "";

var accessToken1,
    email1 = 'tom@tom.com',
    pass1 = 'password123',
    username1 = 'tom',
    user1 = request('http://localhost:3001');
var accessToken2,
    email2 = 'kelly@kelly.com',
    pass2 = 'password1234',
    username2 = 'kelly',
    user2 = request('http://localhost:3001');
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
            var user1Obj = new User({username: username1, email: email1, password: pass1});
            user1Obj.password = bcrypt.hashSync(pass1, bcrypt.genSaltSync(10), null);
            var user2Obj = new User({username: username2, email: email2, password: pass2});
            user2Obj.password = bcrypt.hashSync(pass2, bcrypt.genSaltSync(10), null);
            user1Obj.save(function (err) {
                if (err) {
                    return done(err)
                }
                user2Obj.save(function (err) {
                    if (err) {
                        return done(err)
                    }

                    MeetingArea.remove({}, function (err, removedItem) {
                        if (err) console.log("remove error: " + error.message);

                        var meetingArea = new MeetingArea({
                            title: "Meeting Area Title",
                            description: "Meeting Area Description"
                        });

                        meetingArea.save(function (err, savedItem) {
                            if (err) console.log("save error: " + error.message);

                            meetingAreaId = savedItem.uuid;
                            acl.allow('meetingarea-creator', '/api/meetingareas', 'post');
                            acl.addUserRoles(user1Obj.username, 'meetingarea-creator');
                            acl.allow('meetingarea-editor-' + meetingAreaId, '/api/meetingareas/' + meetingAreaId, 'put');
                            acl.addUserRoles(user1Obj.username, 'meetingarea-editor-' + meetingAreaId);
                            acl.allow('meetingarea-editor-' + meetingAreaId, '/api/meetingareas/' + meetingAreaId, 'delete');
                            acl.addUserRoles(user1Obj.username, 'meetingarea-editor-' + meetingAreaId);
                            acl.allow('meetingarea-viewer-' + meetingAreaId, '/api/meetingareas/' + meetingAreaId, 'get');
                            acl.addUserRoles(user1Obj.username, 'meetingarea-viewer-' + meetingAreaId);

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
            })
        });
    });

    describe('GET \'/\'', function () {
        it('should return a meeting area', function (done) {
            user1
                .get('/api/meetingareas/' + meetingAreaId)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.uuid).to.equal(meetingAreaId);
                })
                .end(done);
        });
        it('should return a forbidden error', function (done) {
            user2
                .get('/api/meetingareas/' + meetingAreaId)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken2)
                .expect('Content-Type', /json/)
                .expect(403)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.msg).to.equal('Insufficient permissions to access resource');
                    expect(result.status).to.equal(403);
                })
                .end(done);
        });
        it('should return a 403 for an injection attack', function (done) {
            user1
                .get('/api/meetingareas/' + meetingAreaId + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(403)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(res.error.message).to.equal('cannot GET /api/meetingareas/' + meetingAreaId + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date%3C10000 (403)');
                    expect(result.msg).to.equal('Insufficient permissions to access resource');
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
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result.uuid).to.not.be.null;
                    MeetingArea.find({}, function (err, meetingAreas) {
                        expect(meetingAreas).to.have.length(2);
                        done();
                    });
                });
        });
        it('should return a forbidden error', function (done) {
            user2
                .post('/api/meetingareas')
                .send({
                    parentMeetingAreaId: meetingAreaId,
                    title: "New Meeting Area",
                    description: "New Meeting Area Description"
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken2)
                .expect('Content-Type', /json/)
                .expect(403)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result.msg).to.equal('Insufficient permissions to access resource');
                    expect(result.status).to.equal(403);
                    done();
                });
        });
    });

    describe('DELETE \'/\'', function () {
        it('should remove a meeting area', function (done) {
            user1
                .delete('/api/meetingareas/' + meetingAreaId)
                .set('Authorization', 'Bearer ' + accessToken1)
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    MeetingArea.find({}, function (err, meetingAreas) {
                        expect(meetingAreas).to.be.empty;
                        done();
                    });
                });
        });
        it('should return a forbidden error', function (done) {
            user2
                .delete('/api/meetingareas/' + meetingAreaId)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken2)
                .expect(403)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result.msg).to.equal('Insufficient permissions to access resource');
                    expect(result.status).to.equal(403);
                    done();
                });
        });
        it('should return a 403 for an injection attack', function (done) {
            user1
                .delete('/api/meetingareas/' + meetingAreaId + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Authorization', 'Bearer ' + accessToken1)
                .set('Accept', 'application/json')
                .expect(403)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(res.error.message).to.equal('cannot DELETE /api/meetingareas/' + meetingAreaId + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date%3C10000 (403)');
                    expect(result.msg).to.equal('Insufficient permissions to access resource');
                })
                .end(done);
        });
    });
    describe('PUT \'/\'', function () {
        it('should update a meeting area', function (done) {
            user1
                .put('/api/meetingareas/' + meetingAreaId)
                .send({
                    title: "New Updated Meeting Area",
                    description: "New Updated Meeting Area Description"
                })
                .set('Authorization', 'Bearer ' + accessToken1)
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result.title).to.equal("New Updated Meeting Area");
                    expect(result.description).to.equal("New Updated Meeting Area Description");
                    MeetingArea.find({
                        title: "New Updated Meeting Area",
                        description: "New Updated Meeting Area Description"
                    }, function (err, meetingAreas) {
                        expect(meetingAreas).to.not.be.empty;
                        expect(meetingAreas[0].title).to.equal("New Updated Meeting Area");
                        expect(meetingAreas[0].description).to.equal("New Updated Meeting Area Description");
                        done();
                    });
                });
        });
        it('should return a forbidden error', function (done) {
            user2
                .put('/api/meetingareas/' + meetingAreaId)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken2)
                .expect(403)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result.msg).to.equal('Insufficient permissions to access resource');
                    expect(result.status).to.equal(403);
                    done();
                });
        });
        it('should return a 403 for an injection attack', function (done) {
            user1
                .put('/api/meetingareas/' + meetingAreaId + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Authorization', 'Bearer ' + accessToken1)
                .set('Accept', 'application/json')
                .expect(403)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(res.error.message).to.equal('cannot PUT /api/meetingareas/' + meetingAreaId + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date%3C10000 (403)');
                    expect(result.msg).to.equal('Insufficient permissions to access resource');
                })
                .end(done);
        });
    });
});
