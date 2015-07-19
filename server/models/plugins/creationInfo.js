"use strict";

module.exports = exports = function creationInfo(schema) {
    schema.add({
        createdOn: {type: Date, default: Date.now}
        //createdBy: { type: String, required: true },
        //createdById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        //createdByUuid: { type: String, required: true }
    });
    schema.pre('validate', function (next) {
        this.createdOn = undefined;
        if (!this.isNew) {
            return next();
        }
        // TODO add user identity
        //this.createdBy = userName;
        //this.createdByUuid = userUuid;
        //this.createdById = userId;
        next();
    });
};

