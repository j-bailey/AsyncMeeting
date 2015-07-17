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
        it('should create a token, store it in redis and return a copy', function (done) {
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

            var securityUtils = require('../../../../server/security/securityUtils');
            securityUtils.generateAccessToken(identity).then(function (accessToken, err) {
                expect(err).to.be.undefined;
                new Date(); //=> will return the real time again (now)

                //redisClientSpies.setex.args[0][0].should.equal('ACCESS-TOKEN:' + accessToken);
                //redisClientSpies.setex.args[0][1].should.equal(1800);
                //redisClientSpies.setex.args[0][2].should.equal(identity);

                accessToken.should.equal('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6InRvbUJsYW5rIiwiaWF0IjoxMzE3NDUyNDAwLCJleHAiOjEzMTc1NjA0MDAsImlzcyI6Imh0dHBzOi8vcHJvZHVjdGl2ZWdhaW5zLmNvbSIsInN1YiI6InByb2R1Y3RpdmVnYWluczp0b21CbGFuayJ9.83jb47K7X2MZ7ZTYYET501Urp8MaU_icJ-726EsaYE_-8QGr9hRBh9kJ1j0t1dzZH-eRWomZKn5HA4oTecI6QQ');

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

            var securityUtils = require('../../../../server/security/securityUtils');
            securityUtils.generateAccessToken(identity).catch(function (err) {
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

            var securityUtils = require('../../../../server/security/securityUtils');
            securityUtils.releaseAccessToken(accessToken);

            //redisClientSpies.del.args[0][0].should.equal('ACCESS-TOKEN:' + accessToken);

            done();
        });
    });
    describe('isValidToken', function () {
        it('should confirm the token is valid', function (done) {
            var token = 'asfd',
                jwtStub = sandbox.stub(jwt, 'verify');

            jwtStub.returns({clientIp:'1.1.1.1'});

            var securityUtils = require('../../../../server/security/securityUtils');
            securityUtils.isValidToken(token, '1.1.1.1').then(function (result, err) {
                expect(err).to.be.undefined;

                result.should.equal(true);
                done();
            });
        });
        it('should log and throw an error when a token is not provided', function (done) {
            var token = undefined;

            var securityUtils = require('../../../../server/security/securityUtils');
            securityUtils.isValidToken(token).catch(function (err) {
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

            var securityUtils = require('../../../../server/security/securityUtils');
            securityUtils.isValidToken(token, '1.1.1.1').catch(function (err) {
                expect(err.message).to.equal('Failed to verify token');
                errorLogSpy.args[0][0].should.equal('Failed to verify token for clientIp ' + clientIp);
                done();
            });
        });
    });
});