angular.module( 'orderCloud', [
	'templates-app',
	'ngSanitize',
	'ngAnimate',
	'ngMessages',
	'ngTouch',
	'ui.router',
	'ui.bootstrap',
	'orderCloud.sdk',
	'markdown',
	'ui.ace'
])

	.run( Security )
	/*.run(function($rootScope) {
		$rootScope.clientid = '0e0450e6-27a0-4093-a6b3-d7cd9ebc2b8f';
	})*/
	.config( Routing )
	.config( ErrorHandling )
	.controller( 'AppCtrl', AppCtrl )

	//Constants needed for the OrderCloud AngularJS SDK
	.constant('ocscope', 'FullAccess')
	.constant('appname', 'DevCenter')

	//Client ID for a Registered Distributor or Buyer Company
	//.constant('clientid', '7a26bc3f-cff2-497d-8ead-83e569e9d849')
	.constant('clientid', (function() {
		var host = window.location.hostname.split('.')[0];
		var clients = {
			'partner': '79B2578B-9317-4395-A690-3AA84F0C74ED',
			'aveda': '84220402-FF8A-49C7-8C28-D321C7AFE37D',
			'echidna': '018DDFBD-AFF8-413A-8518-F45FC774619B',
			'devcenter': '0e0450e6-27a0-4093-a6b3-d7cd9ebc2b8f',
			'ost': '13b39209-b02b-4d19-92fb-00ea490c2863',
			'taylor': '73ad7724-dea4-463d-aa6c-160caa98e2e5',
			'jitterbit': 'dc23aae2-b120-429f-8432-323ce1a3b69f',
			'ian': '36070750-ebb2-451e-a831-fa11bb0e8a09'
		};
		return clients[host] || '0e0450e6-27a0-4093-a6b3-d7cd9ebc2b8f'; //DISTRIBUTOR - Four51 OrderCloud Components
	}))
	//Test Environment
	.constant('authurl', 'https://testauth.ordercloud.io/oauth/token')
	.constant('apiurl', 'https://testapi.ordercloud.io')
	.constant('devapiurl', 'https://devcenterapi.herokuapp.com')
	/*.constant('devapiurl', 'http://localhost:55555')*/

;

function Security( $rootScope, $state, Auth, Me ) {
	$rootScope.$on('$stateChangeStart', function(e, to) {
		/*TODO: make the '$stateChangeStart event' accept a function so users can control the redirect from each state's declaration.*/
		if (!to.data || !to.data.limitAccess) return;
		Auth.IsAuthenticated()
			.catch(sendToLogin);
		Me.Get()
			.catch(sendToLogin);
		function sendToLogin() {
			$state.go('login');
		}
	})
}

function Routing( $urlRouterProvider, $urlMatcherFactoryProvider ) {
	$urlMatcherFactoryProvider.strictMode(false);
	$urlRouterProvider.otherwise( '/dashboard' );
	//$locationProvider.html5Mode(true);
	//TODO: For HTML5 mode to work we need to always return index.html as the entry point on the serverside
}

function ErrorHandling( $provide ) {
	$provide.decorator('$exceptionHandler', handler );

	function handler( $delegate, $injector ) {
		return function $broadcastingExceptionHandler( ex, cause ) {
			ex.status != 500 ?
				$delegate( ex, cause ) :
				( function() {
					try {
						//TODO: implement track js
						console.log(JSON.stringify( ex ));
						//trackJs.error("API: " + JSON.stringify(ex));
					}
					catch ( ex ) {
						console.log(JSON.stringify( ex ));
					}
				})();
			$injector.get( '$rootScope' ).$broadcast( 'exception', ex, cause );
		}
	}
}

function AppCtrl( $state, Credentials ) {
	var vm = this;
	vm.logout = function() {
		Credentials.Delete();
		$state.go('base.dashboard',{}, {reload:true});
	};
	vm.$state = $state;
}
