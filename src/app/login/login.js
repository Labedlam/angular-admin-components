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

function LoginController( $exceptionHandler, $rootScope, $cookies, $state, DcAdmin, DevCenter, DevAuth, Auth ) {
	var vm = this;

	vm.submit = function() {
		DevCenter.Login( vm.credentials )
			.then(function(data) {
				if (data['access_token']) {
					DevAuth.SetToken(data['access_token']);
					DevCenter.Me.Get().then(function(data) {
						DcAdmin.Authenticate(data.MongoDBHash).then(function(dataA) {
							$cookies.put('dc-token', dataA.mongoToken);
							$rootScope.isAuthenticated = true;
							$state.go('base.home');
						});
					})
				} else {
					//$state.reload();
				}
			}).catch(function( ex ) {
				$exceptionHandler( ex );
			});
	};
}
