/**
 * Created by jlb on 4/12/15.
 */
module.exports = function() {
    var mongodb = require('mongodb'),
        cfg = require('config'),
        dbUrl = cfg.get("database.url"),
        self = this;

    console.log('[INFO] Using base URL = ' + browser.baseUrl);

    this.World = function World(callback) {
        mongodb.connect(dbUrl, function (error, db) {
            if (error) {
                throw error;
            }
            this.mongoDb = db;
            callback(); // tell Cucumber we're finished and to use 'this' as the world instance
        });

    };
}