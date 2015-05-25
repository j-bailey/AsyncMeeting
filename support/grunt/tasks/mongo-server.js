
module.exports = function(grunt) {
    grunt.registerTask('start-mongo-server', function() {
        var fs = require('fs'),
            nodeFs = require('node-fs'),
            path = require('path');

        var dbPath = path.join('.', 'tmp', 'data', 'db');
        if (!fs.existsSync(dbPath)) {
            nodeFs.mkdirSync(dbPath, 511, true);
        }

        grunt.task.run(['file-launch:mongo:mongod:[\'--dbpath\', \'' + dbPath + '\']']);
    });

    grunt.registerTask('kill-mongo-server', function() {
        grunt.task.run(['file-launch-kill:mongo']);
    });

};
