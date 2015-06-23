var spawn = require('child_process').spawnSync;

// TODO move from NPM

spawn('gulp', ['dev'], {
    detached: false,
    stdio: [ 'inherit', 'inherit', 'inherit' ],
    cwd: '.'
});

