var HandlerError = function(httpCode, msg){
    this.httpCode = httpCode;
    this.msg = msg;

    Error.captureStackTrace(this);
    Error.call(this, msg);
};

module.exports = HandlerError;
