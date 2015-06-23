var logger = require('winston'),
    config = require('config'),
    jwt = require('jwt-simple'),
    redis = require('../redis');



module.exports = {
    generateAccessToken: function (identity) {
        var now = new Date(),
            token = jwt.encode({"identity": identity, "now": now}, config.get('accessToken.secret'));
        var redisClient = redis.getRedisClient();

        redisClient.setex(token, config.get('accessToken.timeout'), identity);
        return token;
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
        var redisClient = redis.getRedisClient();
        return redisClient.exists(token) === 1;
    }
};
