angular.module( 'orderCloud' )

    .config( SdkConfig )
    .controller( 'SdkCtrl', SdkController )

;

function SdkConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.sdk', {
            url: '/sdk',
            templateUrl:'sdk/templates/sdk.tpl.html',
            controller:'SdkCtrl',
            controllerAs: 'sdk',
            resolve: {
                Documentation: function(Docs) {
                    return Docs.GetAll();
                }
            }
        })
}

function SdkController($sce, Documentation ) {
    var vm = this;
    vm.content = Documentation;

    vm.setMaxLines = function(editor) {
        editor.setOptions({
            maxLines:100
        });
    };
}