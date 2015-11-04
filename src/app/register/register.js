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

function RegisterController( $state, $cookies, DcAdmin, DevAuth, Auth, DevCenter) {
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
					})
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