var redis = require("redis"),
    config = require('config'),
    logger = require('winston');

var redisClient;

module.exports = {
     getRedisClient: function() {
        if (redisClient) {
            return redisClient;
        } else {
            if (config.get('redis.connectionType') === 'tcp') {
                redisClient = redis.createClient(config.get('redis.port'), config.get('redis.host'), config.get('redis.options'));
            } else if (config.get('redis.connectionType') === 'unix-socket') {
                redisClient = redis.createClient(config.get('redis.socketName'), config.get('redis.options'));
            } else {
                logger.error('Unable to find redis settings to set up connection.  Please add redis settings to config file');
                throw new Error('Unable to find redis settings to set up connection.  Please add redis settings to config file');
            }
        }
        return redisClient;
    }
};
