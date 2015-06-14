describe('model/user', function () {
    var sandbox;
    var user;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        user = require('../../../../server/models/user');
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('findPublicUserById', function () {
        it('should return public user information for a given ID', function (done) {
            var populateStub1 = sandbox.stub(),
                populateStub2 = sandbox.stub(),
                execStub = sandbox.stub(),
                findByIdStub  = sandbox.stub(user.base.Model, 'findById');
            var execStub = sandbox.stub(require('mongoose').__proto__.Query.prototype, 'exec')
            findByIdStub.returns({populate:populateStub1});
            populateStub1.returns({populate:populateStub2});
            populateStub2.returns({exec:execStub});
            user.findPublicUserById(1);

            findByIdStub.args[0][0].should.equal(1);
            findByIdStub.args[0][1].should.equal('username email permissions roles createdOn modifiedOn firstName lastName');
            populateStub1.args[0][0].should.equal('permissions');
            populateStub2.args[0][0].should.equal('roles');

            done();
        });
    });
    describe('findPublicUserByUserName', function () {
        it('should return public user information for a given ID', function (done) {
            var populateStub1 = sandbox.stub(),
                populateStub2 = sandbox.stub(),
                execStub = sandbox.stub(),
                findByIdStub  = sandbox.stub(user.base.Model, 'findOne');
            var execStub = sandbox.stub(require('mongoose').__proto__.Query.prototype, 'exec')
            findByIdStub.returns({populate:populateStub1});
            populateStub1.returns({populate:populateStub2});
            populateStub2.returns({exec:execStub});
            user.findPublicUserByUserName('UserNameIs');

            findByIdStub.args[0][0].should.deep.equal({username:'UserNameIs'});
            findByIdStub.args[0][1].should.equal('username email permissions roles createdOn modifiedOn firstName lastName');
            populateStub1.args[0][0].should.equal('permissions');
            populateStub2.args[0][0].should.equal('roles');

            done();
        });
    });
    describe('findPublicUserByEmail', function () {
        it('should return public user information for a given ID', function (done) {
            var populateStub1 = sandbox.stub(),
                populateStub2 = sandbox.stub(),
                execStub = sandbox.stub(),
                findByIdStub  = sandbox.stub(user.base.Model, 'findOne');
            var execStub = sandbox.stub(require('mongoose').__proto__.Query.prototype, 'exec')
            findByIdStub.returns({populate:populateStub1});
            populateStub1.returns({populate:populateStub2});
            populateStub2.returns({exec:execStub});
            user.findPublicUserByEmail('MyEmail@email.com');

            findByIdStub.args[0][0].should.deep.equal({email:'MyEmail@email.com'});
            findByIdStub.args[0][1].should.equal('username email permissions roles createdOn modifiedOn firstName lastName');
            populateStub1.args[0][0].should.equal('permissions');
            populateStub2.args[0][0].should.equal('roles');

            done();
        });
    });
    describe('hashPassword', function () {
        it('should return a hashed password', function (done) {
            var hashSyncStub  = sandbox.stub(require('bcrypt'), 'hashSync');
            user.hashPassword('Password123');

            hashSyncStub.args[0][0].should.equal('Password123');
            hashSyncStub.args[0][1].should.equal(10);

            done();
        });
    });
});


