(function (angular, asm) {
    'use strict';

    /**
     * @ngdoc service
     * @name asm-meetingareas.breadcrumbService
     * @requires $log
     *
     * @description
     * Provides breadcrumb services for the UI.
     */
    angular.module(asm.modules.meetingareas.name)
        .factory(asm.modules.meetingareas.services.breadcrumbService, [
            '$rootScope',
            '$location',
            '$route',
            '$log',
            function ($rootScope, $location, $route, $log) {
                var BreadcrumbService = {
                    breadcrumbs: [],
                    getBreadcrumbs: function() {
                        return this.breadcrumbs;
                    },
                    // Set the label for the current route.
                    setLabel: function(label) {
                        this.breadcrumbs[this.breadcrumbs.length-1].label = label;
                    },
                    generateBreadcrumbs: function() {
                        // Get current path
                        var currentPath = $location.path();

                        // Check if current path is equal to any previous path in the breadcrumb trail.
                        // If it is, remove all paths down to the path found, otherwise push it onto the trail.
                        var pathElements = currentPath.trim().split('/');
                        var currentPathLabel = pathElements[pathElements.length-1];
                        $log.debug("currentPathLabel is " + currentPathLabel);
                        if ( currentPathLabel.substring(0,1) === ":" ) {
                            return;
                        }

                        if ( this.breadcrumbs.length == 0 ) {
                            this.breadcrumbs.push({path: currentPath, label: currentPathLabel});
                        }
                        else {
                            var breadcrumb = {path: currentPath, label: currentPathLabel};
                            var indexOfExistingBreadcrumb = -1;

                            // Find existing breadcrumb if one exists with the path.
                            _.each(this.breadcrumbs, function(data, idx) {
                                if (data.path === breadcrumb.path) {
                                    indexOfExistingBreadcrumb = idx;
                                    return;
                                }
                            });

                            // Add to breadcrumbs if not currently there.
                            if (indexOfExistingBreadcrumb === -1) {
                                this.breadcrumbs.push(breadcrumb);
                            }
                            else {
                                // Cut the array down to where path was found.
                                this.breadcrumbs = this.breadcrumbs.splice(0, indexOfExistingBreadcrumb + 1);
                            }
                        }
                    }
                };

                // We want to update breadcrumbs only when a route is actually changed
                // as $location.path() will get updated immediately (even if route
                // change fails!)
                $rootScope.$on('$routeChangeSuccess', function() {
                    BreadcrumbService.generateBreadcrumbs();
                });

                //$rootScope.$watch(
                //    function() { return BreadcrumbService.options; },
                //    function() {
                //        BreadcrumbService.generateBreadcrumbs();
                //    }
                //);

                BreadcrumbService.generateBreadcrumbs();

                return BreadcrumbService;
            }
        ]
    );
}(angular, asm));



