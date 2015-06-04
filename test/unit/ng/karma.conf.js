module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'chai', 'sinon', 'sinon-chai'],
        files: [
            '../../../assets/underscore/underscore.js',
            '../../../assets/jquery/dist/jquery.js',
            '../../../assets/bootstrap/dist/js/bootstrap.js',
            '../../../assets/twitter-bootstrap-wizard/jquery.bootstrap.wizard.js',
            '../../../assets/angular/angular.js',
            '../../../assets/angular-cookies/angular-cookies.js',
            '../../../assets/angular-route/angular-route.js',
            '../../../assets/angular-mocks/angular-mocks.js',
            '../../../assets/angularjs-utilities/src/**/*.js',
            '../../../client/ng/asm.js',
            '../../../client/ng/modules/core/module.*.js',
            '../../../client/ng/modules/**/module.*.js',
            '../../../client/ng/**/*.js',
            '**/*.spec.js'
        ],
        exclude: [
        ],
        preprocessors: {
            '../../../client/ng/**/*.js': 'coverage'
        },
        coverageReporter: {
            type: 'html',
            dir: '../../../coverage/client-unit/'
        },
        reporters: ['progress', 'coverage'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome', 'Firefox', 'Safari', 'IE'],
        singleRun: false
    });
};

