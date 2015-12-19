"use strict";

var redis = require("redis"),
    nconf = require('nconf'),
    logger = require('winston');

var redisClient;

module.exports = {
     getRedisClient: function() {
        if (redisClient) {
            return redisClient;
        } else {
            if (nconf.get('redis:connectionType') === 'tcp') {
                redisClient = redis.createClient(nconf.get('redis:port'),
                    (nconf.get("NODE_ENV").toUpperCase() === 'DEVELOPMENT')? 'localhost' : nconf.get('redis:host'),
                    nconf.get('redis:options'));
            } else if (nconf.get('redis:connectionType') === 'unix-socket') {
                redisClient = redis.createClient(nconf.get('redis:socketName'), nconf.get('redis:options'));
            } else {
                logger.error('Unable to find redis settings to set up connection.  Please add redis settings to config file');
                throw new Error('Unable to find redis settings to set up connection.  Please add redis settings to config file');
            }
        }
        return redisClient;
    }
};
