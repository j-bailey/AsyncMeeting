module.exports = function (config) {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'chai', 'sinon-chai'],
        files: [
            'assets/underscore/underscore.js',
            'assets/jquery/dist/jquery.js',
            'assets/bootstrap/dist/js/bootstrap.js',
            'assets/twitter-bootstrap-wizard/jquery.bootstrap.wizard.js',
            'assets/angular/angular.js',
            'assets/angular-cookies/angular-cookies.js',
            'assets/angular-route/angular-route.js',
            'assets/angular-mocks/angular-mocks.js',
            'assets/angularjs-utilities/src/**/*.js',
            'client/ng/asm.js',
            'client/ng/modules/core/module.*.js',
            'client/ng/modules/**/module.*.js',
            'client/ng/**/*.js',
            'test/ng/**/*.spec.js'
        ],
        exclude: [
            'test/ng/**/post*.js'
        ],
        coverageReporter: {
            type: 'text-summary',
            dir: 'coverage/'
        },
        reporters: ['progress', 'coverage'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: false
    })
}

