var logger = require('winston'),
    config = require('config'),
    jwt = require('jwt-simple'),
    Q = require('q'),
    redis = require('../redis');

var prefix = 'ACCESS-TOKEN:';

module.exports = {
    generateAccessToken: function (identity) {
        var defer = Q.defer();
        var now = new Date();
        var token = jwt.encode({"now": now, "identity": identity}, config.get('accessToken.secret'));
        var redisClient = redis.getRedisClient();

        logger.debug('Ready to add access token to Redis');
        redisClient.setex(prefix + token, config.get('accessToken.timeout'), identity, function (err) {
            if (err) {
                logger.error('Error putting access token in Redis.  ' + err);
                defer.reject(err);
            } else {
                logger.debug('Saved access token to Redis with timeout: ' + config.get('accessToken.timeout'));
                defer.resolve(token);
            }
        });
        return defer.promise;
    },
    releaseAccessToken: function (token) {
        if (token) {
            var redisClient = redis.getRedisClient();
            redisClient.del(prefix + token);
        } else {
            logger.error('Require token to release a token.');
            throw new Error('Require token to release a token.');
        }
    },
    clearAllAccessTokens: function () {
        var defer = Q.defer();
        var redisClient = redis.getRedisClient();
        redisClient.keys(prefix + '*', function (err, keys) {
            if(err){
                logger.error('Unable to delete access tokens from Redis, due to: ' + err);
                defer.reject(err);
            } else {
                redisClient.del(keys);
                defer.resolve();
            }
        });
        return defer.promise;
    },
    isValidToken: function (token) {
        var defer = Q.defer();
        var redisClient = redis.getRedisClient();
        //redisClient.keys(prefix + '*', function (err, items) {
        //    logger.debug('Looking for = ' + token);
        //    items.forEach(function (item) {
        //        logger.debug('Keys = ' + item);
        //    });
        //});
        if (!token){
            logger.error('Need a token for isValidToken');
            defer.reject('Need a token for isValidToken');
        }
        redisClient.exists(prefix + token, function (err, item) {
            if (err) {
                logger.error('Error when trying to find if an access token exists in Redis: ' + err);
                defer.reject(err);
            } else {
                defer.resolve(item === 1);
            }
        });

        return defer.promise;
    },
    getIdentity: function(token) {
        var defer = Q.defer();
        var redisClient = redis.getRedisClient();
        redisClient.get(prefix + token, function (err, item) {
            if (err) {
                defer.reject(err);
            } else {
                defer.resolve(item);
            }
        });

        return defer.promise;
    }
};
