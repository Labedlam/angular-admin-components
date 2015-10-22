angular.module( 'orderCloud', [

	"com.2fdevs.videogular",
	"com.2fdevs.videogular.plugins.controls",
	'templates-app',
	'ngSanitize',
	'ngAnimate',
	'ngMessages',
	'ngTouch',
	'ui.router',
	'ui.bootstrap',
	'orderCloud.sdk',
	'markdown',
	'ui.ace',
	'angular-jwt'
])

	.run( Security )
	.run( ErrorHandling )
	.config( Routing )
	//.config( ErrorHandling )
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
	//.constant('authurl', 'https://testauth.ordercloud.io/oauth/token')
	//.constant('apiurl', 'https://testapi.ordercloud.io')
	//.constant('devcenterClientID', '1aa9ed77-64f0-498d-adfa-8b430d7a7858') //Test

	.constant('authurl', 'http://core.four51.com:11629/OAuth/Token')
	.constant('apiurl', 'http://core.four51.com:9002')
	.constant('devcenterClientID', '6d60154e-8a55-4bd2-93aa-494444e69996') //Local

	//.constant('devapiurl', 'https://devcenterapi.herokuapp.com')
	.constant('devapiurl', 'https://devcenterapi-test.herokuapp.com')
	//.constant('devapiurl', 'http://localhost:55555')


;

function Security( $rootScope, $state, DevAuth, Me ) {
	$rootScope.$on('$stateChangeStart', function(e, to) {
		/*TODO: make the '$stateChangeStart event' accept a function so users can control the redirect from each state's declaration.*/
		if (!to.data || !to.data.limitAccess) return;
		DevAuth.IsAuthenticated()
			.catch(sendToLogin);
		//Me.Get()
		//	.catch(sendToLogin);
		function sendToLogin() {
			$state.go('login');
		}
	})
}

function ErrorHandling($rootScope, DevAuth, Auth) {
/*	$rootScope.$on('event:auth-loginRequired', function() {
		DevAuth.RemoveToken();
		Auth.RemoveToken();
	});*/
	$rootScope.$on('event:error', function(response) {
		console.log('Unhandled Error Caught');
		console.dir(response);
	})
}

function Routing( $urlRouterProvider, $urlMatcherFactoryProvider ) {
	$urlMatcherFactoryProvider.strictMode(false);
	$urlRouterProvider.otherwise( '/home' );
	//$locationProvider.html5Mode(true);
	//TODO: For HTML5 mode to work we need to always return index.html as the entry point on the serverside
}

/*function ErrorHandling( $provide ) {
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
}*/

function AppCtrl( $state, DevAuth, Auth, $cookies ) {
	var vm = this;
	$cookies.put('dc-token', 'eyJhbGciOiJIUzI1NiJ9.YjlmN2Y5ZDMwMTRjYzM4NjU3NWU3MmIwNmFlZTg5OTA4ZmU4YTIxZGUzOGJkMzUwMGRkNmU2ZjI4MjY3YzQ1ZjM4YTc5N2EyNTY3OTQ1NTdhZWFkZWVjMGVhZmZlZmY3ZWI5M2I3MzEyMzI1MmIzMzRmZWE0YjA4NzdjZDkxNTA0YmYwOTM3OWM2NGQ0YmYxNzQ3YjIyYWU.-kgniqgo-ZQRKASbaXdUDQIqcA31H0DcgsaYQHneq4E');
	vm.logout = function() {
		DevAuth.RemoveToken();
		Auth.RemoveToken();
		$state.go('base.home',{}, {reload:true});
	};
	vm.$state = $state;
}
