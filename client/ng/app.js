(function (angular, asm) {
    'use strict';

    angular.module(asm.modules.app.name, [
        'ngRoute', 'ngCookies',
        asm.modules.core.name,
        asm.modules.auth.name,
        asm.modules.admin.name,
        asm.modules.pages.name,
        asm.modules.meetingareas.name,
        asm.modules.register.name,
        asm.modules.home.name
    ]);
}(angular, asm));