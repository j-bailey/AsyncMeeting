"use strict";

var logger = require('winston');
var nconf = require('nconf');
var jsonResponse = require('./../utils/jsonResponseWrapper');


function handleJsonErrorResponse(err, req, res) {
    if (err.runSilent) {
        res.status(404).json(jsonResponse.errorResponse({}));
        return;
    }
    if ((err.msg || err.err.msg) && (err.errorCode || err.httpCode)) {
        var code = err.httpCode || err.errorCode;
        res.status(code || 500).json(jsonResponse.errorResponse(err.msg || err.err.msg));
    } else {
        res.status(err.status || 500).json(jsonResponse.errorResponse('Unknown error, please try again later'));
    }
}


module.exports.handleErrors = function (err, req, res, next) {
    try {
        if (!err) {
            next();
        }
        if (err.err && err.err.errors && nconf.get('NODE_ENV').toLowerCase() !== 'production') {
            logger.error(err.errors);
        }
        if (err.err && err.err.message) {
            logger.error(err.err.message);
        }
        if (err.err && err.err.msg) {
            logger.error(err.err.msg);
        }
        if (err.msg) {
            logger.error(err.msg);
        }
        if (err.err && err.err.stack && nconf.get('NODE_ENV').toLowerCase() !== 'production') {
            logger.error(err.err.stack);
        }
        if (req.headers.accept === 'application/json') {
            handleJsonErrorResponse(err, req, res);
        } else if (req.headers.accept === 'text/html') {
            res.status(err.httpCode || err.errorCode || err.status || 500);
            res.render(nconf.get('errors:view'), {
                message: err.msg || err.err.msg || err.message
            });
        }
    } catch (e){
        logger.error('Fix router error handler NOW!!!');
        logger.error(e);
    }
    next();
};
