angular.module( 'orderCloud' )
		.directive('blacklist', blackList)
		.directive('compareTo', compareTo)

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
				ngModel.$setValidity('blacklist', !personal ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) : false);
			});
		}
	}
}