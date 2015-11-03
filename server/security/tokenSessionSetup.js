"use strict";

var logger = require('winston'),
    requestIp = require('request-ip'),
    secUtils = require('./../utils/securityUtils');

module.exports = function (req, res, next) {
    if (req.headers.authorization) {
        var clientIp = requestIp.getClientIp(req),
            userAgent = req.headers['user-agent'],
            token = req.headers.authorization.trim().split(' ')[1];
        secUtils.getContents(token, clientIp, userAgent).then(function (contents, err) {
            if (err) {
                logger.error(err);
                next(err);
            }
            if (!req.session) {
                req.session = {};
            }
            req.session.userId = contents.username; // required for ACL
            req.session.token = token;
            req.session.tenantId = contents.tId;
            req.session.userDbId = contents.uToken;
            next();
        }).catch(function (err) {
            logger.error(err);
            next(err);
        }).done();
    } else {
        req.session = {};
        next();
    }
};

