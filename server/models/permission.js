var mongoose = require('mongoose');
var createInfo = require('./plugins/creationInfo');
var modifiedOn = require('./plugins/modifiedOn');
var versionInfo = require('./plugins/versionInfo');

var permissionSchema = new mongoose.Schema({
        name: {type: String, required: true},
        description: {type: String, required: false}
    }
);



permissionSchema.plugin(modifiedOn);
permissionSchema.plugin(createInfo);
permissionSchema.plugin(versionInfo);


var Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;

