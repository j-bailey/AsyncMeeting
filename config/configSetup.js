"use strict";

var nconf = require('nconf');
require('nconf-redis');

nconf.overrides({type:'file', file:'overrides.json', dir:__dirname, search: true}); // nothing can override these settings
nconf.argv().env(); // command line over environment variables with overrides above them
if(process.env.configOverrideFile) {
    nconf.file('configOverrideFile', process.env.configOverrideFile); // Allows you to inject a settings file from the command line or env
}
nconf.file('base', { file:'base.json', dir:__dirname, search: true}); // this holds what is needed to connect to Redis
nconf.defaults({type:'file', file:'default.json', dir:__dirname, search: true});

