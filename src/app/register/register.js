angular.module('orderCloud')
	.config(RegisterConfig)
	.controller('RegisterCtrl', RegisterController)
;

function RegisterConfig( $stateProvider ) {
	$stateProvider
		.state( 'base.register', {
			url: '/register',
			templateUrl:'register/templates/register.tpl.html',
			controller:'RegisterCtrl',
			controllerAs: 'register'
		})
}

function RegisterController(DevCenter) {
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
			vm.newUserInfo = userInfo;
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