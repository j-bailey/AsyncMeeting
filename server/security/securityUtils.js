var logger = require('winston'),
    config = require('config'),
    jwt = require('jwt-simple'),
    Q = require('q'),
    redis = require('../redis');


module.exports = {
    generateAccessToken: function (identity) {
        var defer = Q.defer();
        var now = new Date();
        var token = jwt.encode({"identity": identity, "now": now}, config.get('accessToken.secret'));
        var redisClient = redis.getRedisClient();

        logger.debug('Ready to add access token to Redis');
        redisClient.setex(token, config.get('accessToken.timeout'), identity, function (err) {
            if (err) {
                logger.error('Error putting access token in Redis.  ' + err);
                defer.reject(err);
            }
            logger.debug('Saved access token to Redis with timeout: ' + config.get('accessToken.timeout'));
            defer.resolve(token);
        });
        return defer.promise;
    },
    releaseAccessToken: function (token) {
        if (token) {
            var redisClient = redis.getRedisClient();
            redisClient.del(token);
        } else {
            logger.error('Require token to release a token.');
            throw new Error('Require token to release a token.');
        }
    },
    isValidToken: function (token) {
        var defer = Q.defer();
        var redisClient = redis.getRedisClient();
        redisClient.keys('*', function (err, items) {
            items.forEach(function (item) {
                logger.debug('Keys = ' + item);
            });
        });
        redisClient.exists(token, function (err, item) {
            if (err) {
                defer.reject(err);
            }
            defer.resolve(item === 1);
        });

        return defer.promise;
    }
};
