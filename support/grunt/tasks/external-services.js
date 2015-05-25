module.exports = function (grunt) {
    grunt.registerTask('start-external-services', function () {
        grunt.task.run([
            'start-redis-server',
            'start-mongo-server'
        ]);
    });

    grunt.registerTask('kill-external-services', function () {
        grunt.task.run([
            'kill-redis-server',
            'kill-mongo-server'
        ]);
    });

};
