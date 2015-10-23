angular.module( 'orderCloud' )

    .config( SdkOverviewConfig )
    .controller( 'SdkOverviewCtrl', SdkOverviewController )

;

function SdkOverviewConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.sdkOverview', {
            url: '/sdkOverview',
            templateUrl:'sdkOverview/templates/sdkOverview.tpl.html',
            controller:'SdkOverviewCtrl',
            controllerAs: 'sdkOverview'
        })
}

function SdkOverviewController($sce ) {
    var vm = this;
    vm.config = {}

}