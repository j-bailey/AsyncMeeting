"use strict";

var RouteError = function(errorCode, msg, runSilent){
    this.errorCode = errorCode || 500;
    this.msg = msg || 'Unknown error';
    this.runSilent = (runSilent === undefined)? false: runSilent;
};

module.exports = RouteError;