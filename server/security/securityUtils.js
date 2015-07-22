"use strict";

var logger = require('winston'),
    nconf = require('nconf'),
    jwt = require('jsonwebtoken'),
    db = require('../db'),
    Q = require('q');

var releaseTokenCache = {};

module.exports = {
    generateAccessToken: function (identity, basePermissions, clientIp) {
        var defer = Q.defer();
        // TODO figure out how to get supertest to pass client IPs
        //if (!clientIp || clientIp === null || clientIp === '') {
        //    logger.error('Need a client IP for generateAccessToken');
        //    defer.reject('Need a client IP for generateAccessToken');
        //    return defer.promise;
        //}
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
        // TODO figure out how to get supertest to pass client IPs
        //if (!clientIp || clientIp === null || clientIp === '') {
        //    logger.error('Need a client IP for isValidToken');
        //    defer.reject('Need a client IP for isValidToken');
        //    return defer.promise;
        //}
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
        // TODO figure out how to get supertest to pass client IPs
        //if (!clientIp || clientIp === null || clientIp === '') {
        //    logger.error('Need a client IP for getIdentity');
        //    defer.reject('Need a client IP for getIdentity');
        //    return defer.promise;
        //}
        if (!token) {
            logger.error('Need a token for getIdentity');
            defer.reject('Need a token for getIdentity');
            return defer.promise;
        }
        if (this.isValidToken(token, clientIp)) {
            var decoded = jwt.verify(token, nconf.get('accessToken:secret'));
            defer.resolve(decoded.username);
        } else {
            defer.reject(new Error('Could not find the identity'));
        }
        return defer.promise;
    },
    readOnlyDbConnection: function(req, res, next) {
        req.db = db.readOnlyConnection;
        req.db.accessLevel = 'Read-Only';
        next();
    },
    determineDbConnection: function(req, res, next) {
        // FIXME need to add logic for determineDbConnection
        req.db = db.readWriteConnection;
        req.db.accessLevel = 'Read-Write';
        //if (req.session && req.session.isAdmin) {
        //    req.db = db.readWriteConnection;
        //    req.db.accessLevel = 'Read-Write';
        //} else if (req.session) {
        //
        //}
        next();
    }
};
