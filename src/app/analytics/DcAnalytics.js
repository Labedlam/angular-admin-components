angular.module('orderCloud')
    .controller('DcAnalyticsCtrl', DcAnalyticsController)
    .config(AnalyticsConfig);

function AnalyticsConfig( $stateProvider, $httpProvider ) {
    $stateProvider
        .state( 'base.analytics', {
            url: '/analytics',
            templateUrl:'analytics/templates/analytics.tpl.html',
            controller:'DcAnalyticsCtrl',
            controllerAs: 'analytics',
            resolve: {
                Admin: function(DcAdmin) {
                    return DcAdmin.IsAdmin();
                }
            }
        })
}






function DcAnalyticsController() {
 var vm = this;

    vm.test = 'hello';
}