"use strict";

var logger = require('winston'),
    secUtils = require('./security/securityUtils');

module.exports = function (req, res, next) {
    if (req.headers.authorization) {
        secUtils.getIdentity(req.headers.authorization.trim().split(' ')[1]).then(function(identity){
            req.session.userId = identity;
            next();
        }).catch(function(err){
            logger.error(err);
        });
    } else {
        next();
    }
};

