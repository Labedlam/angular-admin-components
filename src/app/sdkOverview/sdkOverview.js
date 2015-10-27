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
            controllerAs: 'sdkOverview',
            resolve: {
                Documentation: function(Docs) {
                    return Docs.GetAll();
                }
            }
        })
}

function SdkOverviewController($sce, Documentation ) {
    var vm = this;
    vm.content = Documentation;
    vm.config = {}

}