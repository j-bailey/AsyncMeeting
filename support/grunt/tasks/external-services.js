module.exports = function (grunt) {
    grunt.registerTask('start-external-services', function () {
        grunt.task.run([
            'start-mongo-server',
            'start-redis-server'
        ]);
    });

    grunt.registerTask('kill-external-services', function () {
        grunt.task.run([
            'kill-mongo-server',
            'kill-redis-server'
        ]);
    });

};
