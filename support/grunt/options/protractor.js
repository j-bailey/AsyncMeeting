/**
 * Created by jlb on 4/18/15.
 */
module.exports = {
    options: {
        configFile: __dirname + "../../../../protractor.conf.js", // Default config file
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
            baseUrl: 'localhost:3001'
        }
    },
    chrome: {
        options: {
            args: {
                browser: 'chrome',
                cucumberOpts: {
                    tags: '<%= cucumberTags %>'
                }
            }
        }
    },
    firefox: {
        options: {
            args: {
                browser: 'firefox',
                cucumberOpts: {
                    tags: '<%= cucumberTags %>'
                }
            }
        }
    },
    ie: {
        options: {
            args: {
                browser: 'ie',
                seleniumAddress: 'http://127.0.0.1:4444/wd/hub',
                cucumberOpts: {
                    tags: '<%= cucumberTags %>'
                }
            }
        }
    },
    phantomjs: {
        options: {
            args: {
                browser: 'phantomjs',
                seleniumAddress: 'http://127.0.0.1:<%= seleniumAddress %>/wd/hub',
                cucumberOpts: {
                    tags: '<%= cucumberTags %>'
                }
            }
        }
    },
    chromeNoTags: {
        options: {
            args: {
                browser: 'chrome'
            }
        }
    },
    firefoxNoTags: {
        options: {
            args: {
                browser: 'firefox'
            }
        }
    },
    ieNoTags: {
        options: {
            args: {
                browser: 'ie',
                seleniumAddress: 'http://127.0.0.1:4444/wd/hub'
            }
        }
    },
    phantomjsNoTags: {
        options: {
            args: {
                browser: 'phantomjs',
                seleniumAddress: 'http://127.0.0.1:<%= seleniumAddress %>/wd/hub'
            }
        }
    }
};
