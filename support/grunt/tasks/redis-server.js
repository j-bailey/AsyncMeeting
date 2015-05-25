module.exports = function (grunt) {
    grunt.registerTask('start-redis-server', function () {
        grunt.task.run(['file-launch:redis:redis-server::5']);
    });

    grunt.registerTask('kill-redis-server', function () {
        grunt.task.run(['file-launch-kill:redis']);
    });

};
