var jwt = require('jwt-simple');
var User = require('../../../../server/models/user');
var config = require('../../../../config');
var logger = require('winston');


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

var quickSearchForUser = function (req, res, next) {
    var serachCriteria = req.body.searchCriteria; /* jshint ignore:line */
    User.quickFind(serachCriteria).then(function(users){
        res.json(JSON.stringify(users));
    }).catch(function(err){
        logger.error('Error trying to do a quick search for user with search criteria: ' + serachCriteria + ' with error: ' + err);
        return next(err);
    });
};

module.exports = {
    getUserFromXAuthHeader: getUserFromXAuthHeader,
    createUser: createUser,
    quickSearchForUser: quickSearchForUser
};
