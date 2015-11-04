angular.module('orderCloud')
	.config(RegisterConfig)
	.controller('RegisterCtrl', RegisterController)
	.directive('compareTo', compareTo)
	.directive('blacklist', blackList)
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
							$cookies.put('dc-token', mongoLoginData['access_token']);
							Auth.RemoveToken();
							DevCenter.Me.Validate($stateParams.code).then(function() {
								$state.go('base.home');
							})
						});
					})
				}
			}
		})
}

function RegisterController( $state, $cookies, $resource, DcAdmin, DevAuth, Auth, DevCenter) {
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
			DcAdmin.Register(userInfo).then(function(mongoData) {
				userInfo.MongoDBHash = mongoData.UserHash;
				DevCenter.Login({Email:userInfo.Email, Password:userInfo.Password}).then(function(loginData) {
					DevAuth.SetToken(loginData['access_token']);
					DevCenter.Me.Update(userInfo).then(function() {
						Auth.RemoveToken();
						DevAuth.RemoveToken();
						vm.successMessage = 'Thank you for registering, ' + userInfo.FirstName + ' ' + userInfo.LastName + '! Check your inbox and validate your email address.';
						/*						DcAdmin.Authenticate(mongoData.UserHash).then(function(mongoLoginData) {
						 $cookies.put('dc-token', mongoLoginData['access_token']);
						 Auth.RemoveToken();
						 $state.go('base.home');
						 });*/

						$resource("https://four51trial104401.jitterbit.net/Four51Dev/v1/pardotprospects",{},{ pardot: { method: 'POST', headers:{ Authorization: 'Basic Rm91cjUxSml0dGVyYml0OkYwdXI1MUoxdHQzcmIxdA==' }}}).pardot({
								"first_name": vm.information.FirstName,
								"last_name": vm.information.LastName,
								"email": vm.information.Email,
								"phone": vm.information.PhoneNumber,
								"company": vm.information.CompanyName,
								"created_by": "Devcenter"
							}).$promise;
					});
				});
			});
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

function compareTo() {
	return {
		require: "ngModel",
		scope: {
			otherModelValue: "=compareTo"
		},
		link: function(scope, element, attributes, ngModel) {

			ngModel.$validators.compareTo = function(modelValue) {
				return modelValue == scope.otherModelValue;
			};

			scope.$watch("otherModelValue", function() {
				ngModel.$validate();
			});
		}
	};
};

function blackList() {
	return {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, element, attributes, ngModel) {
			scope.$watch(attributes.ngModel, function(value) {
				var personal = /(gmail|hotmail|yahoo|facebook|msn|outlook|aol)/.test(value);
				ngModel.$setValidity(attributes.ngModel, !personal ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) : false);
			});
		}
	}
}