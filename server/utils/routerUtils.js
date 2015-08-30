"use strict";

var logger = require('winston');
var nconf = require('nconf');
var jsonResponse = require('./jsonResponseWrapper');


function handleJsonErrorResponse(err, req, res) {
    if (err.runSilent) {
        res.status(404).json(jsonResponse.errorResponse({}));
        return;
    }
    if (err.msg && (err.errorCode || err.httpCode)) {
        var code = err.httpCode || err.errorCode;
        res.status(code || 500).json(jsonResponse.errorResponse(err.msg));
    } else {
        res.status(err.status || 500).json(jsonResponse.errorResponse('Unknown error, please try again later'));
    }
}


module.exports.handleErrors = function (err, req, res, next) {
    if (!err) {
        next();
    }
    if (err.errors && nconf.get('NODE_ENV').toLowerCase() !== 'production'){
        logger.error(err.errors);
    }
    if (err.message) {
        logger.error(err.message);
    }
    if (err.msg) {
        logger.error(err.msg);
    }
    if (err.stack && nconf.get('NODE_ENV').toLowerCase() !== 'production') {
        logger.error(err.stack);
    }
    if (req.headers.accept === 'application/json') {
        handleJsonErrorResponse(err, req, res);
    } else if (req.headers.accept === 'text/html') {
        res.status(err.status || 500);
        res.render(nconf.get('errors:view'), {
            message: err.msg || err.message
        });
    }
    next();

};
