"use strict";

var RouteError = require('../routes/routeError');
var checkForValidObjectId = new RegExp("^[0-9a-fA-F]{24}$");

module.exports = {
    isValidObjectId: function (objectId) {
        return checkForValidObjectId.test(objectId);
    },
    throwErrorIfNotObjectId: function (objectId, allowNulls, msg) {
        allowNulls = allowNulls || false;
        if (allowNulls && objectId === null) {
            return;
        }
        if ((!checkForValidObjectId.test(objectId))) {
            throw new RouteError(400, msg || 'Not a valid ID');
        }
    }
};