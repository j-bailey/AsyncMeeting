var User = require('../../../../server/models/user');

describe('email-login', function() {
    var sandbox;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('email-login', function() {
        it('should return a user', function(done) {
            var req = {},
                email = 'myemail@email.com',
                password = 'password123',
                hashPassword = password;

            var user = new User({
                email: "myemail@email.com",
                password: hashPassword
            });

            var doneFunc = function(one, two, three) {
                expect(one).to.equal(null);
                expect(two).to.deep.equal(user);
                expect(three).to.equal(undefined);
                done();
            };

            var passport = {
                use: function(name, strategy, validation) {
                    expect(name).to.equal('email-login');
                    expect(strategy._passwordField).to.equal('password');
                    expect(strategy._usernameField).to.equal('email');
                    expect(strategy.name).to.equal('local');
                    expect(strategy._passReqToCallback).to.equal(true);
                    strategy._verify(null, email, password, doneFunc);
                }
            };
            sandbox.stub(require('bcrypt-nodejs'), 'compareSync', function(arg1, arg2) {return true;});
            sandbox.stub(User.base.Model, 'findOne').yields(null, user);
            require('../../../../server/passport/email-login')(passport);
        });
        it('should return an error while looking for a user', function(done) {
            var req = {},
                error = new Error('Error while searching'),
                email = 'myemail@email.com',
                password = 'password123',
                hashPassword = password;

            var user = new User({
                email: "myemail@email.com",
                password: hashPassword
            });

            var doneFunc = function(one, two, three) {
                expect(one).to.deep.equal(error);
                expect(two).to.deep.equal(undefined);
                expect(three).to.equal(undefined);
                done();
            };

            var passport = {
                use: function(name, strategy, validation) {
                    expect(name).to.equal('email-login');
                    expect(strategy._passwordField).to.equal('password');
                    expect(strategy._usernameField).to.equal('email');
                    expect(strategy.name).to.equal('local');
                    expect(strategy._passReqToCallback).to.equal(true);
                    strategy._verify(null, email, password, doneFunc);
                }
            };
            sandbox.stub(require('bcrypt-nodejs'), 'compareSync', function(arg1, arg2) {return true;});
            sandbox.stub(User.base.Model, 'findOne').yields(error, null);
            require('../../../../server/passport/email-login')(passport);
        });
        it('should log and return an error when it cannot find a user', function(done) {
            var flashSpy = sandbox.spy(),
                winstomSpy = sandbox.spy(),
                req = { flash: flashSpy},
                email = 'myemail@email.com',
                password = 'password123',
                hashPassword = password;

            var user = null;

            var doneFunc = function(one, two, three) {
                expect(one).to.equal(null);
                expect(two).to.equal(false);
                expect(three).to.equal(undefined);
                flashSpy.calledWith('message', 'User Not found.');
                winstomSpy.calledWith('User Not Found with email ' + email);
                done();
            };

            var passport = {
                use: function(name, strategy, validation) {
                    expect(name).to.equal('email-login');
                    expect(strategy._passwordField).to.equal('password');
                    expect(strategy._usernameField).to.equal('email');
                    expect(strategy.name).to.equal('local');
                    expect(strategy._passReqToCallback).to.equal(true);
                    strategy._verify(req, email, password, doneFunc);
                }
            };
            sandbox.stub(require('winston'), 'debug', winstomSpy);
            sandbox.stub(require('bcrypt-nodejs'), 'compareSync', function(arg1, arg2) {return true;});
            sandbox.stub(User.base.Model, 'findOne').yields(null, user);
            require('../../../../server/passport/email-login')(passport);
        });
        it('should log and return an error when user passwords do not match', function(done) {
            var flashSpy = sandbox.spy(),
                winstomSpy = sandbox.spy(),
                req = { flash: flashSpy},
                email = 'myemail@email.com',
                password = 'password123',
                hashPassword = password;

            var user = new User({
                email: "myemail@email.com",
                password: hashPassword
            });

            var doneFunc = function(one, two, three) {
                expect(one).to.equal(null);
                expect(two).to.equal(false);
                expect(three).to.equal(undefined);
                flashSpy.calledWith('message', 'Invalid Password');
                winstomSpy.calledWith('Invalid Password');
                done();
            };

            var passport = {
                use: function(name, strategy, validation) {
                    expect(name).to.equal('email-login');
                    expect(strategy._passwordField).to.equal('password');
                    expect(strategy._usernameField).to.equal('email');
                    expect(strategy.name).to.equal('local');
                    expect(strategy._passReqToCallback).to.equal(true);
                    strategy._verify(req, email, password, doneFunc);
                }
            };
            sandbox.stub(require('winston'), 'debug', winstomSpy);
            sandbox.stub(require('bcrypt-nodejs'), 'compareSync', function(arg1, arg2) {return false;});
            sandbox.stub(User.base.Model, 'findOne').yields(null, user);
            require('../../../../server/passport/email-login')(passport);
        });
    });
});


