//var bcrypt = require('bcrypt');
//var jwt = require('jsonwebtoken');
//var User = require('../../../../server/models/user');
//var securityUtils = require('../../../../server/security/securityUtils');
//exports.create = function (username, password, cb) {
//    var user = new User({ username: username });
//    bcrypt.hash(password, 10, function (err, hash) {
//        if (err) return cb(err);
//        user.password = hash;
//        user.save(function (err) {
//            if (err) return cb(err);
//            user.token = securityUtils.getAuthToken(user.username);
//            cb(null, user)
//        })
//    })
//};
//
