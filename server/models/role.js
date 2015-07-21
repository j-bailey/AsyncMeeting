var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');

var schema = new mongoose.Schema({
        name: { type: String, required: true },
        description: { type: String, required: false }
    }
);

schema.plugin(modifiedOn);
schema.plugin(createInfo);
schema.plugin(versionInfo);

var Role = mongoose.model('Role', schema);

module.exports = Role;

//module.exports = schema;
