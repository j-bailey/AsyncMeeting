describe('security/acl', function () {
    var sandbox;
    var acl;

    var AclAllowStub,
        AclStub,
        AclMongoStub,
        fsStub,
        cfgStub,
        mongoDbUrl,
        mongoStub;

    before(function () {
        sandbox = sinon.sandbox.create();

        AclAllowStub = sandbox.stub(require('acl').prototype, 'allow');
        //AclStub = sandbox.stub(require('acl').__proto__, 'constructor');
        //AclMongoStub = sandbox.stub(require('acl'), 'mongodbBackend');
        //AclMongoStub.returns(function(){});
        // TODO fix winston stub
        //loggerStub = sandbox.stub(require('winston'), 'info');
        //loggerErrorStub = sandbox.stub(require('winston'), 'error');
        fsStub = sandbox.stub(require('fs'), 'readdirSync');
        var fileList = ['free-tier-role.js', 'mid-tier-role.js', 'NotARole.js']
        fsStub.returns(fileList);
        cfgStub = sandbox.stub(require('config'), 'get');
        mongoDbUrl = 'mongodb://test/test';
        cfgStub.returns(mongoDbUrl);
        mongoStub = sandbox.stub(require('mongodb'), 'connect');

        acl = require('../../../../server/security/acl');
    });

    after(function () {
        sandbox.restore();
    });

    describe('init and setup roles', function () {
        it('should create a connection to the DB and create the default ACL instance', function (done) {
            var dbObj = {bdid:'test'};
            acl.init();

            mongoStub.args[0][0].should.equal(mongoDbUrl);
            mongoStub.args[0][1](undefined, dbObj);
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
            acl.init();

            mongoStub.args[0][0].should.equal(mongoDbUrl);
            var dbErr = 'cannot connect to DB';
            expect(mongoStub.args[1][1].bind(null, dbErr, dbObj)).to.throw(dbErr);
            // TODO fix winston issue
            //loggerError.args[0][0].should.equal('Error connecting to database for ACL set up.  ' + dbErr);
            done();
        });
    });
});


