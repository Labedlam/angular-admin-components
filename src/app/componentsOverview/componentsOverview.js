angular.module( 'orderCloud' )

    .config( ComponentsOverviewConfig )
    .controller( 'ComponentsOverviewCtrl', ComponentsOverviewController )

;

function ComponentsOverviewConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.componentsOverview', {
            url: '/componentsOverview',
            templateUrl:'componentsOverview/templates/componentsOverview.tpl.html',
            controller:'ComponentsOverviewCtrl',
            controllerAs: 'componentsOverview'
        })
}

function ComponentsOverviewController($sce ) {
    var vm = this;
    vm.config = {}

}