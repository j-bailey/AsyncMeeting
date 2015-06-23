var config = require('config'),
    jwt = require('jwt-simple'),
    logger = require('winston');

module.exports = function (req, res, next) {
    if (req.headers['x-auth']) {
        req.auth = jwt.decode(req.headers['x-auth'], config.get('accessToken.secret'));
    } else {
        logger.error('Removed auth token');
        req.auth = undefined;
    }
    next();
};

