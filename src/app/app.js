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
	.constant('devapiurl', 'https://devcenterapi.herokuapp.com')

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
	//regular
	//$cookies.put('dc-token', 'eyJhbGciOiJIUzI1NiJ9.YjlmN2Y5ZDMwMTRjYzM4NjU3NWU3MmIwNmFlZTg5OTA4Y2I4YTIxOWU0OGVkNjUwMGRkZGU2YTc4MzYyYzQ1MzYxZjA5MmYwNTE3OTQ1MDZhZmZiZWU5OWVlZmVlY2E0ZWE5ZGVhNjEyNDdlMmUzODRlZTg0YjU5NzZjODk2NTQ0ZmYzOTM3YWM3NGQ0ZWY3Mjk3NzIzYWQ5ZTY3NTM4OThjZWU4ODQ5.M_0hJrULQSLukqd1HT5lgo2782Fqb22bTbTAkhKa4XM');
	//admin
	//$cookies.put('dc-token', 'eyJhbGciOiJIUzI1NiJ9.Y2RlM2Y3ZjJkOTk1ZWY5N2JjZGI5N2RlMGY1OTZiMzlkMmY0MjRjMDcwZjA0YmIyYTBhYzczNWZjMGJkYWUzNjUyNjI3MDA0MDI1OQ.m3qQMRisV9gAUJAp05xTq2NJ9FtpbZvZJyOndt-pzR4');
	vm.logout = function() {
		$cookies.remove('dc-token');
		DevAuth.RemoveToken();
		Auth.RemoveToken();
		$state.go('base.home',{}, {reload:true});
	};
	vm.$state = $state;
}
