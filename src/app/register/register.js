angular.module('orderCloud')
	.config(RegisterConfig)
	.controller('RegisterCtrl', RegisterController)
;

function RegisterConfig( $stateProvider ) {
	$stateProvider
		.state( 'register', {
			url: '/register',
			templateUrl:'register/templates/register.tpl.html',
			controller:'RegisterCtrl',
			controllerAs: 'register'
		})
}

function RegisterController( $state, DevAuth, Auth, DevCenter) {
	var vm = this;

	vm.newUserInfo = null;

	vm.information = {
		"Email": null,
		"Username": null,
		"Password": null,
		"FirstName": null,
		"LastName": null
	};

	vm.submit = function() {
		DevCenter.Register(vm.information).then(function(userInfo) {
			DevCenter.Login({Email:userInfo.Email, Password:userInfo.Password})
				.then(function(data) {
					Auth.RemoveToken();
					DevAuth.SetToken(data['access_token']);
					$state.go('base.home');
				})
		})
	};

	vm.new = function() {
		vm.newUserInfo = null;

		vm.information = {
			"Email": null,
			"Username": null,
			"Password": null,
			"FirstName": null,
			"LastName": null
		};

	};

}