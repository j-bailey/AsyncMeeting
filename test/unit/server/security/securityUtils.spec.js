var redis = require('../../../../server/redis'),
    logger = require('winston'),
    jwt = require('jsonwebtoken'),
    nconf = require('nconf');

describe('security/securityUtils', function () {
    var sandbox,
        clock,
        prevError,
        errorLogSpy;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        prevError = logger.error;
        errorLogSpy = sandbox.stub();
        logger.error = errorLogSpy;

    });

    afterEach(function () {
        sandbox.restore();
        logger.error = prevError;
        if (clock) {
            clock.restore();
        }
    });

    describe('generateAccessToken', function () {
        it.skip('should create a token, store it in redis and return a copy', function (done) {
            var nconfGetStub = sandbox.stub(nconf, 'get'),
                //redisGetClientStub = sandbox.stub(redis, 'getRedisClient'),
                //setexStub = sandbox.stub(),
                //redisClientSpies = {set: sandbox.spy(), setex: setexStub},
                identity = 'tomBlank';


            nconfGetStub.withArgs('accessToken:secret').returns('supersecretkey');
            nconfGetStub.withArgs('accessToken:timeout').returns(1800);
            //redisGetClientStub.returns(redisClientSpies);


            clock = sinon.useFakeTimers(new Date(2011, 9, 1).getTime());
            new Date(); //=> return the fake Date 'Sat Oct 01 2011 00:00:00'

            var securityUtils = require('../../../../server/utils/securityUtils');
            securityUtils.generateAccessToken(identity, '1234232344', [], '127.0.0.1', 'firefox', 'aaa').then(function (accessToken, err) {
                expect(err).to.be.undefined;
                new Date(); //=> will return the real time again (now)

                //redisClientSpies.setex.args[0][0].should.equal('ACCESS-TOKEN:' + accessToken);
                //redisClientSpies.setex.args[0][1].should.equal(1800);
                //redisClientSpies.setex.args[0][2].should.equal(identity);

                expect(accessToken).to.equal('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6InRvbUJsYW5rIiwicGVybWlzc2lvbnMiOltdLCJjbGllbnRJcCI6IjEyNy4wLjAuMSIsInVzZXJBZ2VudCI6ImZpcmVmb3giLCJ0SWQiOiIxMjM0MjMyMzQ0IiwiaWF0IjoxMzE3NDUyNDAwLCJleHAiOjEzMTc1NjA0MDAsImF1ZCI6IjEyNy4wLjAuMSIsImlzcyI6Imh0dHBzOi8vcHJvZHVjdGl2ZWdhaW5zLmNvbSIsInN1YiI6InByb2R1Y3RpdmVnYWluczp0b21CbGFuayJ9.ffUb-fg2DMT8HJKnPQyz9bXrixgauU0grRqXO_9lBlog0g-4lk-UBYSQ81xZn1XSSW6xBooTzEdi9U3TjvVsGQ');

                done();
            });
            //setexStub.callArg(3);
        });
        it('should log the error and reject the promise', function (done) {
            var nconfGetStub = sandbox.stub(nconf, 'get'),
                //redisGetClientStub = sandbox.stub(redis, 'getRedisClient'),
                //setexStub = sandbox.stub(),
                //redisClientSpies = {set: sandbox.spy(), setex: setexStub},
                jwtStub = sandbox.stub(jwt, 'sign'),
                identity = 'tomBlank';

            nconfGetStub.withArgs('accessToken:secret').returns('supersecretkey');
            nconfGetStub.withArgs('accessToken:timeout').returns(1800);
            jwtStub.throws(new Error('Dummy error'));
            //redisGetClientStub.returns(redisClientSpies);


            clock = sinon.useFakeTimers(new Date(2011, 9, 1).getTime());
            new Date(); //=> return the fake Date 'Sat Oct 01 2011 00:00:00'

            var securityUtils = require('../../../../server/utils/securityUtils');
            securityUtils.generateAccessToken(identity, [], '127.0.0.1', 'firefox', 'aaa').catch(function (err) {
                expect(err.message).to.equal('Unable to create token');
                errorLogSpy.args[0][0].should.equal('Failed to create JWT token');

                done();
            });
            //setexStub.callArgWith(3, 'Error');
        });
    });
    describe('releaseAccessToken', function () {
        it('should retrieve the identity for an access token and remove the access token from redis ', function (done) {
            //var redisGetClientStub = sandbox.stub(redis, 'getRedisClient'),
            //    redisClientSpies = {get: sandbox.stub(), del: sandbox.spy()},
             var accessToken = 'bigToken',
                identity = 'tomBlank';

            //redisClientSpies.get.returns(identity);
            //redisGetClientStub.returns(redisClientSpies);

            var securityUtils = require('../../../../server/utils/securityUtils');
            securityUtils.releaseAccessToken(accessToken);

            //redisClientSpies.del.args[0][0].should.equal('ACCESS-TOKEN:' + accessToken);

            done();
        });
    });
    describe('isValidToken', function () {
        it('should confirm the token is valid with bind client IP and user agent on', function (done) {
            var token = 'asfd',
                nconfGetStub = sandbox.stub(nconf, 'get'),
                jwtStub = sandbox.stub(jwt, 'verify');

            nconfGetStub.withArgs('accessToken:bindToClientIp').returns(true);
            nconfGetStub.withArgs('accessToken:bindToClientUserAgent').returns(true);

            jwtStub.returns({clientIp:'1.1.1.1', userAgent: 'firefox'});

            var securityUtils = require('../../../../server/utils/securityUtils');
            securityUtils.isValidToken(token, '1.1.1.1', 'firefox').then(function (result, err) {
                expect(err).to.be.undefined;

                result.should.equal(true);
                done();
            });
        });
        it('should confirm the token is valid with bind user agent on', function (done) {
            var token = 'asfd',
                nconfGetStub = sandbox.stub(nconf, 'get'),
                jwtStub = sandbox.stub(jwt, 'verify');

            nconfGetStub.withArgs('accessToken:bindToClientIp').returns(false);
            nconfGetStub.withArgs('accessToken:bindToClientUserAgent').returns(true);

            jwtStub.returns({clientIp:'1.1.1.1', userAgent: 'firefox'});

            var securityUtils = require('../../../../server/utils/securityUtils');
            securityUtils.isValidToken(token, '1.1.1.1', 'firefox').then(function (result, err) {
                expect(err).to.be.undefined;

                result.should.equal(true);
                done();
            });
        });
        it('should confirm the token is valid with bind client IP and user agent on OFF', function (done) {
            var token = 'asfd',
                nconfGetStub = sandbox.stub(nconf, 'get'),
                jwtStub = sandbox.stub(jwt, 'verify');

            nconfGetStub.withArgs('accessToken:bindToClientIp').returns(false);
            nconfGetStub.withArgs('accessToken:bindToClientUserAgent').returns(false);

            jwtStub.returns({clientIp:'1.1.1.1', userAgent: 'firefox'});

            var securityUtils = require('../../../../server/utils/securityUtils');
            securityUtils.isValidToken(token, '1.1.1.1', 'firefox').then(function (result, err) {
                expect(err).to.be.undefined;

                result.should.equal(true);
                done();
            });
        });
        it('should log and throw an error when a token is not provided', function (done) {
            var token = undefined;

            var securityUtils = require('../../../../server/utils/securityUtils');
            securityUtils.isValidToken(token, '1.1.1.1', 'firefox').catch(function (err) {
                expect(err).to.equal('Need a token for isValidToken');
                errorLogSpy.args[0][0].should.equal('Need a token for isValidToken');
                done();
            });
        });

        it('should log and throw an error when there is a token verification error', function (done) {
            var token = 'asfd',
                clientIp = '1.1.1.1',
                jwtStub = sandbox.stub(jwt, 'verify');

                jwtStub.throws(new Error('Dummy error'));

            var securityUtils = require('../../../../server/utils/securityUtils');
            securityUtils.isValidToken(token, '1.1.1.1', 'firefox').catch(function (err) {
                expect(err.message).to.equal('Failed to verify token');
                errorLogSpy.args[0][0].should.equal('Failed to verify token for clientIp ' + clientIp);
                done();
            });
        });
    });
});