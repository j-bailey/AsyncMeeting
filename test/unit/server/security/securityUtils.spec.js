var redis = require('../../../../server/redis'),
    logger = require('winston'),
    config = require('config');

describe('security/securityUtils', function () {
    var sandbox,
        prevError,
        clock,
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
            var configGetStub = sandbox.stub(config, 'get'),
                redisGetClientStub = sandbox.stub(redis, 'getRedisClient'),
                setexStub = sandbox.stub(),
                redisClientSpies = {set: sandbox.spy(), setex: setexStub},
                identity = 'tomBlank';


            configGetStub.withArgs('accessToken.secret').returns('supersecretkey');
            configGetStub.withArgs('accessToken.timeout').returns(1800);
            redisGetClientStub.returns(redisClientSpies);


            clock = sinon.useFakeTimers(new Date(2011, 9, 1).getTime());
            new Date(); //=> return the fake Date 'Sat Oct 01 2011 00:00:00'

            var securityUtils = require('../../../../server/security/securityUtils');
            securityUtils.generateAccessToken(identity).then(function (accessToken, err) {
                expect(err).to.be.undefined;
                new Date(); //=> will return the real time again (now)

                redisClientSpies.setex.args[0][0].should.equal('ACCESS-TOKEN:' + accessToken);
                redisClientSpies.setex.args[0][1].should.equal(1800);
                redisClientSpies.setex.args[0][2].should.equal(identity);

                accessToken.should.equal('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJub3ciOiIyMDExLTEwLTAxVDA3OjAwOjAwLjAwMFoiLCJpZGVudGl0eSI6InRvbUJsYW5rIn0.eFyV7tSKBrVt0MuAOelhZoZ_WjKQ3HZKMp5Lkx0UeuU');

                done();
            });
            setexStub.callArg(3);
        });
        it('should log the error and reject the promise', function (done) {
            var configGetStub = sandbox.stub(config, 'get'),
                redisGetClientStub = sandbox.stub(redis, 'getRedisClient'),
                setexStub = sandbox.stub(),
                redisClientSpies = {set: sandbox.spy(), setex: setexStub},
                identity = 'tomBlank';

            configGetStub.withArgs('accessToken.secret').returns('supersecretkey');
            configGetStub.withArgs('accessToken.timeout').returns(1800);
            redisGetClientStub.returns(redisClientSpies);


            clock = sinon.useFakeTimers(new Date(2011, 9, 1).getTime());
            new Date(); //=> return the fake Date 'Sat Oct 01 2011 00:00:00'

            var securityUtils = require('../../../../server/security/securityUtils');
            securityUtils.generateAccessToken(identity).catch(function (err) {
                expect(err).to.equal('Error');
                errorLogSpy.args[0][0].should.equal('Error putting access token in Redis.  ' + 'Error');

                done();
            });
            setexStub.callArgWith(3, 'Error');
        });
    });
    describe('releaseAccessToken', function () {
        it('should retrieve the identity for an access token and remove the access token from redis ', function (done) {
            var redisGetClientStub = sandbox.stub(redis, 'getRedisClient'),
                redisClientSpies = {get: sandbox.stub(), del: sandbox.spy()},
                accessToken = 'bigToken',
                identity = 'tomBlank';

            redisClientSpies.get.returns(identity);
            redisGetClientStub.returns(redisClientSpies);

            var securityUtils = require('../../../../server/security/securityUtils');
            securityUtils.releaseAccessToken(accessToken);

            redisClientSpies.del.args[0][0].should.equal('ACCESS-TOKEN:' + accessToken);

            done();
        });
        it('should throw an error when a token is not provided ', function (done) {
            var securityUtils = require('../../../../server/security/securityUtils');

            expect(securityUtils.releaseAccessToken.bind(undefined)).to.throw(Error);

            errorLogSpy.args[0][0].should.equal('Require token to release a token.');

            done();
        });
    });
    describe('clearAllAccessToken', function () {
        it('should remove all the access tokens only', function (done) {
            var redisGetClientStub = sandbox.stub(redis, 'getRedisClient'),
                keys = ['AC:aswd', 'AC:afdf', 'AC:druh'],
                keysStub = sandbox.stub(),
                redisClientSpies = {del: sandbox.spy(), keys: keysStub};

            redisGetClientStub.returns(redisClientSpies);

            var securityUtils = require('../../../../server/security/securityUtils');
            securityUtils.clearAllAccessTokens().then(function (err) {
                expect(err).to.be.undefined;

                redisClientSpies.keys.args[0][0].should.equal('ACCESS-TOKEN:*');
                redisClientSpies.del.args[0][0].should.deep.equal(keys);
                done();
            });
            keysStub.callArgWith(1, undefined, keys);
        });
        it('should log and throw an error when it cannot get the keys from Redis', function (done) {
            var redisGetClientStub = sandbox.stub(redis, 'getRedisClient'),
                keys = ['AC:aswd', 'AC:afdf', 'AC:druh'],
                keysStub = sandbox.stub(),
                redisClientSpies = {del: sandbox.spy(), keys: keysStub};

            redisGetClientStub.returns(redisClientSpies);

            var securityUtils = require('../../../../server/security/securityUtils');
            securityUtils.clearAllAccessTokens().catch(function (err) {
                expect(err).to.equal('Error: getting keys');

                errorLogSpy.args[0][0].should.equal('Unable to delete access tokens from Redis, due to: ' + 'Error: getting keys');

                done();
            });
            keysStub.callArgWith(1, 'Error: getting keys', keys);
        });
    });
    describe('isValidToken', function () {
        it('should confirm the token exists in Redis', function (done) {
            var redisGetClientStub = sandbox.stub(redis, 'getRedisClient'),
                existsStub = sandbox.stub(),
                token = 'asfd',
                redisClientSpies = {del: sandbox.spy(), exists: existsStub};

            redisGetClientStub.returns(redisClientSpies);

            var securityUtils = require('../../../../server/security/securityUtils');
            securityUtils.isValidToken(token).then(function (result, err) {
                expect(err).to.be.undefined;

                redisClientSpies.exists.args[0][0].should.equal('ACCESS-TOKEN:' + token);
                result.should.equal(true);
                done();
            });
            existsStub.callArgWith(1, undefined, 1);
        });
        it('should log and throw an error when a token is not provided', function (done) {
            var redisGetClientStub = sandbox.stub(redis, 'getRedisClient'),
                existsStub = sandbox.stub(),
                token = undefined,
                redisClientSpies = {del: sandbox.spy(), exists: existsStub};

            redisGetClientStub.returns(redisClientSpies);

            var securityUtils = require('../../../../server/security/securityUtils');
            securityUtils.isValidToken(token).catch(function (err) {
                expect(err).to.equal('Need a token for isValidToken');
                errorLogSpy.args[0][0].should.equal('Need a token for isValidToken');

                done();
            });
            existsStub.callArgWith(1, undefined, 1);
        });

        it('should confirm the token does not exists in Redis', function (done) {
            var redisGetClientStub = sandbox.stub(redis, 'getRedisClient'),
                existsStub = sandbox.stub(),
                token = 'asfd',
                redisClientSpies = {del: sandbox.spy(), exists: existsStub};

            redisGetClientStub.returns(redisClientSpies);

            var securityUtils = require('../../../../server/security/securityUtils');
            securityUtils.isValidToken(token).then(function (result, err) {
                expect(err).to.be.undefined;

                redisClientSpies.exists.args[0][0].should.equal('ACCESS-TOKEN:' + token);
                result.should.equal(false);
                done();
            });
            existsStub.callArgWith(1, undefined, 0);
        });
        it('should log and throw an error when there is a Redis error', function (done) {
            var redisGetClientStub = sandbox.stub(redis, 'getRedisClient'),
                existsStub = sandbox.stub(),
                token = 'asfd',
                redisClientSpies = {del: sandbox.spy(), exists: existsStub};

            redisGetClientStub.returns(redisClientSpies);

            var securityUtils = require('../../../../server/security/securityUtils');
            securityUtils.isValidToken(token).catch(function (err) {
                expect(err).to.equal('Unable to connect to Redis');

                redisClientSpies.exists.args[0][0].should.equal('ACCESS-TOKEN:' + token);
                errorLogSpy.args[0][0].should.equal('Error when trying to find if an access token exists in Redis: ' + 'Unable to connect to Redis');
                done();
            });
            existsStub.callArgWith(1, 'Unable to connect to Redis', 1);
        });
    });
});