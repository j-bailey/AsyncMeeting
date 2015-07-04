var config = require('config'),
    jwt = require('jwt-simple'),
    logger = require('winston'),
    secUtils = require('./security/securityUtils');

module.exports = function (req, res, next) {
    if (req.headers['x-auth']) {
        req.auth = jwt.decode(req.headers['x-auth'], config.get('accessToken.secret'));
    } else {
        logger.error('Removed auth token');
        req.auth = undefined;
    }
    if (req.headers.authorization) {
        secUtils.getIdentity(req.headers.authorization.trim().split(' ')[1]).then(function(identity){
            req.session.userId = identity;
            next();
        });
    } else {
        next();
    }
};

