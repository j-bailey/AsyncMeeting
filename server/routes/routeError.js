"use strict";

var RouteError = function(httpCode, msg, runSilent, sourceError){
    this.name = 'RouteError';
    this.httpCode = httpCode || 500;
    this.message = msg || 'Unknown error';
    this.sourceError = sourceError;
    Error.captureStackTrace(this);
    Error.call(this, msg);
    this.runSilent = (runSilent === undefined)? false: runSilent;
};

module.exports = RouteError;

