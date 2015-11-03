"use strict";

module.exports = {
    catchError: function(err, msg, httpCode){
        var e = err || {};
        if (err.name === 'RouteError' || err.name === 'ValidationError') {
            return err;
        } else {
            return {err: e, msg: msg, httpCode: httpCode};
        }
    }
};