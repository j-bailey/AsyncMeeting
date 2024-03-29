var logger = require('winston');

describe('security/acl', function () {
    var sandbox;
    var acl;

    var AclAllowStub,
        fsStub,
        cfgStub,
        mongoDbUrl,
        prevError,
        errorLogSpy,
        prevInfo,
        infoLogSpy,
        mongoStub;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();

        prevError = logger.error;
        errorLogSpy = sandbox.stub();
        logger.error = errorLogSpy;
        prevInfo = logger.info;
        infoLogSpy = sandbox.stub();
        logger.info = infoLogSpy;

        AclAllowStub = sandbox.stub(require('acl').prototype, 'allow');
        // TODO fix winston stub
        //loggerStub = sandbox.stub(require('winston'), 'info');
        //loggerErrorStub = sandbox.stub(require('winston'), 'error');
        fsStub = sandbox.stub(require('fs'), 'readdirSync');
        var fileList = ['free-tier-role.js', 'mid-tier-role.js', 'NotARole.js'];
        fsStub.returns(fileList);
        cfgStub = sandbox.stub(require('nconf'), 'get');
        mongoDbUrl = 'mongodb://test/test';
        cfgStub.returns(mongoDbUrl);
        mongoStub = sandbox.stub(require('mongodb'), 'connect');
        delete require.cache[require.resolve('../../../../server/security/acl')];
        acl = require('../../../../server/security/acl');
    });

    afterEach(function () {
        sandbox.restore();
        logger.error = prevError;
        logger.info = prevInfo;
    });

    describe('init and setup roles', function () {
        // FIXME need to fix my test
        it('should create a connection to the DB and create the default ACL instance', function (done) {
            var dbObj = {bdid:'test'};
            acl.init();

            mongoStub.args[0][0].should.equal(mongoDbUrl);
            //mongoStub.args[0][1].should.equal('');
            //mongoStub.args[0][2].should.equal('');
            mongoStub.args[0][3](undefined, dbObj);
            AclAllowStub.args[0][0].should.equal('FreeTierUserRole');
            AclAllowStub.args[0][1].should.have.members(['MeetingAreaResource', 'MeetingResource']);
            AclAllowStub.args[0][2].should.deep.have.members([{delete:"delete", get:"get", post:"post", put:"put"}]);

            AclAllowStub.args[1][0].should.equal('FreeTierUserRole');

            AclAllowStub.args[2][0].should.equal('MidTierUserRole');

            AclAllowStub.args[3][0].should.equal('MidTierUserRole');
            done();
        });
        it('should throw and error due to db issue', function (done) {
            var dbObj = {bdid:'test'};
            var dbErr = 'cannot connect to DB';
            mongoStub.yields(dbErr, dbObj);

            expect(acl.init()).to.eventually.throw(dbErr);

            errorLogSpy.args[0][0].should.equal('Error connecting to database for ACL set up.  ' + dbErr);
            done();
        });
    });
    describe('Get current instance of Acl', function() {
        it('should get current instance', function(done){
            var dbObj = {bdid:'test'};
            mongoStub.yields(undefined, dbObj);
            acl.init();
            //noinspection BadExpressionStatementJS
            expect(acl.getAcl()).not.to.be.null;

            done();
        });
        it('should get null when not initialized', function(done){
            var dbObj = {bdid:'test'};
            mongoStub.yields(undefined, dbObj);
            //noinspection BadExpressionStatementJS
            expect(acl.getAcl()).to.be.null;
            done();
        });
    });
});


