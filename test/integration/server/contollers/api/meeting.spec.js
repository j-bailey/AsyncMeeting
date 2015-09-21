var Acl = require('../../../../../server/security/acl'),
    expect = require('chai').expect,
    Meeting,
    Q = require('q'),
    UserAllowedResources,
    meetingHandler = require('../../../../../server/controllers/api/handlers/meetingsHandler'),
    usersHandler = require('../../../../../server/controllers/api/handlers/usersHandler'),
    request = require('supertest'),
    User,
    bcrypt = require('bcrypt-nodejs'),
    db = require('../../../../../server/db');

// Load the models, so they get tied to the DB connections
require('../../../../../server/models/meeting');
require('../../../../../server/models/user');

var request = request('http://localhost:3001')

var owningUser = {
    accessToken: undefined,
    email: 'tom@tom.com',
    password: 'pword123',
    username: 'tom',
    userModel: undefined
};
var creatingUser = {
    accessToken: undefined,
    email: 'terry@terry.com',
    password: 'pword123',
    username: 'terry',
    userModel: undefined
};
var inviteeUser = {
    accessToken: undefined,
    email: 'bob@bob.com',
    password: 'pword123',
    username: 'bob',
    userModel: undefined
};

var viewingUser = {
    accessToken: undefined,
    email: 'vic@vic.com',
    password: 'pword123',
    username: 'vic',
    userModel: undefined
};

var editingUser = {
    accessToken: undefined,
    email: 'eddy@eddy.com',
    password: 'pword123',
    username: 'eddy',
    userModel: undefined
};

var noAccessUser = {
    accessToken: undefined,
    email: 'ned@ned.com',
    password: 'pword123',
    username: 'ned',
    userModel: undefined
};

var userJson = [owningUser, creatingUser, inviteeUser, viewingUser, editingUser, noAccessUser];
var acl = null;
var parentMeetingAreaId;


