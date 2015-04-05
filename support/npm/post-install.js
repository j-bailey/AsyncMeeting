var fs = require('fs');

if (!fs.existsSync('./logs')){
    fs.mkdirSync('./logs');
}