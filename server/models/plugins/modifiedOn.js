var mongoose = require('mongoose');
module.exports = exports = function modifyInfo(schema, options) {
    schema.add({modifiedOn: {type: Date, default: Date.now}});
//    schema.add({createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}});
    schema.pre('save', function (next) {
        this.modifiedOn = Date.now();
        next();
    });
};

