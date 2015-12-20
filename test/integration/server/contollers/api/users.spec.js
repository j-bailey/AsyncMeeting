var Acl = require('../../../../../server/security/acl'),
    expect = require('chai').expect,
    request = require('supertest'),
    User,
    usersHandler = require('../../../../../server/controllers/api/handlers/usersHandler'),
    db = require('../../../../../server/db');

// Load the models, so they get tied to the DB connections
require('../../../../../server/models/user');

var acl = null;

var user1 = {
    id: "",
    accessToken: "",
    email: 'tom@tom.com',
    password:'pword123',
    username: 'tom',
    lastName: 'Smith',
    firstName: 'Tom',
    request: request(process.env.baseUrl)
    };

var user2 = {
    id: "",
    accessToken: "",
    email: 'kelly@kelly.com',
    password: 'pword1234',
    username: 'kelly',
    lastName: 'Smith',
    firstName: 'Kelly',
    request: request(process.env.baseUrl)
};

var user3 = {
    id: "",
    email: 'berry@berry.com',
    password: 'pword1234',
    username: 'berry',
    lastName: 'Wade',
    firstName: 'Berry'
};

var user4 = {
    id: "", // to be deleted
    email: 'doug@doug.com',
    password: 'pword1234',
    username: 'doug',
    lastName: 'Long',
    firstName: 'Doug'
};


