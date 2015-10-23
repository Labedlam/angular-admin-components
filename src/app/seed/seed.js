angular.module( 'orderCloud' )

    .config( SeedConfig )
    .controller( 'SeedCtrl', SeedController )

;

function SeedConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.seed', {
            url: '/seed',
            templateUrl:'seed/templates/seed.tpl.html',
            controller:'SeedCtrl',
            controllerAs: 'seed'
        })
}

function SeedController($sce ) {
    var vm = this;
    vm.config = {}

}