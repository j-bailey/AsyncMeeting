module.exports = function (grunt) {
    grunt.registerTask('start-redis-server', function () {
        grunt.task.run(['web-launch:61616:redis-server::5']);
    });

    grunt.registerTask('kill-redis-server', function () {
        grunt.task.run(['web-launch-kill:61616']);
    });

};