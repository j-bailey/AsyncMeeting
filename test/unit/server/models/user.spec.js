var mongoose = require('mongoose'),
    data_driven = require('data-driven'),
    db = require('../../../../server/db');

describe('model/user', function () {
    var sandbox;
    var user = db.adminConnection.model('User');

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        sandbox.stub(process, 'nextTick').yields();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe.skip('findPublicUserByUserName', function () {
        it('should return public user information for a given ID', function (done) {
            var userObj = {_id:1, username: "myName"},
                populateStub1 = sandbox.stub(),
                populateStub2 = sandbox.stub(),
                findByIdStub  = sandbox.stub(user.base.Model, 'findOne');
            var execStub = sandbox.stub(require('mongoose').__proto__.Query.prototype, 'exec');
            findByIdStub.returns({populate:populateStub1});
            populateStub1.returns({populate:populateStub2});
            populateStub2.returns({exec:execStub});

            execStub.yields(undefined, userObj);

            var findPromise = user.findPublicUserByUserName('UserNameIs');

            findByIdStub.args[0][0].should.deep.equal({username:'UserNameIs'});
            populateStub1.args[0][0].should.equal('permissions');
            populateStub2.args[0][0].should.equal('roles');
            expect(findPromise).to.eventually.deep.equal(userObj);
            done();
        });
    });
    describe.skip('findPublicUserByEmail', function () {
        it('should return public user information for a given ID', function (done) {
            var userObj = {_id:1, username: "myName"},
                populateStub1 = sandbox.stub(),
                populateStub2 = sandbox.stub(),
                findByIdStub  = sandbox.stub(user.base.Model, 'findOne');
            var execStub = sandbox.stub(require('mongoose').__proto__.Query.prototype, 'exec');
            findByIdStub.returns({populate:populateStub1});
            populateStub1.returns({populate:populateStub2});
            populateStub2.returns({exec:execStub});

            execStub.yields(undefined, userObj);

            var findPromise = user.findPublicUserByEmail('MyEmail@email.com');

            findByIdStub.args[0][0].should.deep.equal({email:'MyEmail@email.com'});
            populateStub1.args[0][0].should.equal('permissions');
            populateStub2.args[0][0].should.equal('roles');
            expect(findPromise).to.eventually.deep.equal(userObj);

            done();
        });
    });
    describe.skip('quickFind', function () {
        it('should limited user data based on search criteria', function (done) {
            var userObj = {_id:1, username: "myName"},
                populateStub1 = sandbox.stub(),
                populateStub2 = sandbox.stub(),
                findByIdStub  = sandbox.stub(user.base.Model, 'findOne');
            var execStub = sandbox.stub(require('mongoose').__proto__.Query.prototype, 'exec');
            findByIdStub.returns({populate:populateStub1});
            populateStub1.returns({populate:populateStub2});
            populateStub2.returns({exec:execStub});

            execStub.yields(undefined, userObj);

            var findPromise = user.findPublicUserByEmail('MyEmail@email.com');

            findByIdStub.args[0][0].should.deep.equal({email:'MyEmail@email.com'});
            populateStub1.args[0][0].should.equal('permissions');
            populateStub2.args[0][0].should.equal('roles');
            expect(findPromise).to.eventually.deep.equal(userObj);

            done();
        });
    });

    describe.only('isInvalidUsername', function(){
        data_driven(['Abcdefghijklmnopqr#1', 'aA1#', 'aA1@'], function() {
            it('should return false for valid usernames', function(username, done){
                expect(user.schema.statics.isInvalidUsername(username)).to.equal(false);
                done();
            });
        });
        data_driven(['Abcdefghijklmnopqr#1s', ':::aa1#', 'aA1:::'], function() {
            it('should return non false for invalid usernames', function(username, done){
                expect(user.schema.statics.isInvalidUsername(username)).to.not.equal(false);
                done();
            });
        });
    });
});


