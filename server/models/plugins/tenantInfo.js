"use strict";

var mongoose = require('mongoose');

module.exports = exports = function tenantInfo(schema) {
    schema.add({
        tenantId: {type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, select:false}
    });
};

