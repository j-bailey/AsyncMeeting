angular.module('app').directive('access', [
    'authorization',
    function (authorization) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var makeVisible = function () {
                        element.removeClass('hidden');
                    },
                    makeHidden = function () {
                        element.addClass('hidden');
                    },
                    determineVisibility = function (resetFirst) {
                        var result;
                        if (resetFirst) {
                            makeVisible();
                        }

                        result = authorization.authorize(true, roles, attrs.accessPermissionType);
                        if (result === jcs.modules.auth.enums.authorised.authorised) {
                            makeVisible();
                        } else {
                            makeHidden();
                        }
                    },
                    roles = attrs.access.split(',');


                if (roles.length > 0) {
                    determineVisibility(true);
                }
            }
        };
    }]);