describe('controller/api/users', function () {
    before(function (done) {
        Acl.init().then(function (aclIns) {
            acl = aclIns;
            User = db.adminConnection.model('User');
            User.remove().exec();
            //if (err) next(err);
            var userObj1 = new User(user1);
            var userObj2 = new User(user2);
            var userObj3 = new User(user3);
            var userObj4 = new User(user4);
            usersHandler.createNewSignedUpUser(userObj1).then(function (userObj) {
                user1.id = userObj._id;
                acl.allow('users-creator', '/api/users', 'post');
                acl.addUserRoles(userObj1.username, 'users-creator');
                acl.allow('users-editor-' + userObj._id, '/api/users/' + userObj._id, 'put');
                acl.addUserRoles(userObj1.username, 'users-editor-' + userObj._id);
                acl.allow('users-editor-' + userObj._id, '/api/users/' + userObj._id, 'delete');
                acl.addUserRoles(userObj1.username, 'users-editor-' + userObj._id);
                acl.allow('users-viewer-' + userObj._id, '/api/users/' + userObj._id, 'get');
                acl.addUserRoles(userObj1.username, 'users-viewer-' + userObj._id);
                usersHandler.createNewSignedUpUser(userObj2).then(function (userObj) {
                    user2.id = userObj._id;
                    usersHandler.createNewSignedUpUser(userObj3).then(function (userObj) {
                        user3.id = userObj._id;
                        acl.allow('users-editor-' + userObj._id, '/api/users/' + userObj._id, 'put');
                        acl.addUserRoles(userObj1.username, 'users-editor-' + userObj._id);
                        usersHandler.createNewSignedUpUser(userObj4).then(function (userObj) {
                            user4.id = userObj._id;
                            acl.allow('users-editor-' + userObj._id, '/api/users/' + userObj._id, 'delete');
                            acl.addUserRoles(userObj1.username, 'users-editor-' + userObj._id);

                            user1.request
                                .post('/email-login')
                                .set('Accept', 'application/json, text/plain, */*')
                                .set('Accept-encoding', 'gzip, deflate')
                                .set('Content-type', 'application/json;charset=UTF-8')
                                .send({email: user1.email, password: user1.password})
                                .end(function (err, res) {
                                    // user1 will manage its own cookies
                                    // res.redirects contains an Array of redirects
                                    if (err) done(err);

                                    user1.accessToken = res.body.access_token;
                                    user2.request
                                        .post('/email-login')
                                        .set('Accept', 'application/json, text/plain, */*')
                                        .set('Accept-encoding', 'gzip, deflate')
                                        .set('Content-type', 'application/json;charset=UTF-8')
                                        .send({email: user2.email, password: user2.password})
                                        .end(function (err, res) {
                                            // user1 will manage its own cookies
                                            // res.redirects contains an Array of redirects
                                            if (err) done(err);

                                            user2.accessToken = res.body.access_token;

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
            user1.request
                .get('/api/users/invalidUsername/' + 'HelloHello')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data.result).to.equal(false);
                })
                .end(done);
        });
        it('should return false for a valid username with a .', function (done) {
            user1.request
                .get('/api/users/invalidUsername/' + 'Jay.Smith')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data.result).to.equal(false);
                })
                .end(done);
        });
        it('should return false for a valid username with a digit', function (done) {
            user1.request
                .get('/api/users/invalidUsername/' + 'Jay.Smith1')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data.result).to.equal(false);
                })
                .end(done);
        });
        it('should return false for a valid username with a special character', function (done) {
            user1.request
                .get('/api/users/invalidUsername/' + 'Jay.Smith1@')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data.result).to.equal(false);
                })
                .end(done);
        });

        it('should return error message for ::: characters in the beginning', function (done) {
            user1.request
                .get('/api/users/invalidUsername/' + ':::HelloHello')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data.result).to.equal('Cannot contain \":::\" at the beginning or end of the username, must 3-20 character long, can contain alphanumeric characters and the following: . @ # $ %');
                })
                .end(done);
        });
        it('should return error message for ::: characters at the end', function (done) {
            user1.request
                .get('/api/users/invalidUsername/' + 'HelloHello:::')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data.result).to.equal('Cannot contain \":::\" at the beginning or end of the username, must 3-20 character long, can contain alphanumeric characters and the following: . @ # $ %');
                })
                .end(done);
        });
        it('should return error message for ::: characters at the end and beginning', function (done) {
            user1.request                .get('/api/users/invalidUsername/' + 'HelloHello:::')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data.result).to.equal('Cannot contain \":::\" at the beginning or end of the username, must 3-20 character long, can contain alphanumeric characters and the following: . @ # $ %');
                })
                .end(done);
        });
        it('should return error message for not enough characters', function (done) {
            user1.request
                .get('/api/users/invalidUsername/' + 'He')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data.result).to.equal('Cannot contain \":::\" at the beginning or end of the username, must 3-20 character long, can contain alphanumeric characters and the following: . @ # $ %');
                })
                .end(done);
        });
        it('should return error message for too many characters', function (done) {
            user1.request
                .get('/api/users/invalidUsername/' + 'A12345678901234567890')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data.result).to.equal('Cannot contain \":::\" at the beginning or end of the username, must 3-20 character long, can contain alphanumeric characters and the following: . @ # $ %');
                })
                .end(done);
        });
    });
    describe('GET inValidPassowrd', function () {
        it('should return false for a valid password', function (done) {
            user1.request
                .get('/api/users/invalidPassword/' + 'Hello12@')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data.result).to.equal(false);
                })
                .end(done);
        });
        it('should return error message for one character too short password', function (done) {
            user1.request
                .get('/api/users/invalidPassword/' + 'Hell12@')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data.result).to.equal('Password must be between 8-20 in length. Must contain one digit, one lowercase, one uppercase character and one special character (@#$%).');
                })
                .end(done);
        });
        it('should return error message for one character too long password', function (done) {
            user1.request
                .get('/api/users/invalidPassword/' + 'Aa@123456789012345678')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data.result).to.equal('Password must be between 8-20 in length. Must contain one digit, one lowercase, one uppercase character and one special character (@#$%).');
                })
                .end(done);
        });
        it('should return error message for password containing username', function (done) {
            user1.request
                .get('/api/users/invalidPassword/' + 'Aa@12345678901234tom')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data.result).to.equal('Password must not contain the username');
                })
                .end(done);
        });
        it('should return error message for password containing passed in username', function (done) {
            user1.request
                .get('/api/users/invalidPassword/' + 'Aa@bobby' + '?username=bobby')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data.result).to.equal('Password must not contain the username');
                })
                .end(done);
        });
        it('should return error message for password being in the bad password list', function (done) {
            user1.request
                .get('/api/users/invalidPassword/' + '123456789')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data.result).to.equal('Do not use a common password like: 123456789');
                })
                .end(done);
        });
    });
    describe('GET \'/\' by path', function () {
        it('should return a user', function (done) {
            user1.request
                .get('/api/users/' + user1.id)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.data._id).to.equal(user1.id.toString());
                    expect(result.data.password).to.be.empty;
                })
                .end(done);
        });
        it('should return a 403 error and associated JSON', function (done) {
            user2.request
                .get('/api/users/' + user2.id)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user2.accessToken)
                .expect('Content-Type', /json/)
                .expect(403)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result.message).to.equal('Insufficient permissions to access resource');
                    expect(result.status).to.equal('error');
                    expect(result.data).to.be.empty;
                    done();
                });
        });
        it('should return a user after a query injection attack', function (done) {
            user1.request
                .get('/api/users/' + user1.id + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(403)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(res.error.message).to.equal('cannot GET /api/users/' + user1.id + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date%3C10000 (403)');
                    expect(result.message).to.equal('Insufficient permissions to access resource');
                    expect(result.status).to.equal('error');
                    expect(result.data).to.be.empty;
                })
                .end(done);
        });
    });

    describe('GET by query', function() {
        it('should return a list of users based on search criteria on case correct last name', function(done){
            user1.request
                .get('/api/users/?searchCriteria=Smith')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.status).to.equal('success');
                    expect(result.data.length).to.equal(2);
                })
                .end(done);
        });
        it('should return a list of users based on search criteria on case correct last name, limit to one', function(done){
            user1.request
                .get('/api/users/?searchCriteria=Smith&limit=1')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.status).to.equal('success');
                    expect(result.data.length).to.equal(1);
                })
                .end(done);
        });
        it('should return a list of users based on search criteria on case correct last name skip 1', function(done){
            user1.request
                .get('/api/users/?searchCriteria=Smith&skip=1')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.status).to.equal('success');
                    expect(result.data.length).to.equal(1);
                })
                .end(done);
        });
        it('should return a list of users based on search criteria on case correct last name, skip one and limit 1', function(done){
            user1.request
                .get('/api/users/?searchCriteria=Smith&limit=1&skip=1')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.status).to.equal('success');
                    expect(result.data.length).to.equal(1);
                })
                .end(done);
        });

        it('should return a list of users based on search criteria for lower case last name', function(done){
            user1.request
                .get('/api/users/?searchCriteria=smith')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.status).to.equal('success');
                    expect(result.data.length).to.equal(2);
                })
                .end(done);
        });
        it('should return a list of users based on search criteria for middle of last name', function(done){
            user1.request
                .get('/api/users/?searchCriteria=mit')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.status).to.equal('success');
                    expect(result.data.length).to.equal(2);
                })
                .end(done);
        });
        it('should return a list of users based on search criteria for lower case first name', function(done){
            user1.request
                .get('/api/users/?searchCriteria=tom')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(200)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(result.status).to.equal('success');
                    expect(result.data.length).to.equal(1);
                })
                .end(done);
        });

    });

    describe('POST \'/\'', function () {
        it('should create a user', function (done) {
            user1.request
                .post('/api/users')
                .send({
                    username: 'Kelly',
                    password: "password123",
                    email: "kelly@kelly.com",
                    firstName: 'Kelly',
                    lastName: 'Thomas'
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result.data._id).to.not.be.null;
                    expect(result.data.password).to.be.empty;
                    User.find({_id: user1.id}, function (err, user) {
                        expect(user).to.have.length(1);
                        done();
                    });
                });
        });
        it('should return a 403 error and associated JSON', function (done) {
            user2.request
                .post('/api/users')
                .send({
                    username: 'Craig',
                    password: "password1235",
                    email: "craig@craig.com",
                    firstName: 'Craig',
                    lastName: 'Thomas'
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user2.accessToken)
                .expect('Content-Type', /json/)
                .expect(403)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result.message).to.equal('Insufficient permissions to access resource');
                    expect(result.status).to.equal('error');
                    expect(result.data).to.be.empty;
                    done();
                });
        });
    });

    describe('DELETE \'/\'', function () {
        it('should remove a user', function (done) {
            user1.request
                .delete('/api/users/' + user4.id)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res.status).to.equal(200);
                    User.find({id: user1.id}, function (err, user) {
                        expect(user).to.be.empty;
                        done();
                    });
                });
        });
        it('should return a 403 error and associated JSON', function (done) {
            user2.request
                .delete('/api/users/' + user4.id)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user2.accessToken)
                .expect(200)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result.message).to.equal('Insufficient permissions to access resource');
                    expect(result.status).to.equal('error');
                    expect(result.data).to.be.empty;
                    done();
                });
        });
        it('should fail during query injection attack', function (done) {
            user1.request
                .delete('/api/users/' + user4.id + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect(403)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(res.error.message).to.equal('cannot DELETE /api/users/' + user4.id + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date%3C10000 (403)');
                    expect(result.message).to.equal('Insufficient permissions to access resource');
                    expect(result.data).to.be.empty;
                })
                .end(done);
        });
    });
    describe('PUT \'/\'', function () {
        it('should update a user', function (done) {
            user1.request
                .put('/api/users/' + user1.id)
                .send({
                    firstName: 'Kelly2',
                    lastName: 'Thomas2'
                })
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect(200)
                .end(function (err, res) {
                    expect(err).to.be.null;
                    var result = JSON.parse(res.text);
                    expect(result.data.firstName).to.equal('Kelly2');
                    expect(result.data.lastName).to.equal('Thomas2');
                    expect(result.data.password).to.be.empty;
                    User.find({_id: user1.id}, function (err, user) {
                        expect(user).to.not.be.empty;
                        expect(user[0].firstName).to.equal('Kelly2');
                        expect(user[0].lastName).to.equal('Thomas2');
                        done();
                    });
                });
        });
        it('should return a 409 on due to user missing', function (done) {
            User.remove({_id: user3.id}).exec(function (err, item) {
                user1.request
                    .put('/api/users/' + user3.id)
                    .send({
                        firstName: 'Berry2',
                        lastName: 'Apple2'
                    })
                    .set('Accept', 'application/json')
                    .set('Authorization', 'Bearer ' + user1.accessToken)
                    .expect(409)
                    .end(function (err, res) {
                        expect(err).to.be.null;
                        var result = JSON.parse(res.text);
                        expect(result.data.firstName).to.be.empty;
                        expect(result.data.lastName).to.be.empty;
                        expect(result.data.password).to.be.empty;
                        User.find({_id: user3.id}, function (err, user) {
                            expect(user).to.be.empty;
                            done();
                        });
                    });
            });
        });
        it('should return a 403 error and associated JSON', function (done) {
            user2.request
                .put('/api/users/' + user2.id)
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user2.accessToken)
                .expect(200)
                .end(function (err, res) {
                    var result = JSON.parse(res.text);
                    expect(result.message).to.equal('Insufficient permissions to access resource');
                    expect(result.status).to.equal('error');
                    expect(result.data).to.be.empty;
                    done();
                });
        });
        it('should fail during query injection attack', function (done) {
            user1.request
                .put('/api/users/' + user1.id + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date<10000')
                .set('Accept', 'application/json')
                .set('Authorization', 'Bearer ' + user1.accessToken)
                .expect(403)
                .expect(function (res) {
                    var result = JSON.parse(res.text);
                    expect(res.error.message).to.equal('cannot PUT /api/users/' + user1.id + ';var%20date=new%20Date();%20do%7BcurDate%20=%20new%20Date();%7Dwhile(cur-Date-date%3C10000 (403)');
                    expect(result.message).to.equal('Insufficient permissions to access resource');
                    expect(result.status).to.equal('error');
                    expect(result.data).to.be.empty;
                })
                .end(done);
        });
    });
});
