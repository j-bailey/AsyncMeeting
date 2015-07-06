var nodeUuid = require('node-uuid');

module.exports = exports = function uuid(schema) {
    schema.add({ uuid: { type: String, unique: true, require: true} });
    schema.pre('validate', function(next) {
        if (!this.uuid || this.uuid === null) {
            var uuid = nodeUuid.v4();
            console.log('uuid = ' + uuid);
            this.uuid = uuid;
        }
        //this.count({ 'uuid': uuid}, function (err, count) {
        //        if (err){
        //            logger.error('error in findPublicUserByUserName with with ' + err);
        //            defer.reject(err);
        //        }
        //        defer.resolve(user);
        //    });

        next();
    });
};

