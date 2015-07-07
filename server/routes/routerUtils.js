var logger = require('winston');
var cfg = require('config');


function handleJsonErrorResponse(err, req, res, next){
    if(err.msg && err.errorCode){
        res.status(err.errorCode || 500).json({status:err.errorCode, msg:err.msg});
    } else {
        res.status(err.status || 500).json({status:500, msg:'Unknown error, please try agian later'});
    }
    next();
}


module.exports.handleErrors = function (err, req, res, next) {
        if (!err) {
            next();
        }
        if (err.message) {
            logger.error(err.message);
        }
        if (err.msg){
            logger.error(err.msg);
        }
        if (err.stack){
            logger.error(err.stack);
        }
        if (req.headers.accept === 'application/json') {
            handleJsonErrorResponse(err, req, res, next);
        } else if (req.headers.accept === 'text/html'){
            res.status(err.status || 500);
            res.render(cfg.get('errors.view'), {
                message: err.message,
                error: err
            });
        }
        next();

    };
