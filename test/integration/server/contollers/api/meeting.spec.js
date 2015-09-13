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
var parentMeetingAreaId;


describe('controller/api/meetings', function () {

    before(function (done) {
        Acl.init().then(function (aclIns) {
            acl = aclIns;
        }).then(function () {
            User = db.readWriteConnection.model('User');
            Meeting = db.readWriteConnection.model('Meeting');
            UserAllowedResources = db.readWriteConnection.model('UserAllowedResources');

            UserAllowedResources.remove().exec();
            Meeting.remove().exec();
            User.remove().exec();
            //if (err) done(err);
            var user1Obj = new User({username: username1, email: email1, password: pass1});
            var user2Obj = new User({username: username2, email: email2, password: pass2});
            var user3Obj = new User({username: username3, email: email3, password: pass3});
            var userObjs = [user1Obj, user2Obj, user3Obj];
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
            userModel1 = newUserWithTenantIds[0];
            userModel2 = newUserWithTenantIds[1];
            userModel3 = newUserWithTenantIds[2];
            return Q.all([
                global.loginToServer(user1, email1, pass1),
                global.loginToServer(user2, email2, pass2),
                global.loginToServer(user3, email3, pass3)
            ]);
        }).then(function (tokens) {
            accessToken1 = tokens[0];
            accessToken2 = tokens[1];
            accessToken3 = tokens[2];
            done();
        }).catch(function (err) {
            return done(err);
        }).done();
    });

    describe('POST', function () {
        it('should get back a saved meeting when providing the minimal data', function (done) {
            user1
                .post('/api/meetings')
                .send({
                    parentMeetingAreaId: parentMeetingAreaId,
                    name: "My First Meeting",
                    type: {name:'Presentation'},
                    format: {name:'Screencast'},
                    endDate: new Date()
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
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
        it('should throw an error due to lack of data', function (done) {
            user1
                .post('/api/meetings')
                .send({
                    parentMeetingAreaId: parentMeetingAreaId,
                    type: {name:'Presentation'},
                    format: {name:'Screencast'},
                    endDate: new Date()
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
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
    });
})
;