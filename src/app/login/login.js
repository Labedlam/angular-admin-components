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

function LoginController( $rootScope, $resource, $cookies, $state, DcAdmin, DevCenter, DevAuth, Auth ) {
	var vm = this;

	vm.kyle = function() {
		//$resource("https://testintegrations.ordercloud.io/components/delego/v1/test").get();
		//$resource("https://testintegrations.ordercloud.io/components/esteelauder/v1/test").get();
		$resource("https://testintegrations.ordercloud.io/components/esteelauder/v1/orderreview").save({"test": "testing"}).$promise
	};

	vm.submit = function() {
		DevCenter.Login( vm.credentials )
			.then(function(data) {
				if (data['access_token']) {
					DevAuth.SetToken(data['access_token']);
					DevCenter.Me.Get().then(function(data) {
						DcAdmin.Authenticate(data.MongoDBHash).then(function(dataA) {
							$cookies.put('dc-token', dataA['access_token']);
							Auth.RemoveToken();
							$rootScope.isAuthenticated = true;
							$state.go('base.home');
						});
					})
				} else {
					$state.reload()
				}
			}).catch(function( ex ) {
				console.dir( ex );
			});
	};
}
