module.exports = function (grunt) {
    grunt.registerTask('redis-install', function () {
        var fs = require('fs');
        var url = require('url');
        var http = require('http');
        var done = this.async(),
            redisVer = 'redis-3.0.2',
            fileName = redisVer + '.tar.gz',
            fileUrl = 'http://download.redis.io/releases/' + fileName,
            downloadDir = './node_modules/redis-install/';


        if (fs.existsSync(downloadDir + fileName)) {
            console.log('file already exists, so ending task');
            return;
        }
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir);
        }

        var options = {
            host: url.parse(fileUrl).host,
            port: 80,
            path: url.parse(fileUrl).pathname
        };

        var file = fs.createWriteStream(downloadDir + fileName);


        http.get(options, function (res) {
            res.on('data', function (data) {
                file.write(data);
            }).on('end', function () {
                file.end();

                grunt.task.run([
                    'file-launch:tarRedis:tar:[\'xzf\', \'' + downloadDir + fileName + '\', \'-C\', \'' + downloadDir + '\']:5',
                    'file-launch-kill:tarRedis'
                ]);

                done();
            });
        });
        return done;
    });
    grunt.registerTask('start-redis-server', function() {
        var path = require('path');

        var redisCmd = path.normalize(path.join(__dirname, '..', '..', '..', 'node_modules', 'redis-install', 'redis-3.0.2', 'src', 'redis-server'));
        grunt.task.run(['file-launch:redis:' + redisCmd + ':']);
    });

    grunt.registerTask('kill-redis-server', function() {
        grunt.task.run(['file-launch-kill:redis']);
    });

};