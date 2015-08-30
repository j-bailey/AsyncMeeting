
module.exports = {
    catchError: function(err, msg, httpCode){
        var e = err || {};
        return {err: e, msg: msg, httpCode: httpCode};
    }
};