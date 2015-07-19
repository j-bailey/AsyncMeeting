"use strict";

module.exports = exports = function modifyInfo(schema) {
    schema.add({
        modifiedOn: {type: Date, default: Date.now}
        //modifiedBy: {type: String, default: 'UNKNOWN', required: true},
        //modifiedById: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
        //modifiedByUuid: {type: String, required: true}
    });
    schema.pre('validate', function (next) {
        this.modifiedOn = Date.now();
        // TODO add user identity
        //this.modifiedBy = userName;
        //this.modifiedByUuid = userUuid;
        //this.modifiedById = userId;
        next();
    });
};

