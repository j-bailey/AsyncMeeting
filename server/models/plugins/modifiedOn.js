"use strict";

module.exports = exports = function modifyInfo(schema) {
    schema.add({ modifiedOn: { type: Date, default: Date.now } });
    // TODO add user reference to modifiedOn schema element
//    schema.add({createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}});
    schema.pre('save', function (next) {
        this.modifiedOn = Date.now();
        next();
    });
};

