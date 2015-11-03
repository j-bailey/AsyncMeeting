"use strict";

var httpCodeMessageMatrix = {
    404: 'Not Found',
    500: 'Internal Server Error'
};

var RouteError = function(httpCode, msg, runSilent, sourceError){
    this.name = 'RouteError';
    this.httpCode = httpCode || 500;
    this.message = msg || httpCodeMessageMatrix[httpCode] || 'Unknown error';
    this.sourceError = sourceError;
    // TODO figure out how best to handle stacktrace and proper error construction
    //try {
    //    Error.captureStackTrace(this);
    //    Error.call(this, msg);
    //} catch (e){
    //    logger.error(err);
    //}
    this.runSilent = (runSilent === undefined)? false: runSilent;
};

module.exports = RouteError;

