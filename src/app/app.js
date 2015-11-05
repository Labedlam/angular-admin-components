
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
	.config( Routing )
	.config( ErrorHandling )
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

function Routing( $urlRouterProvider, $urlMatcherFactoryProvider ) {
	$urlMatcherFactoryProvider.strictMode(false);
	$urlRouterProvider.otherwise( '/home' );
	//$locationProvider.html5Mode(true);
	//TODO: For HTML5 mode to work we need to always return index.html as the entry point on the serverside
}

function ErrorHandling( $provide ) {
	$provide.decorator('$exceptionHandler', handler);

	function handler( $delegate, $injector ) {
		return function( ex, cause ) {
			$delegate(ex, cause);
			$injector.get('toastr').error(ex.data ? (ex.data.error || (ex.data.Errors ? ex.data.Errors[0].Message : ex.data)) : ex.message, 'Error');
		};
	};
}

function AppCtrl( $state, DevAuth, Auth, $cookies ) {
	var vm = this;
	vm.logout = function() {
		$cookies.remove('dc-token');
		DevAuth.RemoveToken();
		Auth.RemoveToken();
		$state.go('base.home',{}, {reload:true});
	};
	vm.$state = $state;
}
