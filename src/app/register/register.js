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
			DcAdmin.Register(userInfo).then(function(data) {
				userInfo.MongoDBHash = data.UserHash;
				DevCenter.Login({Email:userInfo.Email, Password:userInfo.Password}).then(function(dataA) {
					DevAuth.SetToken(dataA['access_token']);
					DevCenter.Me.Update(userInfo).then(function() {
						DcAdmin.Authenticate(data.UserHash).then(function(dataB) {
							$cookies.put('dc-token', dataB['access_token']);
							Auth.RemoveToken();
							$state.go('base.home');
						});
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