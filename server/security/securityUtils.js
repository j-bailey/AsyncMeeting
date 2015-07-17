"use strict";

var logger = require('winston'),
    nconf = require('nconf'),
    jwt = require('jsonwebtoken'),
    Q = require('q');

var releaseTokenCache = {};

module.exports = {
    generateAccessToken: function (identity, basePermissions, clientIp) {
        var defer = Q.defer();
        var jwtOptions = {
            algorithm: "HS512",
            expiresInMinutes: nconf.get('accessToken:timeout'),
            audience: clientIp,
            issuer: 'https://productivegains.com',
            subject: "productivegains:" + identity
        };
        var jwtPayload = {
            username: identity,
            permissions: basePermissions,
            clientIp: clientIp
        };
        try {
            var token = jwt.sign(jwtPayload, nconf.get('accessToken:secret'), jwtOptions);
            defer.resolve(token);
        } catch (e)
        {
            logger.error('Failed to create JWT token');
            defer.reject(new Error('Unable to create token'));
        }
        return defer.promise;
    },
    releaseAccessToken: function (token) {
        releaseTokenCache[token] = token;
    },
    isValidToken: function (token, clientIp) {
        var defer = Q.defer();
        var decoded;
        if (!token) {
            logger.error('Need a token for isValidToken');
            defer.reject('Need a token for isValidToken');
            return defer.promise;
        }
        try {
            decoded = jwt.verify(token, nconf.get('accessToken:secret'));
        } catch (e) {
            logger.error('Failed to verify token for clientIp ' + clientIp);
            defer.reject(new Error('Failed to verify token'));
            return defer.promise;
        }
        if (releaseTokenCache.token){
            defer.resolve(false);
        } else if (decoded && decoded.clientIp === clientIp){
            defer.resolve(true);
        } else {
            defer.resolve(false);
        }
        return defer.promise;
    },
    getIdentity: function(token, clientIp) {
        var defer = Q.defer();
        if (this.isValidToken(token, clientIp)) {
            var decoded = jwt.verify(token, nconf.get('accessToken:secret'));
            defer.resolve(decoded.username);
        } else {
            defer.reject(new Error('Could not find the identity'));
        }
        return defer.promise;
    }
};
