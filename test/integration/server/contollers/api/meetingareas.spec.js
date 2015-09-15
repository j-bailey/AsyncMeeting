var Acl = require('../../../../../server/security/acl'),
    expect = require('chai').expect,
    MeetingArea,
    Q = require('q'),
    UserAllowedResources,
    meetingAreaHandler = require('../../../../../server/controllers/api/handlers/meetingAreasHandler'),
    usersHandler = require('../../../../../server/controllers/api/handlers/usersHandler'),
    request = require('supertest'),
    User,
    bcrypt = require('bcrypt-nodejs'),
    db = require('../../../../../server/db');

// Load the models, so they get tied to the DB connections
require('../../../../../server/models/meetingArea');
require('../../../../../server/models/user');


var parentMeetingAreaId = "";
var firstMeetingAreaId = "";
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
var accessToken3,
    email3 = 'bob@bob.com',
    pass3 = 'pword123',
    username3 = 'bob',
    userModel3,
    user3 = request('http://localhost:3001');
var acl = null;


describe('controller/api/meetingAreas', function () {


    before(function (done) {
        Acl.init().then(function (aclIns) {
            acl = aclIns;
            User = db.readWriteConnection.model('User');
            MeetingArea = db.readWriteConnection.model('MeetingArea');
            UserAllowedResources = db.readWriteConnection.model('UserAllowedResources');

            UserAllowedResources.remove().exec();
            MeetingArea.remove().exec();
            User.remove().exec();
            //if (err) done(err);
            var user1Obj = new User({username: username1, email: email1, password: pass1});
            var user2Obj = new User({username: username2, email: email2, password: pass2});
            var user3Obj = new User({username: username3, email: email3, password: pass3});

            Q.allSettled([
                usersHandler.createNewSignedUpUser(user1Obj),
                usersHandler.createNewSignedUpUser(user2Obj),
                usersHandler.createNewSignedUpUser(user3Obj)
            ]).spread(function (savedUser1, savedUser2, savedUser3) {
                Q.allSettled([
                        global.getUserWithTentantIdByUserId(savedUser1.value._id),
                        global.getUserWithTentantIdByUserId(savedUser2.value._id),
                        global.getUserWithTentantIdByUserId(savedUser3.value._id)
                    ]
                ).spread(function (u1, u2, u3) {
                        userModel1 = u1.value;
                        userModel2 = u2.value;
                        userModel3 = u3.value;
                        Q.allSettled([
                            global.loginToServer(user1, email1, pass1),
                            global.loginToServer(user2, email2, pass2),
                            global.loginToServer(user3, email3, pass3)
                        ]).spread(function (token1, token2, token3) {
                            accessToken1 = token1.value;
                            accessToken2 = token2.value;
                            accessToken3 = token3.value;
                            var meetingArea = new MeetingArea({
                                title: "Parent Meeting Area Title",
                                description: "Parent Meeting Area Description",
                                parentMeetingArea: null,
                                inheritsParentAccess: true,
                                tenantId: userModel1.tenantId
                            });

                            meetingAreaHandler._createMeetingArea(meetingArea, userModel1.username, db.readWriteConnection).then(function (savedItem, err) {
                                firstMeetingAreaId = savedItem.parentMeetingArea;
                                parentMeetingAreaId = savedItem._id;

                                var childMeetingArea = new MeetingArea({
                                    title: "Child Meeting Area Title",
                                    description: "Child Meeting Area Description",
                                    parentMeetingArea: savedItem._id,
                                    inheritsParentAccess: true,
                                    tenantId: userModel1.tenantId
                                });

                                meetingAreaHandler._createMeetingArea(childMeetingArea, userModel1.username, db.readWriteConnection).then(function (savedChildItem, err) {
                                    childMeetingAreaId = savedChildItem._id;


                                    var child2MeetingArea = new MeetingArea({
                                        title: "Child 2 Meeting Area Title",
                                        description: "Child 2 Meeting Area Description",
                                        parentMeetingArea: savedChildItem._id,
                                        inheritsParentAccess: true,
                                        tenantId: userModel1.tenantId
                                    });

                                    meetingAreaHandler._createMeetingArea(child2MeetingArea, userModel1.username, db.readWriteConnection).then(function (savedChildItem2) {
                                        child2MeetingAreaId = savedChildItem2._id;
                                        MeetingArea.findById(parentMeetingAreaId)
                                            .select('+tenantId')
                                            .lean()
                                            .exec(function (err, meetingArea) {
                                                if (err) {
                                                    done(err);
                                                }
                                                meetingAreaHandler._grantUserAccess(userModel3._id, meetingArea.tenantId, meetingArea._id, 'editor', db.readWriteConnection).then(function () {
                                                    done();
                                                });
                                            });
                                    });
                                });

                            }).catch(function (err) {
                                return done(err);
                            });
                        }).done()
                    }).done()
            }).done();
        }).catch(function (err) {
            return done(err);
        }).done();
    });

    //beforeEach(function (done) {
    //});


    describe('GET \'/\' by query', function () {
        it('should return meeting areas with the given parent id', function (done) {
            user1
                .get('/api/meetingareas?parentId=' + parentMeetingAreaId)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data).to.have.length(1);
                    expect(result.data[0]._id.toString()).to.equal(childMeetingAreaId.toString());
                })
                .end(done);
        });
        it('should return 2 meeting areas by skip and limit', function (done) {
            user1
                .get('/api/meetingareas?parentId=null&skip=2&limit=2')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data).to.have.length(2);
                    expect(result.data[0]._id.toString()).to.equal(childMeetingAreaId.toString());
                    expect(result.data[1]._id.toString()).to.equal(child2MeetingAreaId.toString());
                })
                .end(done);
        });
        it('should return 2 meeting areas by skip', function (done) {
            user1
                .get('/api/meetingareas?parentId=null&skip=2')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data).to.have.length(2);
                    expect(result.data[0]._id.toString()).to.equal(childMeetingAreaId.toString());
                    expect(result.data[1]._id.toString()).to.equal(child2MeetingAreaId.toString());
                })
                .end(done);
        });
        it('should return 2 meeting areas by limit', function (done) {
            user1
                .get('/api/meetingareas?parentId=null&limit=2')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data).to.have.length(2);
                    expect(result.data[0]._id.toString()).to.equal(firstMeetingAreaId.toString());
                    expect(result.data[1]._id.toString()).to.equal(parentMeetingAreaId.toString());
                })
                .end(done);
        });

        it('should return meeting areas with the given parent id due to granted access above it', function (done) {
            user1
                .get('/api/meetingareas?parentId=' + childMeetingAreaId)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken3)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data).to.have.length(1);
                    expect(result.data[0]._id.toString()).to.equal(child2MeetingAreaId.toString());
                })
                .end(done);
        });
        it('should get access denied for a given parent id due to granted access above it, but inheritsParentAccess set to false', function (done) {
            MeetingArea.update({_id: childMeetingAreaId}, {inheritsParentAccess: false}, function (err, raw) {
                if (err) return done(err);
                user1
                    .get('/api/meetingareas?parentId=' + childMeetingAreaId)
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + accessToken3)
                    .expect('Content-Type', /json/)
                    .expect(401)
                    .expect(function (res) {
                        var result = JSON.parse(res.text);
                        expect(result.status).to.equal('error');
                        expect(result.message).to.equal('Not allowed');
                    })
                    .end(function () {
                        MeetingArea.update({_id: childMeetingAreaId}, {inheritsParentAccess: true}, function (err, raw) {
                            if (err) return done(err);
                            done();
                        });
                    });

            })
        });
        it('should get access denied for a given parent id due to granted access above it, but inheritsParentAccess set to false on parent', function (done) {
            MeetingArea.update({_id: childMeetingAreaId}, {inheritsParentAccess: false}, function (err, raw) {
                if (err) return done(err);
                user1
                    .get('/api/meetingareas?parentId=' + parentMeetingAreaId)
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + accessToken3)
                    .expect('Content-Type', /json/)
                    .expect(401)
                    .expect(function (res) {
                        var result = JSON.parse(res.text);
                        expect(result.status).to.equal('error');
                        expect(result.message).to.equal('Not allowed');
                    })
                    .end(function () {
                        MeetingArea.update({_id: childMeetingAreaId}, {inheritsParentAccess: true}, function (err, raw) {
                            if (err) return done(err);
                            done();
                        });
                    });

            })
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
                    expect(result.data).to.not.be.null;
                    expect(result.message).to.equal('Not allowed');
                    expect(result.status).to.equal('error');
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
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var result = JSON.parse(res.text);
                    MeetingArea.find({
                        $or: [{ancestors: firstMeetingAreaId}, {_id: firstMeetingAreaId},
                            {$and: [{tenantId: userModel1.tenantId}, {parentMeetingArea: null}]}]
                    })
                        .sort('_id')
                        .exec(function (err, meetingAreas) {
                            expect(result.data).to.have.length(meetingAreas.length);
                            expect(result.data[1]._id.toString()).to.equal(parentMeetingAreaId.toString());
                            expect(result.data[2]._id.toString()).to.equal(childMeetingAreaId.toString());
                            expect(result.data[3]._id.toString()).to.equal(child2MeetingAreaId.toString());
                            done();
                        });
                });
        });
        it('should return limited meeting areas based on granted access with no parent meeting area', function (done) {
            user1
                .get('/api/meetingareas?parentId=null')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken3)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var result = JSON.parse(res.text);
                    MeetingArea.find(
                        {
                            $or: [{ancestors: childMeetingAreaId}, {_id: childMeetingAreaId},
                                {$and: [{tenantId: userModel3.tenantId}, {parentMeetingArea: null}]}]
                        })
                        .sort('_id')
                        .exec(function (err, meetingAreas) {
                            expect(result.data).to.have.length(meetingAreas.length + 1);
                            expect(result.data[1]._id.toString()).to.equal(parentMeetingAreaId.toString());
                            expect(result.data[2]._id.toString()).to.equal(childMeetingAreaId.toString());
                            expect(result.data[3]._id.toString()).to.equal(child2MeetingAreaId.toString());
                            done();
                        });
                });
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
                    expect(JSON.parse(res.text).status).to.equal('error');
                    expect(JSON.parse(res.text).message).to.equal('Not allowed');
                })
                .end(done);
        });
        it('should return 401 with no parent meeting area and injection attack', function (done) {
            user1
                .get('/api/meetingareas?parentId=null' + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(401)
                .expect(function (res) {
                    expect(res.error.message).to.equal('cannot GET /api/meetingareas?parentId=null' + '%3Bvar%20date%3Dnew%20Date()%3B%20do%7BcurDate%20%3D%20new%20Date()%3B%7Dwhile(cur-Date-date%3C10000 (401)');
                    expect(JSON.parse(res.text).status).to.equal('error');
                    expect(JSON.parse(res.text).message).to.equal('Not allowed');
                })
                .end(done);
        });
    });
    describe('POST \'/:meetingAreaId/member/:userId\'', function () {
        it('should grant viewer access to meeting area', function (done) {
            user1
                .post('/api/meetingareas/' + parentMeetingAreaId + '/member/' + userModel2._id)
                .send({
                    permission: 'viewer'
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    UserAllowedResources.find({resourceId: parentMeetingAreaId})
                        .and({userId: userModel2._id})
                        .lean()
                        .exec(function (err, allowedResources) {
                            expect(allowedResources).to.have.length(1);
                            expect(allowedResources[0].userId.toString()).to.equal(userModel2._id.toString());
                            expect(allowedResources[0].resourceType).to.equal('MeetingArea');
                            acl.isAllowed(userModel2.username, '/api/meetingareas/' + parentMeetingAreaId, 'get', function (err, result) {
                                expect(err).to.be.null;
                                expect(result).to.equal(true);
                                done();
                            });
                        });
                });
        });
    });
    describe('DELETE \'/:meetingAreaId/member/:userId\'', function () {
        it('should remove grant viewer access to meeting area', function (done) {
            user1
                .delete('/api/meetingareas/' + parentMeetingAreaId + '/member/' + userModel2._id)
                .send({
                    permission: 'viewer'
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    UserAllowedResources.find({resourceId: parentMeetingAreaId})
                        .and({userId: userModel2._id})
                        .lean()
                        .exec(function (err, allowedResources) {
                            expect(allowedResources).to.have.length(0);
                            acl.isAllowed(userModel2.username, '/api/meetingareas/' + parentMeetingAreaId, 'get', function (err, result) {
                                expect(err).to.be.null;
                                expect(result).to.equal(false);
                                done();
                            });
                        });
                })
        });
    });
    describe('GET \'/\' by path', function () {
        it('should return a meeting area', function (done) {
            user1
                .get('/api/meetingareas/' + parentMeetingAreaId)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data._id.toString()).to.equal(parentMeetingAreaId.toString());
                })
                .end(done);
        });
        it('should return a forbidden error', function (done) {
            user2
                .get('/api/meetingareas/' + parentMeetingAreaId)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken2)
                .expect('Content-Type', /json/)
                .expect(401)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.message).to.equal('Not allowed');
                    expect(result.status).to.equal('error');
                    expect(result.data).to.be.empty;
                })
                .end(done);
        });
        it('should return a forbidden error', function (done) {
            MeetingArea.update({_id: childMeetingAreaId}, {inheritsParentAccess: false}, function (err, raw) {
                if (err) return done(err);

                user2
                    .get('/api/meetingareas/' + parentMeetingAreaId)
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + accessToken3)
                    .expect('Content-Type', /json/)
                    .expect(401)
                    .expect(function (res) {
                        var result = JSON.parse(res.text);
                        expect(result.message).to.equal('Not allowed');
                        expect(result.status).to.equal('error');
                        expect(result.data).to.be.empty;
                    })
                    .end(function () {
                        MeetingArea.update({_id: childMeetingAreaId}, {inheritsParentAccess: false}, function (err, raw) {
                            if (err) return done(err);
                            done();
                        });
                    });
            });
        });
        it('should return a forbidden error', function (done) {
            MeetingArea.update({_id: childMeetingAreaId}, {inheritsParentAccess: false}, function (err, raw) {
                if (err) return done(err);

                user2
                    .get('/api/meetingareas/' + childMeetingAreaId)
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + accessToken3)
                    .expect('Content-Type', /json/)
                    .expect(401)
                    .expect(function (res) {
                        var result = JSON.parse(res.text);
                        expect(result.message).to.equal('Not allowed');
                        expect(result.status).to.equal('error');
                        expect(result.data).to.be.empty;
                    })
                    .end(function () {
                        MeetingArea.update({_id: childMeetingAreaId}, {inheritsParentAccess: false}, function (err, raw) {
                            if (err) return done(err);
                            done();
                        });
                    });
            });
        });

        it('should return a 403 for an injection attack', function (done) {
            user1
                .get('/api/meetingareas/' + parentMeetingAreaId + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(401)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(res.error.message).to.equal('cannot GET /api/meetingareas/' + parentMeetingAreaId + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date%3C10000 (401)');
                    expect(result.message).to.equal('Not allowed');
                })
                .end(done);
        });
    });
    describe('POST \'/\'', function () {
        it('should create a meeting area', function (done) {
            user1
                .post('/api/meetingareas')
                .send({
                    parentMeetingAreaId: parentMeetingAreaId,
                    title: "New Meeting Area",
                    description: "New Meeting Area Description"
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var result = JSON.parse(res.text);
                    expect(result.data._id).to.not.be.null;
                    MeetingArea.find({_id: result.data._id}, function (err, meetingAreas) {
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
                    description: "New Meeting Area Description",
                    parentMeetingAreaId: null
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    var result = JSON.parse(res.text);
                    ma1 = result.data._id;
                    expect(result.data._id).to.not.be.null;
                    MeetingArea.find({$and: [{tenantId: userModel1.tenantId}, {parentMeetingArea: null}]})
                        .lean()
                        .exec(function (err, expectedMeetingArea) {
                            if (err) {
                                return done(err);
                            }
                            expect(expectedMeetingArea.length).to.equal(1);
                            expect(result.data.parentMeetingArea).to.equal(expectedMeetingArea[0]._id.toString());
                            expectedAncestors.push(expectedMeetingArea[0]._id.toString());
                            expectedAncestors.push(result.data._id);
                            expect(result.data.ancestors.length).to.equal(1);
                            user1
                                .post('/api/meetingareas')
                                .send({
                                    parentMeetingAreaId: result.data._id,
                                    title: "New Meeting Area - 2nd Depth",
                                    description: "New Meeting Area Description - 2nd Depth"
                                })
                                .set('Accept', 'application/json')
                                .set('Authorization', 'Bearer ' + accessToken1)
                                .expect('Content-Type', /json/)
                                .expect(201)
                                .end(function (err, res) {
                                    if (err) {
                                        return done(err);
                                    }
                                    var result = JSON.parse(res.text);
                                    expectedAncestors.push(result.data._id);
                                    ma2 = result.data._id;
                                    expect(result.data._id).to.not.be.null;
                                    expect(result.data.parentMeetingArea).to.not.be.null;
                                    expect(result.data.ancestors.length).to.equal(2);
                                    user1
                                        .post('/api/meetingareas')
                                        .send({
                                            parentMeetingAreaId: result.data._id,
                                            title: "New Meeting Area - 3rd Depth",
                                            description: "New Meeting Area Description - 3rd Depth"
                                        })
                                        .set('Accept', 'application/json')
                                        .set('Authorization', 'Bearer ' + accessToken1)
                                        .expect('Content-Type', /json/)
                                        .expect(201)
                                        .end(function (err, res) {
                                            if (err) {
                                                return done(err);
                                            }
                                            var result = JSON.parse(res.text);
                                            expect(result.data._id).to.not.be.null;
                                            ma3 = result.data._id;
                                            expect(result.data.parentMeetingArea).to.not.be.null;
                                            expect(result.data.ancestors.length).to.equal(3);
                                            expect(result.data.ancestors).to.deep.equal(expectedAncestors);
                                            expectedAncestors.push(result.data._id);
                                            MeetingArea.find({_id: {$in: expectedAncestors}}).lean().exec(function (err, meetingAreas) {
                                                expect(meetingAreas).to.have.length(expectedAncestors.length);
                                                done();
                                            });
                                        });
                                });

                        });
                });
        });
        it('should return a forbidden error', function (done) {
            user2
                .post('/api/meetingareas')
                .send({
                    parentMeetingAreaId: parentMeetingAreaId,
                    title: "New Meeting Area",
                    description: "New Meeting Area Description"
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken2)
                .expect('Content-Type', /json/)
                .expect(401)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    var result = JSON.parse(res.text);
                    expect(result.message).to.equal('Not allowed');
                    expect(result.status).to.equal('error');
                    expect(result.data).to.be.empty;
                    done();
                });
        });
    });
    describe('DELETE \'/\'', function () {
        it('should remove a meeting area', function (done) {
            user1
                .post('/api/meetingareas')
                .send({
                    parentMeetingAreaId: parentMeetingAreaId,
                    title: "New Meeting Area for delete",
                    description: "New Meeting Area for delete Description"
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var result = JSON.parse(res.text);
                    expect(result.data._id).to.not.be.null;
                    MeetingArea.find({_id: result.data._id}, function (err, meetingAreas) {
                        expect(meetingAreas).to.have.length(1);
                        user1
                            .delete('/api/meetingareas/' + result.data._id)
                            .set('Authorization', 'Bearer ' + accessToken1)
                            .set('Accept', 'application/json')
                            .expect(200)
                            .end(function (err, res) {
                                if (err) {
                                    return done(err);
                                }
                                MeetingArea.find({_id: result.data._id}, function (err, meetingAreas) {
                                    expect(meetingAreas.length).to.be.equal(0);
                                    done();
                                });
                            });
                    });
                });
        });
        it('should return a forbidden error for invalid ID', function (done) {
            user2
                .delete('/api/meetingareas/' + parentMeetingAreaId + 'a')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken2)
                .expect(401)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    var result = JSON.parse(res.text);
                    expect(result.message).to.equal('Not allowed');
                    expect(result.status).to.equal('error');
                    expect(result.data).to.be.empty;
                    done();
                });
        });
        it('should return a forbidden error for unavailable ID', function (done) {
            user2
                .delete('/api/meetingareas/a' + parentMeetingAreaId.toString().substring(1))
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken2)
                .expect(401)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    var result = JSON.parse(res.text);
                    expect(result.message).to.equal('Not allowed');
                    expect(result.status).to.equal('error');
                    expect(result.data).to.be.empty;
                    done();
                });
        });
        it('should return a forbidden error', function (done) {
            user2
                .delete('/api/meetingareas/' + parentMeetingAreaId)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken2)
                .expect(401)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    var result = JSON.parse(res.text);
                    expect(result.message).to.equal('Not allowed');
                    expect(result.status).to.equal('error');
                    expect(result.data).to.be.empty;
                    done();
                });
        });
        it('should return a 403 for an injection attack', function (done) {
            user1
                .delete('/api/meetingareas/' + parentMeetingAreaId + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Authorization', 'Bearer ' + accessToken1)
                .set('Accept', 'application/json')
                .expect(401)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(res.error.message).to.equal('cannot DELETE /api/meetingareas/' + parentMeetingAreaId + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date%3C10000 (401)');
                    expect(result.message).to.equal('Not allowed');
                    expect(result.status).to.equal('error');
                    expect(result.data).to.be.empty;
                })
                .end(done);
        });
    });
    describe('PUT \'/\'', function () {
        it('should update a meeting area', function (done) {
            user1
                .put('/api/meetingareas/' + parentMeetingAreaId)
                .send({
                    title: "New Updated Meeting Area",
                    description: "New Updated Meeting Area Description"
                })
                .set('Authorization', 'Bearer ' + accessToken1)
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    var result = JSON.parse(res.text);
                    expect(result.data.title).to.equal("New Updated Meeting Area");
                    expect(result.data.description).to.equal("New Updated Meeting Area Description");
                    MeetingArea.find({_id: parentMeetingAreaId}, function (err, meetingAreas) {
                        expect(meetingAreas).to.not.be.empty;
                        expect(meetingAreas[0]._id.toString()).to.equal(parentMeetingAreaId.toString());
                        expect(meetingAreas[0].title).to.equal("New Updated Meeting Area");
                        expect(meetingAreas[0].description).to.equal("New Updated Meeting Area Description");
                        done();
                    });
                });
        });
        it('should an updated meeting areas without changing the parent', function (done) {
            user1
                .put('/api/meetingareas/' + child2MeetingAreaId)
                .send({
                    title: "New Updated Meeting Area",
                    description: "New Updated Meeting Area Description",
                    parentMeetingArea: parentMeetingAreaId
                })
                .set('Authorization', 'Bearer ' + accessToken1)
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    var result = JSON.parse(res.text);
                    expect(result.data.title).to.equal("New Updated Meeting Area");
                    expect(result.data.description).to.equal("New Updated Meeting Area Description");
                    MeetingArea.find({_id: child2MeetingAreaId}, function (err, meetingAreas) {
                        expect(meetingAreas).to.not.be.empty;
                        expect(meetingAreas[0].parentMeetingArea.toString()).to.not.equal(parentMeetingAreaId.toString());
                        expect(meetingAreas[0].title).to.equal("New Updated Meeting Area");
                        expect(meetingAreas[0].description).to.equal("New Updated Meeting Area Description");
                        done();
                    });
                });
        });

        it('should return a forbidden error', function (done) {
            user2
                .put('/api/meetingareas/' + parentMeetingAreaId)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken2)
                .expect(401)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    var result = JSON.parse(res.text);
                    expect(result.message).to.equal('Not allowed');
                    expect(result.status).to.equal('error');
                    expect(result.data).to.be.empty;
                    done();
                });
        });
        it('should return a 403 for an injection attack', function (done) {
            user1
                .put('/api/meetingareas/' + parentMeetingAreaId + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Authorization', 'Bearer ' + accessToken1)
                .set('Accept', 'application/json')
                .expect(401)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(res.error.message).to.equal('cannot PUT /api/meetingareas/' + parentMeetingAreaId + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date%3C10000 (401)');
                    expect(result.message).to.equal('Not allowed');
                    expect(result.status).to.equal('error');
                    expect(result.data).to.be.empty;
                })
                .end(done);
        });
    });
});
