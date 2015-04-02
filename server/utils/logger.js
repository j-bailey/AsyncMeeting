var winston = require('winston');
var cfg = require('config');

winston.remove(winston.transports.Console);

winston.add(winston.transports.Console, {
    level: cfg.get("log.consoleLogLevel"),
    handleExceptions: true,
    json: false,
    colorize: true
});

winston.add(winston.transports.File, {
    level: cfg.get("log.fileLogLevel"),
    filename: cfg.get('log.directory') + "/" + cfg.get('log.fileName'),
    handleExceptions: true,
    json: true,
    maxsize: cfg.get('log.maxFileSize'), //5MB
    maxFiles: cfg.get('log.maxFiles'),
    colorize: false
});

module.exports = winston;