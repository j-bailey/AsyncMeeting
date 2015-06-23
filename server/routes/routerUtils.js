var logger = require('winston');

var secureTokenCheck = function (req, res, next){
    if (!req.auth) {
        logger.error('Require auth token to continue');
        next('Requires auth token to continue.');
    }
    next();
};

var logErrors = function(err, req, res, next) {
    logger.error(err.stack);
    next(err);
};

var clientErrorHandler = function(err, req, res, next) {
    if (req.xhr) {
        res.status(500).send({ error: 'Something blew up!' });
    } else {
        next(err);
    }
};

var errorHandler = function(err, req, res, next) {
    res.status(500);
    res.render('error', { error: err });
    next();
};

module.exports = {
    secureTokenCheck: secureTokenCheck,
    logErrors: logErrors,
    clientErrorHandler: clientErrorHandler,
    errorHandler: errorHandler
};
