var redis = require('../../../../server/redis'),
    config = require('config');

describe('security/securityUtils', function () {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('getRedisClient', function () {
        it('should create a token, store it in redis and return a copy', function (done) {
            var configGetStub = sandbox.stub(config, 'get'),
                redisGetClientStub = sandbox.stub(redis, 'getRedisClient'),
                redisClientSpies = {set: sandbox.spy(), setex: sandbox.spy()},
                identity = 'tomBlank';

            configGetStub.withArgs('accessToken.secret').returns('supersecretkey');
            configGetStub.withArgs('accessToken.timeout').returns(1800);
            redisGetClientStub.returns(redisClientSpies);


            clock = sinon.useFakeTimers(new Date(2011, 9, 1).getTime());
            new Date(); //=> return the fake Date 'Sat Oct 01 2011 00:00:00'

            var securityUtils = require('../../../../server/security/securityUtils');
            var accessToken = securityUtils.generateAccessToken(identity);

            clock.restore();
            new Date(); //=> will return the real time again (now)

            redisClientSpies.setex.args[0][0].should.equal(accessToken);
            redisClientSpies.setex.args[0][1].should.equal(1800);
            redisClientSpies.setex.args[0][2].should.equal(identity);

            //redisClientSpies.set.args[0][0].should.equal(accessToken);
            //redisClientSpies.set.args[0][1].should.equal(identity);

            accessToken.should.equal('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZGVudGl0eSI6InRvbUJsYW5rIiwibm93IjoiMjAxMS0wOS0zMFQyMzowMDowMC4wMDBaIn0.PWV6jItc-4-BWDjyk-kWZ46XI2ljBVb7jdyhQesCMJc');

            done();
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

            redisClientSpies.del.args[0][0].should.equal(accessToken);

            done();
        });
        //it('should throw an error when a token is not provided ', function (done) {
        //    var securityUtils = require('../../../../server/security/securityUtils');
        //    expect(securityUtils.releaseAccessToken(undefined)).to.throw(Error);
        //
        //    done();
        //});
    });
});
