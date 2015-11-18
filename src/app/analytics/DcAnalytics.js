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
                Admin: function(DcAdmin, $q, $exceptionHandler) {
                    var deferred = $q.defer();
                    DcAdmin.IsAdmin()
                        .then(function(data) {
                            data.admin ? deferred.resolve() : deferred.reject();
                            if (!data.admin) {
                                $exceptionHandler({data: {error: "You must be an Admin User to access this page"}})
                            }
                        });
                    return deferred.promise;
                }
            }
        })
}






function DcAnalyticsController() {
    var vm = this;
    var client = new Keen({
        projectId: "561c1f5946f9a76e5db2583c",
        readKey: "348def2aa2aaef3fe5f20b42fdc408ad60fec8814ac60b9fc2ae70af784a030d09053b35fe6cd7498955298d24dc3345d23785ee9dc0a99417f687c09ef117714d8d6be255670443aa6ef17859780a7019dd4d90ee20df2358c797edcc21bafa5884a7b951365a4545db7ac151d664c2"});

    Keen.ready(function() {
       var countReg = new Keen.Query("count", {
           eventCollection: 'registration',
           interval: "daily",
           timeframe: "this_7_days"
       });
        client.draw(countReg, document.getElementById("Registrations"), {
            chartType: "columnchart",
            title: "Registrations by Day"
        });

        var countVisits = new Keen.Query("count", {
            eventCollection: 'classEntered',
            groupBy: 'classID',
            timeframe: "this_7_days"
        });
        client.draw(countVisits, document.getElementById("ClassVisits"), {
            chartType: 'piechart',
            title: 'Class Visits'
        })
    });


    vm.test = 'hello';
}