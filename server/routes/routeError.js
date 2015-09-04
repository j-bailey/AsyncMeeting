"use strict";

var RouteError = function(errorCode, msg, runSilent){
    this.name = 'RouteError'
    this.errorCode = errorCode || 500;
    this.message = msg || 'Unknown error';
    this.stack = (new Error()).stack;
    this.runSilent = (runSilent === undefined)? false: runSilent;
};

RouteError.prototype = new Error;

module.exports = RouteError;

