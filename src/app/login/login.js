angular.module( 'orderCloud' )

	.config( LoginConfig )
	.controller( 'LoginCtrl', LoginController )

;

function LoginConfig( $stateProvider ) {
	$stateProvider.state( 'login', {
		url: '/login',
		templateUrl:'login/templates/login.tpl.html',
		controller:'LoginCtrl',
		controllerAs: 'login',
		data:{
			limitAccess: false //Whether or not to require authentication on this state
		}
	});
}

function LoginController( $rootScope, $state, DevCenter, DevAuth, Auth ) {
	var vm = this;

	vm.submit = function() {
		DevCenter.Login( vm.credentials )
			.then(function(data) {
				if (data['access_token']) {
					Auth.RemoveToken();
					DevAuth.SetToken(data['access_token']);
					$rootScope.isAuthenticated = true;
					$state.go( 'base.home' );
				} else {
					$state.reload();
				}
			}).catch(function( ex ) {
				console.dir( ex );
			});
	};
}
