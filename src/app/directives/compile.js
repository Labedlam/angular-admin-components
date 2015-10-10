angular.module('orderCloud')
    .config(ContentDirective);


function ContentDirective($compileProvider) {
    $compileProvider.directive('compile', function ($compile) {
        return function (scope, element, attrs) {
            scope.$watch(
                function (scope) {
                    return scope.$eval(attrs.compile);
                },
                function (value) {
                    element.html(value);

                    $compile(element.contents())(scope);
                }
            );
        };
    });
}