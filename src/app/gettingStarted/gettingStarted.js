/**
 * Created by Aisha on 11/4/2015.
 */
angular.module( 'orderCloud' )

    .config( GettingStartedConfig )
    .controller( 'GettingStartedCtrl', GettingStartedController )

;

function GettingStartedConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.gettingstarted', {
            url: '/gettingstarted',
            templateUrl:'gettingStarted/templates/gettingStarted.tpl.html',
            controller:'GettingStartedCtrl',
            controllerAs: 'gettingstarted'
        })
}

function GettingStartedController($sce ) {
    var vm = this;
    vm.config = {}

}