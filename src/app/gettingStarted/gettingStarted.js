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

function GettingStartedController( ) {
    var vm = this;
    vm.setMaxLines = function(editor) {
        editor.setOptions({
            maxLines:1000
        });
    };
    vm.configuration_sample = "//Constants needed for the OrderCloud AngularJS SDK\n.constant('ocscope', 'FullAccess')\n.constant('appname', 'OrderCloud AngularJS Seed')\n\n//Client ID for a Registered Distributor or Buyer Company\n.constant('clientid', '0e0450e6-27a0-4093-a6b3-d7cd9ebc2b8f')\n\n//Test Environment\n.constant('authurl', 'https://testauth.ordercloud.io/oauth/token')\n.constant('apiurl', 'https://testapi.ordercloud.io')";
}