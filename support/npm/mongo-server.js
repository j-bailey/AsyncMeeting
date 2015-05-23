module.exports = (function() {
    var mongoServer = null;
    function start () {
        var fs = require('fs'),
            nodeFs = require('node-fs'),
            path = require('path'),
            out = fs.openSync('./tmp/mongo-server.log', 'a'),
            err = fs.openSync('./tmp/mongo-server.log', 'a'),
            spawn = require('child_process').spawn;

        var dbPath = path.join('.', 'tmp', 'data', 'db');
        if (!fs.existsSync(dbPath)){
            nodeFs.mkdirSync(dbPath, 511, true);
        }

        mongoServer = spawn('mongod', ['--dbpath', path.join('.', 'tmp', 'data', 'db')], {
            detached: true,
            stdio: ['ignore', out, err]
        });

        mongoServer.on('close', function (code, signal) {
            if (signal) {
                console.log('MongoDB server process terminated due to receipt of signal ' + signal);
            } else {
                console.log('MongoDB server process normally');
            }
        });

        mongoServer.unref();
    }

    function kill() {
        mongoServer.kill();
    }

    function getProcessInfo() {
        return 'mongo-server';
    }

    return {
        start: start,
        kill: kill,
        getProcessInfo: getProcessInfo
    };
})();
