angular.module( 'orderCloud' )

    .config( IntegrationsConfig )
    .controller( 'IntegrationsCtrl', IntegrationsController )

;

function IntegrationsConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.integrations', {
            url: '/integrations',
            templateUrl:'integrations/templates/integrations.tpl.html',
            controller:'IntegrationsCtrl',
            controllerAs: 'integrations'
        })
}

function IntegrationsController($sce ) {
    var vm = this;
    vm.config = {}

}