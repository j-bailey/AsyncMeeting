exports.config = {
    framework: 'cucumber',
    cucumberOpts: {
        format: 'pretty'
//        tags: '@dev',
//        require: 'test/e2e/features/step_definitions/steps.js'
    },
    specs: [
        'test/e2e/features/**/*.feature'
    ],



    //framework: 'mocha',
    //specs: [
    //    'test/e2e/**/*.spec.js'
    //],
    //mochaOpts: {
    //    enableTimeouts: false
    //},

    plugins: [{
        path: 'node_modules/protractor/plugins/timeline',

        // Output json and html will go in this folder.
        outdir: 'assets/timelines'

        // Optional - if sauceUser and sauceKey are specified, logs from
        // SauceLabs will also be parsed after test invocation.
        //sauceUser: 'Jane',
        //sauceKey: 'abcdefg'
    }],

    onPrepare: function () {
        process.env.PORT = 3001
        require('./server')
    }

    //capabilities: {
    //    'browserName' : 'chrome'
    //}
    //
    //multiplecapabilities: [{
    //    'browserName' : 'firefox'
    //}, {
    //    'browserName' : 'chrome'
    //}]
}

