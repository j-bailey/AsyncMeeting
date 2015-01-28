var jwt = require('jwt-simple')
var config = require('./config')

module.exports = function (req, res, next) {
    // TODO SECURITY ISSUE: fix code or logger, since an error here will only show up in the response and not the server log
    if (req.headers['x-auth']) {
        req.auth = jwt.decode(req.headers['x-auth'], config.secret)
    }
    next()
}

