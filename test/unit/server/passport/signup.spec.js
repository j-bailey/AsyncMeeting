var mongoose = require('mongoose'),
    User = mongoose.model('User')? mongoose.model('User'): mongoose.model('User', require('../../../../server/models/user').schema),
    db = require('../../../../server/db'),
    acl = require('acl'),
    aclSetup = require('../../../../server/security/acl');

describe('signup', function() {
    var sandbox;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('signup', function() {
        it('should save a user', function(done) {
            var email = 'myemail@email.com',
                password = 'password123',
                hashPassword = password;

            var req = {
                body:{
                    username:'slyDog',
                    email: email
                }
            };
            var doneFunc = function(one, two, three) {
                expect(one).to.equal(null);
                expect(two).to.deep.equal(savedUser);
                expect(three).to.equal(undefined);
                done();
            };

            var passport = {
                use:function(name, strategy, three){
                    expect(name).to.equal('signup');
                    expect(three).to.equal(undefined);
                    strategy._verify(req, email, password, doneFunc);
                }
            };

            var savedUser = {
                username: 'slyDog'
            };

            sandbox.stub(require('bcrypt-nodejs'), 'compareSync', function() {return true;});
            sandbox.stub(require('winston'), 'debug');
            sandbox.stub(User, 'hashPassword', function(password){return password});
            var findOneStub = sandbox.stub(db.readOnlyConnection.model('User'), 'findOne');
            findOneStub.onCall(0).yields(null, null);
            findOneStub.onCall(1).yields(null, null);
            var saveStub = sandbox.stub(db.readOnlyConnection.model('User').prototype, 'save');
            saveStub.yields(null, savedUser);
            sandbox.stub(acl.prototype, 'addUserRoles');
            var getAclStub = sandbox.stub(aclSetup, 'getAcl');
            getAclStub.returns({addUserRoles:function(a,b) {
                expect(a).to.equal(savedUser.username);
                expect(b).to.equal(require('../../../../server/security/resources/free-tier-role').object.key);
            }});

            require('../../../../server/passport/signup')(passport);

        });
        it('should log and throw an error when there is an error finding a user by username', function(done) {
            var email = 'myemail@email.com',
                signUpError = new Error('Error running findOne'),
                password = 'password123',
                hashPassword = password;

            var req = {
                body:{
                    username:'slyDog',
                    email: email
                }
            };
            var doneFunc = function(one, two, three) {
                expect(one).to.equal(signUpError);
                expect(two).to.deep.equal(undefined);
                expect(three).to.equal(undefined);
                winstonErrorStub.args[0][0].should.equal('Error in SignUp: ' + signUpError);
                done();
            };

            var passport = {
                use:function(name, strategy, three){
                    expect(name).to.equal('signup');
                    expect(three).to.equal(undefined);
                    strategy._verify(req, email, password, doneFunc);
                }
            };


            sandbox.stub(require('bcrypt-nodejs'), 'compareSync', function() {return true;});
            sandbox.stub(require('winston'), 'debug');
            var winstonErrorStub = sandbox.stub(require('winston'), 'error');
            sandbox.stub(User, 'hashPassword', function(password){return password});
            var findOneStub = sandbox.stub(db.readOnlyConnection.model('User'), 'findOne');
            findOneStub.onCall(0).yields(signUpError, null);

            require('../../../../server/passport/signup')(passport);
        });
        it('should log and throw and error when a user is found by username', function(done) {
            var email = 'myemail@email.com',
                password = 'password123',
                hashPassword = password,
                username = 'slyDog';

            var req = {
                body:{
                    username: username,
                    email: email
                }
            };
            var doneFunc = function(one, two, three, four ) {
                expect(one).to.equal(null);
                expect(two).to.deep.equal(false);
                expect(three).to.deep.equal({ message: "User already exists with username '" + username + "'!" });
                expect(four).to.equal(undefined);
                expect(winstonErrorStub.withArgs("User already exists with username '" + username + "'!").calledOnce).to.equal(true);
                done();
            };

            var passport = {
                use:function(name, strategy, three){
                    expect(name).to.equal('signup');
                    expect(three).to.equal(undefined);
                    strategy._verify(req, username, password, doneFunc);
                }
            };

            var savedUser = {
                username: 'slyDog'
            };

            sandbox.stub(require('bcrypt-nodejs'), 'compareSync', function() {return true;});
            sandbox.stub(require('winston'), 'debug');
            var winstonErrorStub = sandbox.stub(require('winston'), 'error');
            sandbox.stub(User, 'hashPassword', function(password){return password});
            var findOneStub = sandbox.stub(db.readOnlyConnection.model('User'), 'findOne');
            findOneStub.onCall(0).yields(null, savedUser);

            require('../../../../server/passport/signup')(passport);
        });
        it('should log and throw an error when there is an error finding a user by email', function(done) {
            var email = 'myemail@email.com',
                signUpError = new Error('Error running findOne'),
                password = 'password123',
                hashPassword = password;

            var req = {
                body:{
                    username:'slyDog',
                    email: email
                }
            };
            var doneFunc = function(one, two, three) {
                expect(one).to.equal(signUpError);
                expect(two).to.deep.equal(undefined);
                expect(three).to.equal(undefined);
                expect(winstonErrorStub.withArgs('Error in SignUp: ' + signUpError).calledOnce).to.equal(true);
                done();
            };

            var passport = {
                use:function(name, strategy, three){
                    expect(name).to.equal('signup');
                    expect(three).to.equal(undefined);
                    strategy._verify(req, email, password, doneFunc);
                }
            };


            sandbox.stub(require('bcrypt-nodejs'), 'compareSync', function() {return true;});
            sandbox.stub(require('winston'), 'debug');
            var winstonErrorStub = sandbox.stub(require('winston'), 'error');
            sandbox.stub(User, 'hashPassword', function(password){return password});
            var findOneStub = sandbox.stub(db.readOnlyConnection.model('User'), 'findOne');
            findOneStub.onCall(0).yields(null, null);
            findOneStub.onCall(1).yields(signUpError, null);

            require('../../../../server/passport/signup')(passport);
        });
        it('should log and throw and error when a user is found by email', function(done) {
            var email = 'myemail@email.com',
                password = 'password123',
                hashPassword = password,
                username = 'slyDog';

            var req = {
                body:{
                    username: username,
                    email: email
                }
            };
            var doneFunc = function(one, two, three, four ) {
                expect(one).to.equal(null);
                expect(two).to.deep.equal(false);
                expect(three).to.deep.equal({ message: "User already exists with email: " + email  });
                expect(four).to.equal(undefined);
                expect(winstonErrorStub.withArgs("User already exists with email: '" + email + "'!").calledOnce).to.equal(true);
                done();
            };

            var passport = {
                use:function(name, strategy, three){
                    expect(name).to.equal('signup');
                    expect(three).to.equal(undefined);
                    strategy._verify(req, email, password, doneFunc);
                }
            };

            var savedUser = {
                username: 'slyDog'
            };

            sandbox.stub(require('bcrypt-nodejs'), 'compareSync', function() {return true;});
            sandbox.stub(require('winston'), 'debug');
            var winstonErrorStub = sandbox.stub(require('winston'), 'error');
            sandbox.stub(User, 'hashPassword', function(password){return password});
            var findOneStub = sandbox.stub(db.readOnlyConnection.model('User'), 'findOne');
            findOneStub.onCall(0).yields(null, null);
            findOneStub.onCall(1).yields(null, savedUser);

            require('../../../../server/passport/signup')(passport);
        });
        it('should log and throw an error while saving a user', function(done) {
            var email = 'myemail@email.com',
                password = 'password123',
                saveError = new Error('Filed to save user'),
                hashPassword = password;

            var req = {
                body:{
                    username:'slyDog',
                    email: email
                }
            };
            var doneFunc = function(one, two, three, four) {
                expect(one).to.equal(null);
                expect(two).to.deep.equal(false);
                expect(three).to.deep.equal({ message: "We're sorry, we could not create your account at this time!" });
                expect(four).to.equal(undefined);
                winstonErrorStub.args[0][0].should.equal('Error in Saving user: ' + saveError);
                done();
            };

            var passport = {
                use:function(name, strategy, three){
                    expect(name).to.equal('signup');
                    expect(three).to.equal(undefined);
                    strategy._verify(req, email, password, doneFunc);
                }
            };

            var savedUser = {
                username: 'slyDog'
            };

            sandbox.stub(require('bcrypt-nodejs'), 'compareSync', function() {return true;});
            var winstonErrorStub = sandbox.stub(require('winston'), 'error');
            sandbox.stub(User, 'hashPassword', function(password){return password});
            var findOneStub = sandbox.stub(db.readOnlyConnection.model('User'), 'findOne');
            findOneStub.onCall(0).yields(null, null);
            findOneStub.onCall(1).yields(null, null);
            var saveStub = sandbox.stub(db.readOnlyConnection.model('User').prototype, 'save');
            saveStub.yields(saveError, savedUser);
            sandbox.stub(acl.prototype, 'addUserRoles');
            var getAclStub = sandbox.stub(aclSetup, 'getAcl');
            getAclStub.returns({addUserRoles:function(a,b) {
                expect(a).to.equal(savedUser.username);
                expect(b).to.equal(require('../../../../server/security/resources/free-tier-role').object.key);
            }});

            require('../../../../server/passport/signup')(passport);

        });

    });
});


