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
    generateAccessToken: function (identity, tenantId, basePermissions, clientIp, userAgent, userDbId) {
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
            userAgent: userAgent,
            tId: tenantId,
            uToken: userDbId
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
    getContents: function (token, clientIp, userAgent) {
        var defer = Q.defer();
        if (!token) {
            logger.error('Need a token for getContents');
            defer.reject('Need a token for getContents');
            return defer.promise;
        }
        if (this.isValidToken(token, clientIp, userAgent)) {
            var decoded = jwt.verify(token, nconf.get('accessToken:secret'));
            defer.resolve(decoded);
        } else {
            defer.reject(new Error('Could not get the contants'));
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
    isAllowedResourceAccess: function (resourceKey, allowNulls) {
        return function (req, res, next) {
            var resourceId,
                controlledResource;

            if (!resourceKey) {
                logger.debug('Require resourceKey for isAllowedToResourceBasedOnUrlQueryValue');
                return next(new RouteError(401, 'Not allowed', false));
            }
            if (req.query && req.query[resourceKey]){
               resourceId  = req.query[resourceKey]
            } else if (req.body && req.body[resourceKey]){
                resourceId = req.body[resourceKey]
            } else if (req.params && req.params[resourceKey]) {
                resourceId = req.params[resourceKey];
            } else {
                logger.debug('No acceptable ways to retrieve resource value for key "' + resourceKey + '" in isAllowedToResourceBasedOnUrlQueryValue');
                return next(new RouteError(401, 'Not allowed', false));
            }

            if (allowNulls && (resourceId === null || resourceId === 'null')) {
                controlledResource = req.baseUrl;
            } else {
                controlledResource = req.baseUrl + '/' + resourceId;
            }
            acl.isAllowed(req.session.userId, controlledResource, req.method.toLowerCase(), function (err, allow) {
                if (err) {
                    logger.error(err);
                    return next(err);
                }
                if (allow) {
                    return next();
                } else {
                    logger.warn('This combo is not allowed: ' + req.session.userId + ' - ' + req.baseUrl + ' - ' + req.method);
                    if (req.baseUrl.indexOf('meetingarea') >= 0 && (resourceId !== null || resourceId !== 'null') ) {
                        var MeetingArea = db.readOnlyConnection.model('MeetingArea');
                        MeetingArea.findById(resourceId)
                            .select('+tenantId')
                            .exec(function (err, meetingArea) {
                            if (err){
                                logger.error('Could not find meeting area for ID: ' + resourceId);
                                logger.debug(err);
                                return next(new RouteError(401, 'Not allowed', false));
                            }
                            if (!meetingArea){
                                logger.error('Could not find meeting area for ID: ' + resourceId);
                                return next(new RouteError(401, 'Not allowed', false));
                            }
                            var UserAllowedResources = db.readOnlyConnection.model('UserAllowedResources');
                            UserAllowedResources.find({username: req.session.userId})
                                .and({tenantId: meetingArea.tenantId})
                                .exec(function (err, allowedResources) {
                                    if (err) {
                                        return next(err);
                                    }
                                    if (allowedResources && allowedResources.length > 0) {
                                        allowedResources.forEach(function (allowedResource) {
                                            meetingArea.ancestors.forEach(function (ancestor) {
                                                if (allowedResource.resourceId.toString() === ancestor.toString()) {
                                                    controlledResource = req.baseUrl + '/' + ancestor.toString();
                                                    acl.isAllowed(req.session.userId, controlledResource, req.method.toLowerCase(), function (err, allow) {
                                                        if (err) {
                                                            logger.error(err);
                                                            return next(err);
                                                        }
                                                        if (allow) {
                                                            return next();
                                                        } else if (allowedResources[allowedResources.length-1] === allowedResource &&
                                                        meetingArea.ancestors[meetingArea.ancestors.length-1] === ancestor){
                                                            return next(new RouteError(401, 'Not allowed', false));
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    } else {
                                        return next(new RouteError(401, 'Not allowed', false));
                                    }
                                })
                        });
                    } else {
                        return next(new RouteError(401, 'Not allowed', false));
                    }
                }
            });
        };
    }
};