/**
 * Created by jlb on 4/19/15.
 */

var fs = require("fs"),
    path = require('path'),
    spawn = require('child_process').spawn;

var childProcess,
    args = process.argv.slice(2),
    processFile = args[0],
    cmd = args[1],
    cmdArgs = args.slice(2);

console.log('cmdArgs = ' + cmdArgs);

childProcess = spawn(cmd, cmdArgs, {
    detached: false,
    stdio: 'inherit',
    env: process.env
});

childProcess.on('close', function(code, signal) {
    console.log('child process terminated due to receipt of code ' + code + ' and signal ' + signal);
});
childProcess.on('exit', function (code) {
    console.log('child process terminated due to receipt of code ' + code);
});


fs.watch(path.dirname(processFile), function(event){
    console.log('Watch file event: ' + event + ' exists ' + fs.existsSync(processFile) );
    if (!fs.existsSync(processFile)){
        console.log('killing process');
        childProcess.kill();
        setTimeout(process.exit(0), 5000);
    }
});
