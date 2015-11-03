"use strict";
var nconf = require('nconf');

module.exports = {
    getMaxQueryLimit: function(id, requestedLimit){
        if (!requestedLimit){
            requestedLimit = nconf.get('query:maxQueryLimit:default');
        }
        var defaultMax = (nconf.get('query:maxQueryLimit:'+ id))? nconf.get('query:maxQueryLimit:'+ id): nconf.get('query:maxQueryLimit:default');
        return (requestedLimit > defaultMax)? defaultMax: requestedLimit;
    }
};