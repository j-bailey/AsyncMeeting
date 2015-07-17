var nconf = require('nconf');
require('nconf-redis');

nconf.overrides({type:'file', file:'overrides.json', dir:__dirname, search: true}); // nothing can override these settings
nconf.argv().env(); // command line over environment variables with overrides above them
if(nconf.get('configOverrideFile')) {
    nconf.file('configOverrideFile', nconf.get('configOverrideFile')); // Allows you to inject a settings file from the command line or env
}
nconf.file('base', { file:'base.json', dir:__dirname, search: true}); // this holds what is needed to connect to Redis
nconf.use('redis', { host: nconf.get('redis:host'), port: nconf.get('redis:port'), ttl: 0, db:0 });  // bulk of the environment settings
nconf.defaults({type:'file', file:'default.json', dir:__dirname, search: true});

