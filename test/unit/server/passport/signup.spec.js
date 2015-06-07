var User = require('../../../../server/models/user');

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
            require('../../../../server/passport/signup')(passport);
        });
    });
});


