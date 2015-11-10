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
    var client = new Keen({
        projectId: '561c1f5946f9a76e5db2583c',
        readKey: "348def2aa2aaef3fe5f20b42fdc408ad60fec8814ac60b9fc2ae70af784a030d09053b35fe6cd7498955298d24dc3345d23785ee9dc0a99417f687c09ef117714d8d6be255670443aa6ef17859780a7019dd4d90ee20df2358c797edcc21bafa5884a7b951365a4545db7ac151d664c2"
    });

    Keen.ready(function() {
        var savedQueries = client.savedQueries();

        savedQueries.get("daily-registrations",function(err, res) {
            vm.registrations = res;
        });

        savedQueries.update("daily-registrations",
            {refresh_rate: 60},
            function(err, res) {
                if (err) {
                    $exceptionHandler({data: {error: 'Could not update Registration Analytics at this time'}})
                } else {
                    vm.registrations = res;
                }
            })
    });


    vm.test = 'hello';
}