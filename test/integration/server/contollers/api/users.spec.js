var Acl = require('../../../../../server/security/acl'),
    expect = require('chai').expect,
    request = require('supertest'),
    User = require('../../../../../server/models/user'),
    secUtil = require('../../../../../server/security/securityUtils'),
    bcrypt = require('bcrypt-nodejs'),
    db = require('../../../../../server/db');

var userUuid1 = "",
    accessToken1;
var email1 = 'tom@tom.com';
var pass1 = 'password123';
var username1 = 'tom';
var user1 = request('http://localhost:3001');
var acl = null;

var userUuid2 = "",
    accessToken2;
var email2 = 'kelly@kelly.com';
var pass2 = 'password1234';
var username2 = 'kelly';
var user2 = request('http://localhost:3001');

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
            var userObj1 = new User({username: username1, email: email1, password: pass1});
            userObj1.password = bcrypt.hashSync(pass1, bcrypt.genSaltSync(10), null);
            var userObj2 = new User({username: username2, email: email2, password: pass2});
            userObj2.password = bcrypt.hashSync(pass2, bcrypt.genSaltSync(10), null);
            userObj1.save(function (err, userObj) {
                if (err) {
                    return next(err)
                }
                userUuid1 = userObj.uuid;
                acl.allow('users-creator', '/api/users', 'post');
                acl.addUserRoles(userObj1.username, 'users-creator');
                acl.allow('users-editor-' + userObj.uuid, '/api/users/' + userObj.uuid, 'put');
                acl.addUserRoles(userObj1.username, 'users-editor-' + userObj.uuid);
                acl.allow('users-editor-' + userObj.uuid, '/api/users/' + userObj.uuid, 'delete');
                acl.addUserRoles(userObj1.username, 'users-editor-' + userObj.uuid);
                acl.allow('users-viewer-' + userObj.uuid, '/api/users/' + userObj.uuid, 'get');
                acl.addUserRoles(userObj1.username, 'users-viewer-' + userObj.uuid);
                userObj2.save(function (err, userObj) {
                    if (err) {
                        return next(err)
                    }
                    userUuid2 = userObj.uuid;
                    secUtil.clearAllAccessTokens().then(function () {


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
            })
        });
    });

    describe('GET \'/\'', function () {
        it('should return a user', function (done) {
            user1
                .get('/api/users/' + userUuid1)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.uuid).to.equal(userUuid1);
                })
                .end(done);
        });
        it('should return a 403 error and associated JSON', function (done) {
            user2
                .get('/api/users/' + userUuid2)
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
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result.uuid).to.not.be.null;
                    User.find({uuid: userUuid1}, function (err, user) {
                        expect(user).to.have.length(1);
                        done();
                    });
                });
        });
        it('should return a 403 error and associated JSON', function (done) {
            user2
                .post('/api/users')
                .send({
                    username: 'Craig',
                    password: "password1235",
                    email: "craig@craig.com",
                    firstName: 'Craig',
                    lastName: 'Thomas'
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
        it('should remove a user', function (done) {
            user1
                .delete('/api/users/' + userUuid1)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect(200)
                .end(function (err, res) {
                    User.find({uuid: userUuid1}, function (err, user) {
                        expect(user).to.be.empty;
                        done();
                    });
                });
        });
        it('should return a 403 error and associated JSON', function (done) {
            user2
                .delete('/api/users/' + userUuid2)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken2)
                .expect(200)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result.msg).to.equal('Insufficient permissions to access resource');
                    expect(result.status).to.equal(403);
                    done();
                });
        });
    });
})
;
