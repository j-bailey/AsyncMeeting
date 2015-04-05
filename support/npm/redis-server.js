module.exports = (function() {
    var redisServer = null;
    function start () {
        var fs = require('fs'),
            out = fs.openSync('./tmp/redis-server.log', 'a'),
            err = fs.openSync('./tmp/redis-server.log', 'a'),
            spawn = require('child_process').spawn;

        redisServer = spawn('redis-server', [], {
            detached: true,
            stdio: ['ignore', out, err]
        });

        redisServer.on('close', function (code, signal) {
            if (signal) {
                console.log('Redis server process terminated due to receipt of signal ' + signal);
            } else {
                console.log('Redis server process terminated normally');
            }
        });

        redisServer.unref();
    }

    function kill() {
        redisServer.kill();
    }

    function getProcessInfo() {
        return 'redis-server';
    }
    return {
        start: start,
        kill: kill,
        getProcessInfo: getProcessInfo
    }
})();