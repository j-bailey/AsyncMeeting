"use strict";

module.exports = exports = function versionInfo(schema) {
    schema.add({ currentVersion: { type: String, default: '0.0.1' } });
    //TODO need to figure out the best way to handle the version number
};

