/**
 * Created by jlb on 4/18/15.
 */

module.exports = function(grunt){
    grunt.registerTask('e2e', function (testBrowser, proxy) {
        var fs = require('fs'),
            path = require('path');
        var browser = (testBrowser || 'phantomjs').toLowerCase();
        var manageSeleniumDriver = ['phantomjs', 'ie'].indexOf(browser) >= 0;
        var runInjectionProxy = proxy;

        var dbPath = path.join('.', 'tmp', 'data', 'db');
        if (!fs.existsSync(dbPath)){
            nodeFs.mkdirSync(dbPath, 511, true);
        }
        process.env.PORT = 3001;
        process.env.NODE_ENV= 'test';

        grunt.task.run([
            'web-launch:61616:redis-server::5',
            'web-launch:62626:mongod:[\'--dbpath\', \'' + dbPath + '\']',
            'web-launch:63636:gulp:[\'test|server\']']);

        if (runInjectionProxy) {
            grunt.task.run(['run-injection-proxy']);
            grunt.config.set('cucumbertags', '@proxy_test');
        }

        if (manageSeleniumDriver) {
            grunt.task.run(['launch-selenium:' + browser]);
        }

        grunt.task.run(['protractor:' + browser]);

        if (manageSeleniumDriver) {
            grunt.task.runt(['kill-selenium:' + browser]);
        }
        grunt.task.run(['web-launch-kill:61616', 'web-launch-kill:62626', 'web-launch-kill:63636']);
    });

    grunt.task.registerTask('launch-selenium', function(){
        grunt.log.writeln('Launching...');
    })
};