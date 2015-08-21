var Acl = require('../../../../../server/security/acl'),
    expect = require('chai').expect,
    MeetingArea,
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


describe('meeting areas route', function () {
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
            usersHandler.createNewSignedUpUser(user1Obj).then(function (savedUser1, err) {
                if (err) {
                    return done(err)
                }
                User.findById(savedUser1._id).select('+tenantId').lean().exec(function (err, savedUser1) {
                    userModel1 = savedUser1;
                    usersHandler.createNewSignedUpUser(user2Obj).then(function (savedUser2, err) {
                        if (err) {
                            return done(err)
                        }
                        User.findById(savedUser2._id).select('+tenantId').lean().exec(function (err, savedUser2) {
                            if (err) {
                                return done(err)
                            }
                            userModel2 = savedUser2;
                            usersHandler.createNewSignedUpUser(user3Obj).then(function (savedUser3, err) {
                                if (err) {
                                    return done(err)
                                }
                                User.findById(savedUser3._id).select('+tenantId').lean().exec(function (err, savedUser3) {
                                    if (err) {
                                        return done(err)
                                    }
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
                                            if (err) {
                                                return done(err)
                                            }

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
                                                    if (err) {
                                                        return done(err)
                                                    }

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
                                                            if (err) {
                                                                return done(err)
                                                            }

                                                            accessToken3 = res.body.access_token;
                                                            parentMeetingAreaId = "";
                                                            childMeetingAreaId = "";
                                                            child2MeetingAreaId = "";

                                                            var meetingArea = new MeetingArea({
                                                                title: "Parent Meeting Area Title",
                                                                description: "Parent Meeting Area Description",
                                                                parentMeetingArea: null,
                                                                tenantId: userModel1.tenantId
                                                            });

                                                            meetingAreaHandler._createMeetingArea(meetingArea, userModel1.username, db.readWriteConnection).then(function (savedItem, err) {
                                                                firstMeetingAreaId = savedItem.parentMeetingArea;
                                                                parentMeetingAreaId = savedItem._id;

                                                                var childMeetingArea = new MeetingArea({
                                                                    title: "Child Meeting Area Title",
                                                                    description: "Child Meeting Area Description",
                                                                    parentMeetingArea: savedItem._id,
                                                                    tenantId: userModel1.tenantId
                                                                });

                                                                meetingAreaHandler._createMeetingArea(childMeetingArea, userModel1.username, db.readWriteConnection).then(function (savedChildItem, err) {
                                                                    childMeetingAreaId = savedChildItem._id;


                                                                    var child2MeetingArea = new MeetingArea({
                                                                        title: "Child 2 Meeting Area Title",
                                                                        description: "Child 2 Meeting Area Description",
                                                                        parentMeetingArea: savedChildItem._id,
                                                                        tenantId: userModel1.tenantId
                                                                    });

                                                                    meetingAreaHandler._createMeetingArea(child2MeetingArea, userModel1.username, db.readWriteConnection).then(function (savedChildItem2) {
                                                                        child2MeetingAreaId = savedChildItem2._id;
                                                                        MeetingArea.findById(childMeetingAreaId)
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
                                                        });
                                                });
                                        });
                                });
                            });
                        });
                    });
                });
            });
        }).catch(function(err){
            return done(err);
        });
    });

    //beforeEach(function (done) {
    //});


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
                    expect(result).to.have.length(1);
                    expect(result[0]._id.toString()).to.equal(childMeetingAreaId.toString());
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
                    expect(result).to.have.length(1);
                    expect(result[0]._id.toString()).to.equal(child2MeetingAreaId.toString());
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
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var result = JSON.parse(res.text);
                    MeetingArea.find({$or: [{ancestors: firstMeetingAreaId}, {_id: firstMeetingAreaId},
                        {$and: [{tenantId: userModel1.tenantId}, {parentMeetingArea: null}]}]})
                        .sort('_id')
                        .exec(function (err, meetingAreas) {
                        expect(result).to.have.length(meetingAreas.length);
                        expect(result[1]._id.toString()).to.equal(parentMeetingAreaId.toString());
                        expect(result[2]._id.toString()).to.equal(childMeetingAreaId.toString());
                        expect(result[3]._id.toString()).to.equal(child2MeetingAreaId.toString());
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
                            expect(result).to.have.length(meetingAreas.length);
                            expect(result[1]._id.toString()).to.equal(childMeetingAreaId.toString());
                            expect(result[2]._id.toString()).to.equal(child2MeetingAreaId.toString());
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
                // FIXME need to get the 401 to show up in the http code
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
    describe('Post \'/:meetingAreaId/member/:userId\'', function () {
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
    describe('Delete \'/:meetingAreaId/member/:userId\'', function () {
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
    describe('GET \'/\'', function () {
        it('should return a meeting area', function (done) {
            user1
                .get('/api/meetingareas/' + parentMeetingAreaId)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result._id.toString()).to.equal(parentMeetingAreaId.toString());
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
                    expect(result.msg).to.equal('Not allowed');
                    expect(result.status).to.equal(401);
                })
                .end(done);
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
                    expect(result.msg).to.equal('Not allowed');
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
                    ma1 = result._id;
                    expect(result._id).to.not.be.null;
                    MeetingArea.find({$and: [{tenantId: userModel1.tenantId}, {parentMeetingArea: null}]})
                        .lean()
                        .exec(function (err, expectedMeetingArea) {
                            if (err) {
                                return done(err);
                            }
                            expect(expectedMeetingArea.length).to.equal(1);
                            expect(result.parentMeetingArea).to.equal(expectedMeetingArea[0]._id.toString());
                            expectedAncestors.push(expectedMeetingArea[0]._id.toString());
                            expectedAncestors.push(result._id);
                            expect(result.ancestors.length).to.equal(1);
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
                                    if (err) {
                                        return done(err);
                                    }
                                    var result = JSON.parse(res.text);
                                    expectedAncestors.push(result._id);
                                    ma2 = result._id;
                                    expect(result._id).to.not.be.null;
                                    expect(result.parentMeetingArea).to.not.be.null;
                                    expect(result.ancestors.length).to.equal(2);
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
                                            if (err) {
                                                return done(err);
                                            }
                                            var result = JSON.parse(res.text);
                                            expect(result._id).to.not.be.null;
                                            ma3 = result._id;
                                            expect(result.parentMeetingArea).to.not.be.null;
                                            expect(result.ancestors.length).to.equal(3);
                                            expect(result.ancestors).to.deep.equal(expectedAncestors);
                                            expectedAncestors.push(result._id);
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
                    if (err){
                        return done(err);
                    }
                    var result = JSON.parse(res.text);
                    expect(result.msg).to.equal('Not allowed');
                    expect(result.status).to.equal(401);
                    done();
                });
        });
    });
    describe('DELETE \'/\'', function () {
        it('should remove a meeting area', function (done) {
            user1
                .delete('/api/meetingareas/' + child2MeetingAreaId)
                .set('Authorization', 'Bearer ' + accessToken1)
                .set('Accept', 'application/json')
                .expect(200)
                .end(function (err, res) {
                    if (err){
                        return done(err);
                    }
                    MeetingArea.find({_id: child2MeetingAreaId}, function (err, meetingAreas) {
                        expect(meetingAreas.length).to.be.equal(0);
                        done();
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
                    if (err){
                        return done(err);
                    }
                    var result = JSON.parse(res.text);
                    expect(result.msg).to.equal('Not allowed');
                    expect(result.status).to.equal(401);
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
                    if (err){
                        return done(err);
                    }
                    var result = JSON.parse(res.text);
                    expect(result.msg).to.equal('Not allowed');
                    expect(result.status).to.equal(401);
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
                    if (err){
                        return done(err);
                    }
                    var result = JSON.parse(res.text);
                    expect(result.msg).to.equal('Not allowed');
                    expect(result.status).to.equal(401);
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
                    expect(result.msg).to.equal('Not allowed');
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
                    if (err){
                        return done(err);
                    }
                    var result = JSON.parse(res.text);
                    expect(result.title).to.equal("New Updated Meeting Area");
                    expect(result.description).to.equal("New Updated Meeting Area Description");
                    MeetingArea.find({_id: parentMeetingAreaId}, function (err, meetingAreas) {
                        expect(meetingAreas).to.not.be.empty;
                        expect(meetingAreas[0]._id.toString()).to.equal(parentMeetingAreaId.toString());
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
                    if (err){
                        return done(err);
                    }
                    var result = JSON.parse(res.text);
                    expect(result.msg).to.equal('Not allowed');
                    expect(result.status).to.equal(401);
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
                    expect(result.msg).to.equal('Not allowed');
                })
                .end(done);
        });
    });
});
