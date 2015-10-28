angular.module( 'orderCloud' )

    .config( ComponentsConfig )
    .controller( 'ComponentsCtrl', ComponentsController )

;

function ComponentsConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.components', {
            url: '/components',
            templateUrl:'components/templates/components.tpl.html',
            controller:'ComponentsCtrl',
            controllerAs: 'components'
        })
}

function ComponentsController($sce ) {
    var vm = this;
    vm.config = {}

}