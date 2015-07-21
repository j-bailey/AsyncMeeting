var Acl = require('../../../../../server/security/acl'),
    expect = require('chai').expect,
    request = require('supertest'),
    User = require('../../../../../server/models/user'),
    secUtil = require('../../../../../server/security/securityUtils'),
    bcrypt = require('bcrypt-nodejs'),
    db = require('../../../../../server/db');

var userId1 = "",
    accessToken1;
var email1 = 'tom@tom.com';
var pass1 = 'password123';
var username1 = 'tom';
var user1 = request('http://localhost:3001');
var acl = null;

var userId2 = "",
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
        db.adminConnection.db.dropCollection('users', function (err, result) {
            //if (err) next(err);
            var userObj1 = new User({username: username1, email: email1, password: pass1});
            userObj1.password = bcrypt.hashSync(pass1, bcrypt.genSaltSync(10), null);
            var userObj2 = new User({username: username2, email: email2, password: pass2});
            userObj2.password = bcrypt.hashSync(pass2, bcrypt.genSaltSync(10), null);
            userObj1.save(function (err, userObj) {
                if (err) {
                    return next(err)
                }
                userId1 = userObj._id;
                acl.allow('users-creator', '/api/users', 'post');
                acl.addUserRoles(userObj1.username, 'users-creator');
                acl.allow('users-editor-' + userObj.id, '/api/users/' + userObj.id, 'put');
                acl.addUserRoles(userObj1.username, 'users-editor-' + userObj.id);
                acl.allow('users-editor-' + userObj.id, '/api/users/' + userObj.id, 'delete');
                acl.addUserRoles(userObj1.username, 'users-editor-' + userObj.id);
                acl.allow('users-viewer-' + userObj.id, '/api/users/' + userObj.id, 'get');
                acl.addUserRoles(userObj1.username, 'users-viewer-' + userObj.id);
                userObj2.save(function (err, userObj) {
                    if (err) {
                        return next(err)
                    }
                    userId2 = userObj._id;


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
            })
        });
    });

    describe('GET \'/\'', function () {
        it('should return a user', function (done) {
            user1
                .get('/api/users/' + userId1)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result._id).to.equal(userId1.toString());
                    expect(result.password).to.be.empty;
                })
                .end(done);
        });
        it('should return a 403 error and associated JSON', function (done) {
            user2
                .get('/api/users/' + userId2)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken2)
                .expect('Content-Type', /json/)
                .expect(403)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result.msg).to.equal('Insufficient permissions to access resource');
                    expect(result.status).to.equal(403);
                    expect(result.password).to.be.empty;
                    done();
                });
        });
        it('should return a user after a query injection attack', function (done) {
            user1
                .get('/api/users/' + userId1 + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(403)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(res.error.message).to.equal('cannot GET /api/users/' + userId1 + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date%3C10000 (403)');
                    expect(result.msg).to.equal('Insufficient permissions to access resource');
                    expect(result.password).to.be.empty;
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
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result._id).to.not.be.null;
                    expect(result.password).to.be.empty;
                    User.find({_id: userId1}, function (err, user) {
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
                    expect(result.password).to.be.empty;
                    done();
                });
        });
    });

    describe('DELETE \'/\'', function () {
        it('should remove a user', function (done) {
            user1
                .delete('/api/users/' + userId1)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.equal(200);
                    User.find({id: userId1}, function (err, user) {
                        expect(user).to.be.empty;
                        done();
                    });
                });
        });
        it('should return a 403 error and associated JSON', function (done) {
            user2
                .delete('/api/users/' + userId2)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken2)
                .expect(200)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result.msg).to.equal('Insufficient permissions to access resource');
                    expect(result.status).to.equal(403);
                    expect(result.password).to.be.empty;
                    done();
                });
        });
        it('should fail during query injection attack', function (done) {
            user1
                .delete('/api/users/' + userId1 + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect(403)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(res.error.message).to.equal('cannot DELETE /api/users/' + userId1 + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date%3C10000 (403)');
                    expect(result.msg).to.equal('Insufficient permissions to access resource');
                    expect(result.password).to.be.empty;
                })
                .end(done);
        });
    });
    describe('PUT \'/\'', function () {
        it('should update a user', function (done) {
            user1
                .put('/api/users/' + userId1)
                .send({
                    firstName: 'Kelly2',
                    lastName: 'Thomas2'
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var result = JSON.parse(res.text);
                    expect(result.firstName).to.equal('Kelly2');
                    expect(result.lastName).to.equal('Thomas2');
                    expect(result.password).to.be.empty;
                    User.find({_id: userId1}, function (err, user) {
                        expect(user).to.not.be.empty;
                        expect(user[0].firstName).to.equal('Kelly2');
                        expect(user[0].lastName).to.equal('Thomas2');
                        done();
                    });
                });
        });
        it('should return a 403 error and associated JSON', function (done) {
            user2
                .put('/api/users/' + userId2)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken2)
                .expect(200)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result.msg).to.equal('Insufficient permissions to access resource');
                    expect(result.status).to.equal(403);
                    expect(result.password).to.be.empty;
                    done();
                });
        });
        it('should fail during query injection attack', function (done) {
            user1
                .put('/api/users/' + userId1 + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect(403)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(res.error.message).to.equal('cannot PUT /api/users/' + userId1 + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date%3C10000 (403)');
                    expect(result.msg).to.equal('Insufficient permissions to access resource');
                    expect(result.password).to.be.empty;
                })
                .end(done);
        });
    });
});
