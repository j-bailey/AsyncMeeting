"use strict";

var logger = require('winston');
var nconf = require('nconf');
var jsonResponse = require('./../utils/jsonResponseWrapper');


function handleJsonErrorResponse(errMsg, httpCode, runSilent, res) {
    if (runSilent) {
        res.status(404).json(jsonResponse.errorResponse({}));
        return;
    }
    if (errMsg && httpCode) {
        return res.status(httpCode || 500).json(jsonResponse.errorResponse(errMsg));
    } else {
        return res.status(httpCode || 500).json(jsonResponse.errorResponse('Unknown error, please try again later'));
    }
}


module.exports.handleRouteErrors = function (err, req, res, next) {
    try {
        if (!err || !(err.name) || err.name !== 'RouteError' || res.headersSent) {
            return next(err);
        }
        var message = err.message,
            httpCode = err.httpCode,
            runSilent = err.runSilent;

        err.handled = true;

        if (req.headers.accept === 'application/json') {
            handleJsonErrorResponse(message, httpCode, runSilent, res);
            return;
        } else if (req.headers.accept === 'text/html') {
            res.status(httpCode || 500);
            res.render(nconf.get('errors:view'), {
                message: message
            });
            return;
        }
    } catch (e){
        logger.error('Fix router error handler NOW!!!');
        logger.error(e);
    }
    next();
};

module.exports.handleAclHttpErrors = function (err, req, res, next) {
    try {
        if (!err || !(err.errorCode && err.msg) || res.headersSent) {
            return next(err);
        }

        var message = err.msg,
            httpCode = err.errorCode;

        err.handled = true;

        if (req.headers.accept === 'application/json') {
            return handleJsonErrorResponse(message, httpCode, undefined, res);
        } else if (req.headers.accept === 'text/html') {
            res.status(err.httpCode || err.errorCode || err.status || 500);
            res.render(nconf.get('errors:view'), {
                message: err.msg || err.err.msg || err.message
            });
            return;
        }
    } catch (e){
        logger.error('Fix router error handler NOW!!!');
        logger.error(e);
    }
    next();
};

module.exports.handleGenericErrors = function (err, req, res, next) {
    try {
        if (!err || err.handled || res.headersSent) {
            return next(err);
        }

        var message = err.msg || err.err.msg || err.err.message,
            httpCode = err.httpCode || err.errorCode || err.status,
            stack = err.err.errors || err.err.stack;

        if (stack && nconf.get('NODE_ENV').toLowerCase() !== 'production') {
            logger.error(stack);
        }
        if (req.headers.accept === 'application/json') {
            return handleJsonErrorResponse(message, httpCode, undefined, res);
        } else if (req.headers.accept === 'text/html') {
            res.status(httpCode || 500);
            res.render(nconf.get('errors:view'), {
                message: message
            });
            return;
        }
    } catch (e){
        logger.error('Fix router error handler NOW!!!');
        logger.error(e);
    }
    next();
};
