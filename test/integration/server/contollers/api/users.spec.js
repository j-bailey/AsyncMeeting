var Acl = require('../../../../../server/security/acl'),
    expect = require('chai').expect,
    request = require('supertest'),
    User,
    usersHandler = require('../../../../../server/controllers/api/handlers/usersHandler'),
    db = require('../../../../../server/db');

// Load the models, so they get tied to the DB connections
require('../../../../../server/models/user');

var userId1 = "",
    accessToken1;
var email1 = 'tom@tom.com';
var pass1 = 'pword123';
var username1 = 'tom';
var user1 = request('http://localhost:3001');
var acl = null;

var userId2 = "",
    accessToken2;
var email2 = 'kelly@kelly.com';
var pass2 = 'pword1234';
var username2 = 'kelly';
var user2 = request('http://localhost:3001');

var userId3 = ""; // to be deleted
var email3 = 'berry@berry.com';
var pass3 = 'pword1234';
var username3 = 'berry';

var userId4 = ""; // to be deleted
var email4 = 'doug@doug.com';
var pass4 = 'pword1234';
var username4 = 'doug';

describe('controller/api/users', function () {
    before(function (done) {
        Acl.init().then(function (aclIns) {
            acl = aclIns;
            User = db.adminConnection.model('User');
            User.remove().exec();
            //if (err) next(err);
            var userObj1 = new User({username: username1, email: email1, password: pass1});
            userObj1.password = pass1;
            var userObj2 = new User({username: username2, email: email2, password: pass2});
            userObj2.password = pass2;
            var userObj3 = new User({username: username3, email: email3, password: pass3});
            userObj3.password = pass3;
            var userObj4 = new User({username: username4, email: email4, password: pass4});
            userObj4.password = pass4;
            usersHandler.createNewSignedUpUser(userObj1).then(function (userObj) {
                userId1 = userObj._id;
                acl.allow('users-creator', '/api/users', 'post');
                acl.addUserRoles(userObj1.username, 'users-creator');
                acl.allow('users-editor-' + userObj._id, '/api/users/' + userObj._id, 'put');
                acl.addUserRoles(userObj1.username, 'users-editor-' + userObj._id);
                acl.allow('users-editor-' + userObj._id, '/api/users/' + userObj._id, 'delete');
                acl.addUserRoles(userObj1.username, 'users-editor-' + userObj._id);
                acl.allow('users-viewer-' + userObj._id, '/api/users/' + userObj._id, 'get');
                acl.addUserRoles(userObj1.username, 'users-viewer-' + userObj._id);
                usersHandler.createNewSignedUpUser(userObj2).then(function (userObj) {
                    userId2 = userObj._id;
                    usersHandler.createNewSignedUpUser(userObj3).then(function (userObj) {
                        userId3 = userObj._id;
                        acl.allow('users-editor-' + userObj._id, '/api/users/' + userObj._id, 'put');
                        acl.addUserRoles(userObj1.username, 'users-editor-' + userObj._id);
                        usersHandler.createNewSignedUpUser(userObj4).then(function (userObj) {
                            userId4 = userObj._id;
                            acl.allow('users-editor-' + userObj._id, '/api/users/' + userObj._id, 'delete');
                            acl.addUserRoles(userObj1.username, 'users-editor-' + userObj._id);

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
                }).catch(function (err) {
                    done(err);
                });
            }).catch(function (err) {
                done(err);
            })
        });
    });

    describe('GET inValidUsername', function () {
        it('should return false for a valid username', function (done) {
            user1
                .get('/api/users/invalidUsername/' + 'HelloHello')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.result).to.equal(false);
                })
                .end(done);
        });
        it('should return false for a valid username with a .', function (done) {
            user1
                .get('/api/users/invalidUsername/' + 'Jay.Smith')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.result).to.equal(false);
                })
                .end(done);
        });
        it('should return false for a valid username with a digit', function (done) {
            user1
                .get('/api/users/invalidUsername/' + 'Jay.Smith1')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.result).to.equal(false);
                })
                .end(done);
        });
        it('should return false for a valid username with a special character', function (done) {
            user1
                .get('/api/users/invalidUsername/' + 'Jay.Smith1@')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.result).to.equal(false);
                })
                .end(done);
        });

        it('should return error message for ::: characters in the beginning', function (done) {
            user1
                .get('/api/users/invalidUsername/' + ':::HelloHello')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.result).to.equal('Cannot contain \":::\" at the beginning or end of the username, must 3-20 character long, can contain alphanumeric characters and the following: . @ # $ %');
                })
                .end(done);
        });
        it('should return error message for ::: characters at the end', function (done) {
            user1
                .get('/api/users/invalidUsername/' + 'HelloHello:::')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.result).to.equal('Cannot contain \":::\" at the beginning or end of the username, must 3-20 character long, can contain alphanumeric characters and the following: . @ # $ %');
                })
                .end(done);
        });
        it('should return error message for ::: characters at the end and beginning', function (done) {
            user1
                .get('/api/users/invalidUsername/' + 'HelloHello:::')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.result).to.equal('Cannot contain \":::\" at the beginning or end of the username, must 3-20 character long, can contain alphanumeric characters and the following: . @ # $ %');
                })
                .end(done);
        });
        it('should return error message for not enough characters', function (done) {
            user1
                .get('/api/users/invalidUsername/' + 'He')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.result).to.equal('Cannot contain \":::\" at the beginning or end of the username, must 3-20 character long, can contain alphanumeric characters and the following: . @ # $ %');
                })
                .end(done);
        });
        it('should return error message for too many characters', function (done) {
            user1
                .get('/api/users/invalidUsername/' + 'A12345678901234567890')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.result).to.equal('Cannot contain \":::\" at the beginning or end of the username, must 3-20 character long, can contain alphanumeric characters and the following: . @ # $ %');
                })
                .end(done);
        });
    });
    describe('GET inValidPassowrd', function () {
        it('should return false for a valid password', function (done) {
            user1
                .get('/api/users/invalidPassword/' + 'Hello12@')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.result).to.equal(false);
                })
                .end(done);
        });
        it('should return error message for one character too short password', function (done) {
            user1
                .get('/api/users/invalidPassword/' + 'Hell12@')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.result).to.equal('Password must be between 8-20 in length. Must contain one digit, one lowercase, one uppercase character and one special character (@#$%).');
                })
                .end(done);
        });
        it('should return error message for one character too long password', function (done) {
            user1
                .get('/api/users/invalidPassword/' + 'Aa@123456789012345678')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.result).to.equal('Password must be between 8-20 in length. Must contain one digit, one lowercase, one uppercase character and one special character (@#$%).');
                })
                .end(done);
        });
        it('should return error message for password containing username', function (done) {
            user1
                .get('/api/users/invalidPassword/' + 'Aa@12345678901234tom')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.result).to.equal('Password must not contain the username');
                })
                .end(done);
        });
        it('should return error message for password containing passed in username', function (done) {
            user1
                .get('/api/users/invalidPassword/' + 'Aa@bobby' + '?username=bobby')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.result).to.equal('Password must not contain the username');
                })
                .end(done);
        });
        it('should return error message for password being in the bad password list', function (done) {
            user1
                .get('/api/users/invalidPassword/' + '123456789')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.result).to.equal('Do not use a common password like: 123456789');
                })
                .end(done);
        });
    });
    describe('GET \'/\' by path', function () {
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
                .delete('/api/users/' + userId4)
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
                .delete('/api/users/' + userId4)
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
                .delete('/api/users/' + userId4 + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + accessToken1)
                .expect(403)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(res.error.message).to.equal('cannot DELETE /api/users/' + userId4 + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date%3C10000 (403)');
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
        it('should return a 409 on due to user missing', function (done) {
            User.remove({_id: userId3}).exec(function (err, item) {
                user1
                    .put('/api/users/' + userId3)
                    .send({
                        firstName: 'Berry2',
                        lastName: 'Apple2'
                    })
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + accessToken1)
                    .expect(409)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        var result = JSON.parse(res.text);
                        expect(result.firstName).to.be.empty;
                        expect(result.lastName).to.be.empty;
                        expect(result.password).to.be.empty;
                        User.find({_id: userId3}, function (err, user) {
                            expect(user).to.be.empty;
                            done();
                        });
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
