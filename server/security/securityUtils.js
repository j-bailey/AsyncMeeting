"use strict";

var acl = require('../security/acl').getAcl(),
    logger = require('winston'),
    nconf = require('nconf'),
    jwt = require('jsonwebtoken'),
    db = require('../db'),
    RouteError = require('../routes/routeError'),
    Q = require('q');

var releaseTokenCache = {};

module.exports = {
    generateAccessToken: function (identity, basePermissions, clientIp, userAgent) {
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
            clientIp: clientIp,
            userAgent: userAgent
        };
        try {
            var token = jwt.sign(jwtPayload, nconf.get('accessToken:secret'), jwtOptions);
            defer.resolve(token);
        } catch (e) {
            logger.error('Failed to create JWT token');
            defer.reject(new Error('Unable to create token'));
        }
        return defer.promise;
    },
    releaseAccessToken: function (token) {
        releaseTokenCache[token] = token;
    },
    isValidToken: function (token, clientIp, userAgent) {
        var defer = Q.defer();
        var decoded;
        var validateIp = nconf.get('accessToken:bindToClientIp'),
            validateUserAgent = nconf.get('accessToken:bindToClientUserAgent');
        if (validateIp && (!clientIp || clientIp === null || clientIp === '')) {
            logger.error('Need a client IP for isValidToken');
            defer.reject('Need a client IP for isValidToken');
            return defer.promise;
        }
        if (validateUserAgent && (!userAgent || userAgent === null || userAgent === '')) {
            logger.error('Need a client User Agent for isValidToken');
            defer.reject('Need a client User Agent for isValidToken');
            return defer.promise;
        }
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
        if (releaseTokenCache.token) {
            defer.resolve(false);
        } else if (validateIp && decoded && decoded.clientIp === clientIp && validateUserAgent && decoded.userAgent === userAgent) {
            defer.resolve(true);
        } else if (validateIp && decoded && decoded.clientIp === clientIp && !validateUserAgent) {
            defer.resolve(true);
        } else if (!validateIp && decoded && validateUserAgent && decoded.userAgent === userAgent) {
            defer.resolve(true);
        } else if (!validateIp && decoded && !validateUserAgent) {
            defer.resolve(true);
        } else {
            defer.resolve(false);
        }
        return defer.promise;
    },
    getIdentity: function (token, clientIp, userAgent) {
        var defer = Q.defer();
        if (!token) {
            logger.error('Need a token for getIdentity');
            defer.reject('Need a token for getIdentity');
            return defer.promise;
        }
        if (this.isValidToken(token, clientIp, userAgent)) {
            var decoded = jwt.verify(token, nconf.get('accessToken:secret'));
            defer.resolve(decoded.username);
        } else {
            defer.reject(new Error('Could not find the identity'));
        }
        return defer.promise;
    },
    readOnlyDbConnection: function (req, res, next) {
        req.db = db.readOnlyConnection;
        req.db.accessLevel = 'Read-Only';
        next();
    },
    determineDbConnection: function (req, res, next) {
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
    },
    isAllowedToResourceBasedOnUrlQueryValue: function (queryKey, allowNulls) {
        return function (req, res, next) {
            var queryValue = req.query[queryKey],
                controlledResource;
            if (allowNulls && (queryValue === null || queryValue === 'null')) {
                controlledResource = req.baseUrl;
            } else {
                controlledResource = req.baseUrl + '/' + queryValue;
            }
            acl.isAllowed(req.session.userId, controlledResource, req.method.toLowerCase(), function (err, allow) {
                if (err) {
                    logger.error(err);
                    next(err);
                }
                if (allow) {
                    next();
                } else {
                    logger.warn('This combo is not allowed: ' + req.session.userId + ' - ' + req.baseUrl + ' - ' + req.method);
                    next(new RouteError(401, 'Not allowed', false));
                }
            });
        };
    }
};
