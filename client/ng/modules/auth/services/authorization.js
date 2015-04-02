(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.auth.name).factory(asm.modules.auth.services.authorization, [
        asm.modules.auth.services.authentication,
        function (authentication) {
            function authorize (loginRequired, requiredPermissions, permissionCheckType) {
                var result = asm.modules.auth.enums.authorised.authorised,
                    user = authentication.getCurrentLoginUser(),
                    testVar = authentication.testVar,
                    loweredPermissions = [],
                    hasPermission = true,
                    permission, i;

                console.log("user is " + (user !== undefined ? user.username : user));

                permissionCheckType = permissionCheckType || asm.modules.auth.enums.permissionCheckType.atLeastOne;
                if (loginRequired === true && user === undefined) {
                    result = asm.modules.auth.enums.authorised.loginRequired;
                } else if ((loginRequired === true && user !== undefined) &&
                    (requiredPermissions === undefined || requiredPermissions.length === 0)) {
                    // Login is required but no specific permissions are specified.
                    result = asm.modules.auth.enums.authorised.authorised;
                } else if (requiredPermissions) {
                    loweredPermissions = [];
                    angular.forEach(user.permissions, function (permission) {
                        loweredPermissions.push(permission.toLowerCase());
                    });

                    for (i = 0; i < requiredPermissions.length; i += 1) {
                        permission = requiredPermissions[i].toLowerCase();

                        if (permissionCheckType === asm.modules.auth.enums.permissionCheckType.combinationRequired) {
                            hasPermission = hasPermission && loweredPermissions.indexOf(permission) > -1;
                            // if all the permissions are required and hasPermission is false there is no point carrying on
                            if (hasPermission === false) {
                                break;
                            }
                        } else if (permissionCheckType === asm.modules.auth.enums.permissionCheckType.atLeastOne) {
                            hasPermission = loweredPermissions.indexOf(permission) > -1;
                            // if we only need one of the permissions and we have it there is no point carrying on
                            if (hasPermission) {
                                break;
                            }
                        }
                    }

                    result = hasPermission ? asm.modules.auth.enums.authorised.authorised : asm.modules.auth.enums.authorised.notAuthorised;
                }

                return result;
            }

            return {
                authorize: authorize
            };
        }]);
}(angular, asm));