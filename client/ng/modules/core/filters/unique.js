/* globals angular, asm */
(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.core.name).filter(asm.modules.core.filters.unique, [
        function (data, propertyName) {
            if (angular.isArray(data) && angular.isString(propertyName)) {
                var results = [];
                var keys = {};
                for (var i = 0; i < data.length; i += 1) {
                    var val = data[i][propertyName];
                    if (angular.isUndefined(keys[val])) {
                        keys[val] = true;
                        results.push(val);
                    }
                }
                return results;
            } else {
                return data;
            }
        }
    ]);
}(angular, asm));


