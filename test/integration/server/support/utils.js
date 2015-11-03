
require('../../../../server/models/user');

var Q = require('q'),
    db = require('../../../../server/db'),
    User = db.readWriteConnection.model('User');

global.getUserWithTentantIdByUserId = function (userId) {
    var defer = Q.defer();
    User.findById(userId).select('+tenantId').lean().exec(function (err, savedUser) {
        if (err) {
            return defer.reject(err);
        }
        defer.resolve(savedUser);
    });
    return defer.promise;
};

global.loginToServer = function (user, email, password) {
    var defer = Q.defer();
    user
        .post('/email-login')
        .set('Accept', 'application/json, text/plain, */*')
        .set('Accept-encoding', 'gzip, deflate')
        .set('Content-type', 'application/json;charset=UTF-8')
        .send({email: email, password: password})
        .end(function (err, res) {
            // user1 will manage its own cookies
            // res.redirects contains an Array of redirects
            if (err) {
                return defer.reject(err);
            }
            defer.resolve(res.body.access_token);
        });
    return defer.promise;
};
