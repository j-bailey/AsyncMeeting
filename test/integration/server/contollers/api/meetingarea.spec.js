var Acl = require('../../../../../server/security/acl'),
    expect = require('chai').expect,
    MeetingArea,
    request = require('supertest'),
    User,
    db = require('../../../../../server/db'),
    bcrypt = require('bcrypt-nodejs');

// Load the models, so they get tied to the DB connections
require('../../../../../server/models/meetingArea');
require('../../../../../server/models/user');

var meetingAreaId = "";

var accessToken1,
    email1 = 'tom@tom.com',
    pass1 = 'pword123',
    username1 = 'tom',
    userModel1,
    user1AllowedResource,
    user1 = request('http://localhost:3001');

var accessToken2,
    email2 = 'kelly@kelly.com',
    pass2 = 'pword1234',
    username2 = 'kelly',
    userModel2,
    user2 = request('http://localhost:3001');

var accessToken3,
    email3 = 'cam@cam.com',
    pass3 = 'pword1234',
    username3 = 'cam',
    userModel3,
    user3 = request('http://localhost:3001');

var acl = null;

describe('meeting area route', function () {
    before(function (done) {
        Acl.init().then(function (aclIns) {
            acl = aclIns;

            User = db.readWriteConnection.model('User');
            User.remove().exec();
            //if (err) next(err);
            var user1Obj = new User({username: username1, email: email1, password: pass1});
            var user2Obj = new User({username: username2, email: email2, password: pass2});
            var user3Obj = new User({username: username3, email: email3, password: pass3});
            User.createNewSignedUpUser(user1Obj).then(function (savedUser1, err) {
                if (err) {
                    return done(err)
                }
                User.findById(savedUser1._id).select('+tenantId').lean().exec(function (err, savedUser1) {
                    userModel1 = savedUser1;
                    var UserAllowedResources = db.readWriteConnection.model('UserAllowedResources');
                    UserAllowedResources.findOne({userId: savedUser1._id}).exec(function (err, resource) {
                        user1AllowedResource = resource;
                        User.createNewSignedUpUser(user2Obj).then(function (savedUser2, err) {
                            if (err) {
                                return done(err)
                            }
                            User.findById(savedUser2._id).select('+tenantId').lean().exec(function (err, savedUser2) {
                                userModel2 = savedUser2;
                                User.createNewSignedUpUser(user3Obj).then(function (savedUser3, err) {
                                    if (err) {
                                        return done(err)
                                    }
                                    User.findById(savedUser3._id).select('+tenantId').lean().exec(function (err, savedUser3) {
                                        userModel3 = savedUser3;
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
                                                        user3
                                                            .post('/email-login')
                                                            .set('Accept', 'application/json, text/plain, */*')
                                                            .set('Accept-encoding', 'gzip, deflate')
                                                            .set('Content-type', 'application/json;charset=UTF-8')
                                                            .send({email: email3, password: pass3})
                                                            .end(function (err, res) {
                                                                // user1 will manage its own cookies
                                                                // res.redirects contains an Array of redirects
                                                                if (err) console.error('err = ' + err);

                                                                accessToken3 = res.body.access_token;
                                                                done();
                                                            });
                                                    });
                                            });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    beforeEach(function (done) {
        MeetingArea = db.readWriteConnection.model('MeetingArea');


        var meetingArea = new MeetingArea({
            title: "Meeting Area Title",
            description: "Meeting Area Description",
            tenantId: userModel1.tenantId
        });

        meetingArea.save(function (err, savedItem) {
            if (err) {
                return done(err);
            }

            meetingAreaId = savedItem.id;
            acl.allow('meetingarea-creator', '/api/meetingareas', 'post');
            acl.addUserRoles(userModel1.username, 'meetingarea-creator');
            acl.allow('meetingarea-editor-' + meetingAreaId, '/api/meetingareas/' + meetingAreaId, 'put');
            acl.addUserRoles(userModel1.username, 'meetingarea-editor-' + meetingAreaId);
            acl.allow('meetingarea-editor-' + meetingAreaId, '/api/meetingareas/' + meetingAreaId, 'delete');
            acl.addUserRoles(userModel1.username, 'meetingarea-editor-' + meetingAreaId);
            acl.allow('meetingarea-viewer-' + meetingAreaId, '/api/meetingareas/' + meetingAreaId, 'get');
            acl.addUserRoles(userModel1.username, 'meetingarea-viewer-' + meetingAreaId);


            var parentMeetingAreaId = user1AllowedResource.resourceId;
            var rootMeetingArea = new MeetingArea({
                title: "Root Meeting Area Title",
                description: "Root Meeting Area Description",
                parentMeetingArea: parentMeetingAreaId,
                tenantId: userModel1.tenantId
            });

            var a = parentMeetingAreaId.toString();
            rootMeetingArea.save(function (err, savedItem) {
                if (err) {
                    return done(err);
                }

                parentMeetingAreaId = savedItem.id;
                acl.allow('meetingarea-creator', '/api/meetingareas/' + parentMeetingAreaId, 'get');
                acl.addUserRoles(userModel1.username, 'meetingarea-creator');
                acl.allow('meetingarea-creator-parent', '/api/meetingareas', 'get');
                acl.addUserRoles(userModel1.username, 'meetingarea-creator-parent');

                var firstChildMeetingArea = new MeetingArea({
                    title: "First Child Meeting Area Title",
                    description: "First Child Meeting Area Description",
                    parentMeetingArea: parentMeetingAreaId,
                    tenantId: userModel1.tenantId
                });

                firstChildMeetingArea.save(function (err, savedChildItem) {
                    if (err) {
                        return done(err);
                    }
                    parentMeetingAreaId = savedChildItem.id;

                    var secondChildMeetingArea = new MeetingArea({
                        title: "Second Child Meeting Area Title",
                        description: "Second Child Meeting Area Description",
                        parentMeetingArea: parentMeetingAreaId,
                        tenantId: userModel1.tenantId
                    });

                    secondChildMeetingArea.save(function (err, savedChildItem2) {
                        if (err) {
                            return done(err);
                        }
                        parentMeetingAreaId = savedChildItem.id;

                        var thirdChildMeetingArea = new MeetingArea({
                            title: "Third Child Meeting Area Title",
                            description: "Third Child Meeting Area Description",
                            parentMeetingArea: parentMeetingAreaId,
                            tenantId: userModel1.tenantId
                        });
                        thirdChildMeetingArea.save(function (err, savedChildItem2) {
                            if (err) {
                                return done(err);
                            }
                            done();
                        });
                    });
                });
            });
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
                    expect(result._id).to.equal(meetingAreaId);
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
                    expect(result._id).to.not.be.null;
                    MeetingArea.find({_id: result._id}, function (err, meetingAreas) {
                        expect(meetingAreas).to.have.length(1);
                        done();
                    });
                });
        });
        it('should create multiple meeting areas with the correct hierarchy', function (done) {
            var expectedAncestors = [],
                ma1,
                ma2,
                ma3;

            user1
                .post('/api/meetingareas')
                .send({
                    title: "New Meeting Area",
                    description: "New Meeting Area Description"
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expectedAncestors.push(result._id);
                    ma1 = result._id;
                    expect(result._id).to.not.be.null;
                    expect(result.parentMeetingArea).to.be.null;
                    expect(result.ancestors.length).to.equal(0);
                    user1
                        .post('/api/meetingareas')
                        .send({
                            parentMeetingAreaId: result._id,
                            title: "New Meeting Area - 2nd Depth",
                            description: "New Meeting Area Description - 2nd Depth"
                        })
                        .set('Accept', 'application/json')
                        .set('Authorization', 'Bearer ' + accessToken1)
                        .expect('Content-Type', /json/)
                        .expect(201)
                        .end(function (err, res) {
                            var result = JSON.parse(res.text);
                            expectedAncestors.push(result._id);
                            ma2 = result._id;
                            expect(result._id).to.not.be.null;
                            expect(result.parentMeetingArea).to.not.be.null;
                            expect(result.ancestors.length).to.equal(1);
                            user1
                                .post('/api/meetingareas')
                                .send({
                                    parentMeetingAreaId: result._id,
                                    title: "New Meeting Area - 3rd Depth",
                                    description: "New Meeting Area Description - 3rd Depth"
                                })
                                .set('Accept', 'application/json')
                                .set('Authorization', 'Bearer ' + accessToken1)
                                .expect('Content-Type', /json/)
                                .expect(201)
                                .end(function (err, res) {
                                    var result = JSON.parse(res.text);
                                    expect(result._id).to.not.be.null;
                                    ma3 = result._id;
                                    expect(result.parentMeetingArea).to.not.be.null;
                                    expect(result.ancestors.length).to.equal(2);
                                    expect(result.ancestors).to.deep.equal(expectedAncestors);
                                    expectedAncestors.push(result._id);
                                    MeetingArea.find({_id: {$in: expectedAncestors}}).lean().exec(function (err, meetingAreas) {
                                        expect(meetingAreas).to.have.length(3);
                                        done();
                                    });
                                });
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
                    MeetingArea.find({_id: meetingAreaId}, function (err, meetingAreas) {
                        expect(meetingAreas.length).to.be.equal(0);
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
                    MeetingArea.find({_id: meetingAreaId}, function (err, meetingAreas) {
                        expect(meetingAreas).to.not.be.empty;
                        expect(meetingAreas[0]._id.toString()).to.equal(meetingAreaId);
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
