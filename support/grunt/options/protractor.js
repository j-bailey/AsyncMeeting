/**
 * Created by jlb on 4/18/15.
 */
module.exports = {
    options: {
        configFile: __dirname + "/../../../protractor.conf.js", // Default config file
        keepAlive: false, // If false, the grunt process stops when the test fails.
        noColor: false // If true, protractor will not use colors in its output.
    },
    chrome: {
        options: {
            args: {
                baseUrl: '<%= baseUrl %>',
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
                baseUrl: '<%= baseUrl %>',
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
                baseUrl: '<%= baseUrl %>',
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
                baseUrl: '<%= baseUrl %>',
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
                baseUrl: '<%= baseUrl %>',
                browser: 'chrome'
            }
        }
    },
    firefoxNoTags: {
        options: {
            args: {
                baseUrl: '<%= baseUrl %>',
                browser: 'firefox'
            }
        }
    },
    ieNoTags: {
        options: {
            args: {
                baseUrl: '<%= baseUrl %>',
                browser: 'ie',
                seleniumAddress: 'http://127.0.0.1:4444/wd/hub'
            }
        }
    },
    phantomjsNoTags: {
        options: {
            args: {
                baseUrl: '<%= baseUrl %>',
                browser: 'phantomjs',
                seleniumAddress: 'http://127.0.0.1:<%= seleniumAddress %>/wd/hub'
            }
        }
    }
};
