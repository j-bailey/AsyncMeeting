var Acl = require('../../../../../server/security/acl'),
    expect = require('chai').expect,
    request = require('supertest'),
    User = require('../../../../../server/models/user'),
    secUtil = require('../../../../../server/security/securityUtils'),
    bcrypt = require('bcrypt-nodejs'),
    db = require('../../../../../server/db');

var userUuid = "",
    accessToken;
var email = 'tom@tom.com';
var pass = 'password123';
var username = 'tom';
var user1 = request('http://localhost:3001');
var acl = null;

describe('controller/api/users', function () {
    before(function (done) {
        Acl.init().then(function (aclIns) {
            acl = aclIns;
            done();
        });
    });

    beforeEach(function (done) {
        db.connection.db.dropCollection('users', function (err, result) {
            //if (err) next(err);
            var user = new User({username: username, email: email, password: pass});
            user.password = bcrypt.hashSync(pass, bcrypt.genSaltSync(10), null);
            user.save(function (err, userObj) {
                if (err) {
                    return next(err)
                }
                secUtil.clearAllAccessTokens().then(function () {
                    userUuid = userObj.uuid;

                    acl.allow('users-creator', '/api/users', 'post');
                    acl.addUserRoles(user.username, 'users-creator');
                    acl.allow('users-editor-' + userObj.uuid, '/api/users/' + userObj.uuid, 'put');
                    acl.addUserRoles(user.username, 'users-editor-' + userObj.uuid);
                    acl.allow('users-editor-' + userObj.uuid, '/api/users/' + userObj.uuid, 'delete');
                    acl.addUserRoles(user.username, 'users-editor-' + userObj.uuid);
                    acl.allow('users-viewer-' + userObj.uuid, '/api/users/' + userObj.uuid, 'get');
                    acl.addUserRoles(user.username, 'users-viewer-' + userObj.uuid);

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
            })
        });
    });

    describe('GET \'/\'', function () {
        it('should return a user', function (done) {
            user1
                .get('/api/users/' + userUuid)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.uuid).to.equal(userUuid);
                })
                .end(done);
        });
    });

    describe('POST \'/\'', function () {
        it('should create a user', function (done) {
            user1
                .post('/api/users')
                .send({
                    username: 'Kelly',
                    password: "password123",
                    email: "kelly@kelly.com",
                    firstName: 'Kelly',
                    lastName: 'Thomas'
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result.uuid).to.not.be.null;
                    User.find({uuid: userUuid}, function (err, user) {
                        expect(user).to.have.length(1);
                        done();
                    });
                });
        });
    });

    describe('DELETE \'/\'', function () {
        it('should remove a user', function (done) {
            user1
                .delete('/api/users/' + userUuid)
                .set('Authorization', 'Bearer ' + accessToken)
                .expect(200)
                .end(function (err, res) {
                    User.find({uuid: userUuid}, function (err, user) {
                        expect(user).to.be.empty;
                        done();
                    });
                });
        });
    });
})
;
