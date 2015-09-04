
var HandlerError = function(httpCode, msg){
    this.name = 'HandlerError';
    this.httpCode = httpCode || 500;
    this.message = msg || 'Unknown error';
    this.stack = (new Error()).stack;

    Error.captureStackTrace(this);
    Error.call(this, msg);
};

module.exports = HandlerError;
