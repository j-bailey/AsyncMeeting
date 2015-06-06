var jwt = require('jwt-simple');
var User = require('../../../../server/models/user');
var config = require('../../../../config');

var getUserFromXAuthHeader = function (req, res, next) {
    if (!req.headers['x-auth']) {
        return res.send(401);
    }
    var auth = jwt.decode(req.headers['x-auth'], config.secret);
    User.findOne({ username: auth.username }, function (err, user) {
        if (err) {
            return next(err);
        }
        res.json(user);
    });
};

var createUser = function (req, res, next) {
    var user = new User({ username: req.body.username }),
       hashedPassword = User.hashPassword(req.body.password); /* jshint ignore:line */
    user.password = hashedPassword;
    user.save(function (err) {
        if (err) {
            return next(err);
        }
        res.send(201);
    });
};

module.exports = {
    getUserFromXAuthHeader: getUserFromXAuthHeader,
    createUser: createUser
};
