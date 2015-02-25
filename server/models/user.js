var db = require('../db')
var schema = {
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: String
};
// Add static methods

// Add plugins


var user = db.Schema(schema);

module.exports = db.model('User', user)

