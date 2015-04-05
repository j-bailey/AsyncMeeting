var fs = require('fs');

if (!fs.existsSync('./logs')){
    fs.mkdirSync('./logs');
}

if (!fs.existsSync('./tmp')){
    fs.mkdirSync('./tmp');
}
