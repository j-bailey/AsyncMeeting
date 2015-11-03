exports.config = {
    baseUrl: 'http://localhost:3001',
    framework: 'cucumber',
    cucumberOpts: {
        format: 'pretty',
        tags:[
            '~@proxy_test','' +
            '~@element_comparison'
            ]
    },
    specs: [
        'test/e2e/features/**/*.feature'
    ],

    plugins: [{
        path: 'node_modules/grunt-protractor-runner/node_modules/protractor/plugins/timeline',

        // Output json and html will go in this folder.
        outdir: 'tmp/e2e/timelines'

        // Optional - if sauceUser and sauceKey are specified, logs from
        // SauceLabs will also be parsed after test invocation.
        //sauceUser: 'Jane',
        //sauceKey: 'abcdefg'
    }]

    //onPrepare: function () {
    //    process.env.PORT = 3001;
    //    require('./server')
    //}
};

