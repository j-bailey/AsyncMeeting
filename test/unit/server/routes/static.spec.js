var User = require('../../../../server/models/user'),
    acl = require('acl'),
    aclSetup = require('../../../../server/security/acl');

describe('routes/static', function () {
    var sandbox;

    var routerPostStub,
        routerDeleteStub;
    var passportStub;
    var jwtStub;
    var configStub;
    var UserStub,
        UserThenSpy;
    var loggerStub;
    before(function () {
        sandbox = sinon.sandbox.create();

        routerPostStub = sandbox.stub(require('express').Router().__proto__, 'post');
        routerDeleteStub = sandbox.stub(require('express').Router().__proto__, 'delete');
        passportStub = sandbox.stub(require('passport'), 'authenticate');
        passportStub.withArgs('login').returns('login');
        passportStub.withArgs('email-login').returns('email-login');
        jwtStub = sandbox.stub(require('jwt-simple'), 'encode');
        jwtStub.returns('jwtEncoded');
        configStub = sandbox.stub(require('../../../../config'), 'secret');
        UserStub = sandbox.stub(require('../../../../server/models/user'), 'findPublicUserById');
        UserThenSpy = sandbox.spy();
        UserStub.returns({then:UserThenSpy});
        // TODO fix winston stub
        //loggerStub = sandbox.stub(require('winston').__proto__, 'debug');

        require('../../../../server/routes/static');
    });

    after(function () {
        sandbox.restore();
    });

    describe('/login', function () {
        it('should authenticate login request and return user', function (done) {
            var userObj = {_id:2, username:"username2"},
                reqObj = {user:{id:1, username:"username1"}},
                resSpy = {setHeader: sandbox.spy(), json: sandbox.spy()};

            routerPostStub.args[0][0].should.equal('/login');
            routerPostStub.args[0][1].should.equal('login');
            routerPostStub.args[0][2](reqObj, resSpy);
            resSpy.setHeader.args[0][0].should.equal('Content-Type');
            resSpy.setHeader.args[0][1].should.equal('application/json');
            UserThenSpy.args[0][0](userObj);
            resSpy.json.args[0][0].should.deep.equal({ user:userObj, token: 'jwtEncoded',
                permissions:['CanReadMeetingAreas', 'CanCreateMeetingAreas', 'CanViewMeetingAreas', 'CanDeleteMeetingAreas'] });
            done();
        });
    });
    describe('/email-login', function () {
        it('should authenticate login request and return user', function (done) {
            var userObj = {_id:2, username:"username2"},
                reqObj = {user:{id:1, username:"username1"}},
                resSpy = {setHeader: sandbox.spy(), json: sandbox.spy()};

            routerPostStub.args[1][0].should.equal('/email-login');
            routerPostStub.args[1][1].should.equal('email-login');
            //loggerStub.args[0][0].should.equal("in email-login POST");
            routerPostStub.args[1][2](reqObj, resSpy);
            resSpy.setHeader.args[0][0].should.equal('Content-Type');
            resSpy.setHeader.args[0][1].should.equal('application/json');
            UserThenSpy.args[1][0](userObj);
            //loggerStub.args[1][0].should.equal("Sending response");
            resSpy.json.args[0][0].should.deep.equal({ user:userObj, token: 'jwtEncoded',
                permissions:['CanReadMeetingAreas', 'CanCreateMeetingAreas', 'CanViewMeetingAreas', 'CanDeleteMeetingAreas'] });
            done();
        });
    });
    describe('/logout', function () {
        it('should logout user, destory session, and send HTTP 200', function (done) {
            var userObj = {_id:2, username:"username2"},
                reqSpy = {logout: sandbox.spy(), session: {destroy: sandbox.spy()}},
                resSpy = {sendStatus: sandbox.spy()};


            routerDeleteStub.args[0][0].should.equal('/logout');
            routerDeleteStub.args[0][1](reqSpy, resSpy);
            reqSpy.logout.calledOnce.should.equal(true);
            resSpy.sendStatus.args[0][0].should.equal(200);
            reqSpy.session.destroy.calledOnce.should.equal(true);
            done();
        });
    });
    describe('/signup', function () {
        it('should sign up the user and login them in', function (done) {
            var userObj = {_id:2, username:"username2"},
                infoObj = {info: "More info"},
                reqSpy = {login: sinon.spy()},
                resSpy = {setHeader: sinon.spy(), json: sinon.spy()},
                nextSpy = sinon.spy(),
                errSpy = sinon.spy();

            routerPostStub.args[2][0].should.equal('/signup');
            routerPostStub.args[2][1](reqSpy, resSpy, nextSpy);
            passportStub.args[2][1](undefined, userObj, infoObj);
            reqSpy.login.args[0][1](undefined);
            resSpy.json.args[0][0].should.deep.equal(userObj);
            done();
        });
        // TODO figure out how to get the nextSpy to work
        //it('should throw an error on passport signup', function (done) {
        //    var userObj = {_id:2, username:"username2"},
        //        infoObj = {info: "More info"},
        //        reqSpy = {login: sandbox.spy()},
        //        resSpy = {setHeader: sandbox.spy(), json: sandbox.spy()},
        //        nextSpy = sandbox.stub(),
        //        errSpy = sandbox.spy();
        //
        //    routerPostStub.args[2][0].should.equal('/signup');
        //    routerPostStub.args[2][1](reqSpy, resSpy, nextSpy);
        //    passportStub.args[3][1]('error', userObj, infoObj);
        //    nextSpy.args[0][0].should.equal('error');
        //    done();
        //});
        it('should return HTTP 400 and return info to the client', function (done) {
            var userObj = {_id:2, username:"username2"},
                infoObj = {info: "More info"},
                reqSpy = {login: sinon.spy()},
                resSpy = {status: sinon.stub(), json: sinon.spy()},
                nextSpy = sinon.spy(),
                errSpy = sinon.spy();

            resSpy.status.returns(resSpy);
            routerPostStub.args[2][0].should.equal('/signup');
            routerPostStub.args[2][1](reqSpy, resSpy, nextSpy);
            passportStub.args[3][1](undefined, undefined, infoObj);
            reqSpy.login.called.should.equal(false);
            resSpy.json.args[0][0].should.deep.equal(infoObj);
            done();
        });

    });
});


