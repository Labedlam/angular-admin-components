angular.module( 'orderCloud' )

	.config( LoginConfig )
	.controller( 'LoginCtrl', LoginController )
	.controller( 'PasswordResetCtrl', PasswordResetController )

;

function LoginConfig( $stateProvider ) {
	$stateProvider
		.state( 'login', {
			url: '/login',
			templateUrl:'login/templates/login.tpl.html',
			controller:'LoginCtrl',
			controllerAs: 'login',
			data:{
				limitAccess: false //Whether or not to require authentication on this state
			}
		})
		.state( 'passwordReset', {
			url:'/password-reset?token',
			templateUrl:'login/templates/passwordReset.tpl.html',
			controller:'PasswordResetCtrl',
			controllerAs: 'passwordReset',
			data: {
				limitAccess:false
			}
		});
}

function LoginController( $exceptionHandler, $rootScope, $cookies, $state, DcAdmin, DevCenter, DevAuth, Auth ) {
	var vm = this;
	vm.toggleForgotPassword = false;

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

	vm.resetpassword = function() {
		DevCenter.RequestResetPassword(vm.credentials.Username)
			.then(function() {
				vm.toggleForgotPassword = false;
			}).catch(function(ex) {
				$exceptionHandler(ex);
			}
		);
	};
}

function PasswordResetController($exceptionHandler, $stateParams, DevCenter) {
	var vm = this;
	vm.success = false;
	vm.submit = function() {
		DevCenter.ResetPassword(vm.newPassword, $stateParams.token).then(function() {
			vm.success = true;
		}).catch(function(ex) {
			$exceptionHandler(ex);
		})
	}
}