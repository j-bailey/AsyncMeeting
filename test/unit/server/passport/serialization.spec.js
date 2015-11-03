var mongoose = require('mongoose'),
    User = mongoose.model('User')? mongoose.model('User'): mongoose.model('User', require('../../../../server/models/user').schema);

describe('serialization', function() {
    var sandbox;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
        sandbox.restore();
    });

    describe('serializeUser', function() {
        it('should create a session user', function(done) {
            var email = 'myemail@email.com';

            var userElements = {
                _id: 1,
                name: 'Jim Bob',
                email: email,
                roles: ['GodMode']
            };
            var user = new User(userElements);

            var doneFunc = function(one, two, three) {
                expect(one).to.equal(null);
                expect(two).to.deep.equal(userElements);
                expect(three).to.equal(undefined);
                done();
            };

            var useSpy = sandbox.spy(),
                passport = {
                serializeUser: function(func) {
                    func(userElements, doneFunc);
                },
                deserializeUser: sandbox.spy(),
                use: useSpy
            };

            require('../../../../server/passport/serialization')(passport);
        });
        it('should create a deserialize a session user', function(done) {
            var email = 'myemail@email.com';

            var userElements = {
                _id: 1,
                name: 'Jim Bob',
                email: email,
                roles: ['GodMode']
            };
            var user = new User(userElements);

            var doneFunc = function(one, two, three) {
                expect(one).to.equal(null);
                expect(two).to.deep.equal(userElements);
                expect(three).to.equal(undefined);
                done();
            };

            var useSpy = sandbox.spy(),
                passport = {
                    serializeUser: sandbox.spy(),
                    deserializeUser: function(func){
                        func(userElements, doneFunc)
                    },
                    use: useSpy
                };

            require('../../../../server/passport/serialization')(passport);
        });
    });
});


