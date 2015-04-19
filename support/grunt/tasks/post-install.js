module.exports = function(grunt) {

    var fs = require('fs');

    grunt.registerTask('post-install', function() {
        if (!fs.existsSync('./logs')) {
            fs.mkdirSync('./logs');
        }

        if (!fs.existsSync('./tmp')) {
            fs.mkdirSync('./tmp');
        }
    });
};