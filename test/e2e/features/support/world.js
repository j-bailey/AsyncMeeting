/**
 * Created by jlb on 4/12/15.
 */
module.exports = function() {

    console.log('[INFO] Using base URL = ' + browser.baseUrl);

    this.World = function World(callback) {
        callback(); // tell Cucumber we're finished and to use 'this' as the world instance
    };
}