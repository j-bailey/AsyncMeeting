var logger = require('winston');

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
    logErrors: logErrors,
    clientErrorHandler: clientErrorHandler,
    errorHandler: errorHandler
};

