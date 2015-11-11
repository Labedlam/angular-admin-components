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
		.state( 'emailConfirm', {
			url: '/email-confirmation?code&token',
			resolve: {
				Confirmation: function($stateParams, $state, $cookies, Auth, DevAuth, DevCenter, DcAdmin) {
					DevAuth.SetToken($stateParams.token);
					DevCenter.Me.Get().then(function(data) {
						DcAdmin.Authenticate(data.MongoDBHash).then(function(mongoLoginData) {
							$cookies.put('dc-token', mongoLoginData['mongoToken']);
							DevCenter.Me.Validate($stateParams.code).then(function() {
								$state.go('base.home');
							})
						});
					})
				}
			}
		})
}

function RegisterController( $exceptionHandler, $resource, DevCenter) {
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
		vm.loading = true;
		DevCenter.Register(vm.information)
			.then(function(userInfo) {
				vm.loading = false;
				vm.successMessage = 'Thank you for registering, ' + userInfo.FirstName + ' ' + userInfo.LastName + '! Check your inbox and validate your email address.';
				$resource("https://four51trial104401.jitterbit.net/Four51Dev/v1/pardotprospects",{},{ pardot: { method: 'POST', headers:{ Authorization: 'Basic Rm91cjUxSml0dGVyYml0OkYwdXI1MUoxdHQzcmIxdA==' }}}).pardot({
						"first_name": vm.information.FirstName,
						"last_name": vm.information.LastName,
						"email": vm.information.Email,
						"phone": vm.information.PhoneNumber,
						"company": vm.information.CompanyName,
						"created_by": "Devcenter"
					});
			})
			.catch(function(ex) {
				vm.loading = false;
				vm.information.Email = null;
				vm.information.Username = null;
				$exceptionHandler(ex);
			});
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