describe('controller/api/meetings', function () {

    before(function (done) {
        User = db.readWriteConnection.model('User');
        Meeting = db.readWriteConnection.model('Meeting');
        UserAllowedResources = db.readWriteConnection.model('UserAllowedResources');
        Acl.init().then(function (aclIns) {
            acl = aclIns;
        }).then(function () {
            return UserAllowedResources.remove().exec();
        }).then(function () {
            return Meeting.remove().exec();
        }).then(function () {
            return User.remove().exec();
        }).then(function () {
            var userObjs = [];
            userJson.forEach(function (u) {
                userObjs.push(new User(u));
            });
            var createNewUsers = [];
            userObjs.forEach(function (uObj) {
                createNewUsers.push(usersHandler.createNewSignedUpUser(uObj));
            });
            return Q.all(createNewUsers);
        }).then(function (createdUsers) {
            parentMeetingAreaId = createdUsers[0].rootTenantMeetingArea;
            var newUserList = [];
            createdUsers.forEach(function (newU) {
                newUserList.push(global.getUserWithTentantIdByUserId(newU._id));
            });
            return Q.all(newUserList);
        }).then(function (newUserWithTenantIds) {
            var loginPromises = [];
            for (var i = 0; i < newUserWithTenantIds.length; i++) {
                userJson[i].userModel = newUserWithTenantIds[i];
                loginPromises.push(global.loginToServer(request, userJson[i].email, userJson[i].password));
            }
            return Q.all(loginPromises);
        }).then(function (tokens) {
            for (var i = 0; i < tokens.length; i++) {
                userJson[i].accessToken = tokens[i];
            }
            done();
        }).catch(function (err) {
            return done(err);
        }).done();
    });

    describe('POST meeting creation', function () {
        it('should get back a saved meeting when providing the minimal data', function (done) {
            request
                .post('/api/meetings')
                .send({
                    parentMeetingAreaId: parentMeetingAreaId,
                    name: "My First Meeting",
                    objective: "Create more meetings!",
                    type: 'Presentation',
                    format: 'Screencast',
                    endDate: new Date()
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + owningUser.accessToken)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var result = JSON.parse(res.text);
                    expect(result.data._id).to.not.be.null;
                    Meeting.find({_id: result.data._id}, function (err, meetingAreas) {
                        expect(meetingAreas).to.have.length(1);
                        done();
                    });
                });
        });
        it('should error due to lack of access', function (done) {
            request
                .post('/api/meetings')
                .send({
                    parentMeetingAreaId: parentMeetingAreaId,
                    name: "My First Meeting",
                    objective: "Create more meetings!",
                    type: 'Presentation',
                    format: 'Screencast',
                    endDate: new Date()
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + noAccessUser.accessToken)
                .expect('Content-Type', /json/)
                .expect(401)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var result = JSON.parse(res.text);
                    expect(result.message).to.equal('Not allowed');
                    expect(result.status).to.equal('error');
                    done();
                });
        });
        it('should throw a validation error due to lack of data', function (done) {
            request
                .post('/api/meetings')
                .send({
                    parentMeetingAreaId: parentMeetingAreaId,
                    type: 'Presentation',
                    objective: "Create more meetings!",
                    format: 'Screencast',
                    endDate: new Date()
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + owningUser.accessToken)
                .expect('Content-Type', /json/)
                .expect(400)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var result = JSON.parse(res.text);
                    expect(result.status).to.equal('error');
                    expect(result.message).to.equal('Meeting validation failed:  Path `name` is required.\n');
                    done();
                });
        });
        it('should get back a saved meeting when providing the minimal data with one agenda item', function (done) {
            request
                .post('/api/meetings')
                .send({
                    parentMeetingAreaId: parentMeetingAreaId,
                    name: "My First Meeting",
                    objective: "Create more meetings!",
                    type: 'Presentation',
                    format: 'Screencast',
                    agendaItems: [{
                        name: 'How new meetings created to date',
                        description: 'Show how many new meetings were created from first quarter to now',
                        approvalRequest: false,
                        owner: creatingUser.userModel._id
                    }],
                    endDate: new Date()
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + owningUser.accessToken)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var result = JSON.parse(res.text);
                    expect(result.data._id).to.not.be.null;
                    Meeting.find({_id: result.data._id}, function (err, meetings) {
                        expect(meetings).to.have.length(1);
                        expect(meetings[0].agendaItems.length).to.equal(1);
                        expect(meetings[0].invitees.indexOf(creatingUser.userModel._id)).to.not.equal('-1');
                        done();
                    });
                });
        });
        it('should get back a saved meeting when providing a full data set for a meeting', function (done) {
            request
                .post('/api/meetings')
                .send({
                    parentMeetingAreaId: parentMeetingAreaId,
                    name: "My First Meeting",
                    objective: "Create more meetings!",
                    type: 'Presentation',
                    format: 'Screencast',
                    agendaItems: [{
                        name: 'How many new meetings created to date',
                        description: 'Show how many new meetings were created from first quarter to now',
                        approvalRequest: false,
                        owner: creatingUser.userModel._id
                    }],
                    invitees: [inviteeUser.userModel._id],
                    inviteesOnly: true,
                    reminders: ['1/4', '1/2', '3/4'],
                    endDate: new Date()
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + owningUser.accessToken)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var result = JSON.parse(res.text);
                    expect(result.data._id).to.not.be.null;
                    Meeting.find({_id: result.data._id}, function (err, meetings) {
                        expect(meetings).to.have.length(1);
                        expect(meetings[0].agendaItems.length).to.equal(1);
                        expect(meetings[0].invitees.indexOf(creatingUser.userModel._id)).to.not.equal('-1');
                        done();
                    });
                });
        });
    });
    describe('DELETE meetings', function () {
        it('should get delete success for a minimal data meeting along with removal of resource from ACL', function (done) {
            request
                .post('/api/meetings')
                .send({
                    parentMeetingAreaId: parentMeetingAreaId,
                    name: "My First Meeting",
                    objective: "Create more meetings!",
                    type: 'Presentation',
                    format: 'Screencast',
                    endDate: new Date()
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + owningUser.accessToken)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var result = JSON.parse(res.text);
                    expect(result.data._id).to.not.be.null;
                    Meeting.find({_id: result.data._id}, function (err, meetingAreas) {
                        if (err) {
                            return done(err);
                        }
                        expect(meetingAreas).to.have.length(1);
                        request
                            .delete('/api/meetings/' + result.data._id)
                            .set('Accept', 'application/json')
                            .set('Authorization', 'Bearer ' + owningUser.accessToken)
                            .expect('Content-Type', /json/)
                            .expect(200)
                            .end(function (err, res) {
                                expect(err).to.be.null;
                                var deleteResult = JSON.parse(res.text);
                                expect(deleteResult.status).to.equal('success');
                                expect(deleteResult.message).to.be.empty;
                                Meeting.find({_id: result.data._id}, function (err, meetingAreas) {
                                    if (err) {
                                        return done(err);
                                    }
                                    expect(meetingAreas).to.have.length(0);
                                    expect(acl.isAllowed(owningUser.username, '/api/meetings/' + result.data._id, '*', function (err, allowed) {
                                        if (err) {
                                            return done(err);
                                        }
                                        expect(allowed).to.equal(false);
                                        done();
                                    }))
                                });
                            })
                    });
                });
        });
    });
    describe('GET meetings by query', function () {
        it.skip('should get a list of meetings', function (done) {
            request
                .get('/api/meetings?parentMeetingAreaId=null')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + owningUser.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var getResults = JSON.parse(res.text);
                    expect(getResults.status).to.equal('success');
                    expect(getResults.data.length).to.equal(1);
                    done();
                });

        });
    });
    describe('PUT meeting for update', function () {
        it('should get back an updated meeting', function (done) {
            request
                .post('/api/meetings')
                .send({
                    parentMeetingAreaId: parentMeetingAreaId,
                    name: "My First Meeting",
                    objective: "Create more meetings!",
                    type: 'Presentation',
                    format: 'Screencast',
                    endDate: new Date()
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + owningUser.accessToken)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var result = JSON.parse(res.text);
                    expect(result.data._id).to.not.be.null;
                    Meeting.find({_id: result.data._id}, function (err, meetingAreas) {
                        expect(meetingAreas).to.have.length(1);
                        request
                            .put('/api/meetings/' + result.data._id)
                            .send({
                                name: "My First Update Meeting",
                                objective: "Create more Update meetings!"
                            })
                            .set('Accept', 'application/json')
                            .set('Authorization', 'Bearer ' + owningUser.accessToken)
                            .expect('Content-Type', /json/)
                            .expect(200)
                            .end(function (err, res) {
                                expect(err).to.be.null;
                                var updateResult = JSON.parse(res.text);
                                expect(updateResult.data._id).to.not.be.null;
                                Meeting.find({_id: updateResult.data._id}, function (err, meetingAreas) {
                                    expect(meetingAreas).to.have.length(1);
                                    expect(meetingAreas[0].name).to.equal('My First Update Meeting');
                                    expect(meetingAreas[0].objective).to.equal('Create more Update meetings!');
                                    done();
                                });
                            });
                    });
                });
        });
        it('should get an error updating meeting with injection attack', function (done) {
            request
                .put('/api/meetings/111111111111111111111111;var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .send({
                    name: "My First Update Meeting",
                    objective: "Create more Update meetings!"
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + owningUser.accessToken)
                .expect('Content-Type', /json/)
                .expect(401)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var updateResult = JSON.parse(res.text);
                    expect(updateResult.status).to.equal('error');
                    expect(updateResult.message).to.equal('Not allowed');
                    done();
                });
        });
        it('should get an error updating meeting for an unavailable resource', function (done) {
            request
                .put('/api/meetings/111111111111111111111111')
                .send({
                    name: "My First Update Meeting",
                    objective: "Create more Update meetings!"
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + owningUser.accessToken)
                .expect('Content-Type', /json/)
                .expect(401)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var updateResult = JSON.parse(res.text);
                    expect(updateResult.status).to.equal('error');
                    expect(updateResult.message).to.equal('Not allowed');
                    done();
                });
        });
        it('should get back an updated meeting without changing the parent, format, or type', function (done) {
            request
                .post('/api/meetings')
                .send({
                    parentMeetingAreaId: parentMeetingAreaId,
                    name: "My First Meeting",
                    objective: "Create more meetings!",
                    type: 'Presentation',
                    format: 'Screencast',
                    endDate: new Date()
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + owningUser.accessToken)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var result = JSON.parse(res.text);
                    expect(result.data._id).to.not.be.null;
                    Meeting.find({_id: result.data._id}, function (err, meetingAreas) {
                        expect(meetingAreas).to.have.length(1);
                        request
                            .put('/api/meetings/' + result.data._id)
                            .send({
                                name: "My First Update Meeting",
                                objective: "Create more Update meetings!",
                                parentMeetingAreaId: '111111111111111111111111',
                                type: 'Invalid',
                                format: 'Invalid'
                            })
                            .set('Accept', 'application/json')
                            .set('Authorization', 'Bearer ' + owningUser.accessToken)
                            .expect('Content-Type', /json/)
                            .expect(200)
                            .end(function (err, res) {
                                expect(err).to.be.null;
                                var updateResult = JSON.parse(res.text);
                                expect(updateResult.data._id).to.not.be.null;
                                Meeting.find({_id: updateResult.data._id}, function (err, meetingAreas) {
                                    expect(meetingAreas).to.have.length(1);
                                    expect(meetingAreas[0].name).to.equal('My First Update Meeting');
                                    expect(meetingAreas[0].objective).to.equal('Create more Update meetings!');
                                    expect(meetingAreas[0].type).to.equal('Presentation');
                                    expect(meetingAreas[0].format).to.equal('Screencast');
                                    expect(meetingAreas[0].parentMeetingAreaId.toString()).to.equal(parentMeetingAreaId.toString());
                                    done();
                                });
                            });
                    });
                });
        });
    });
});