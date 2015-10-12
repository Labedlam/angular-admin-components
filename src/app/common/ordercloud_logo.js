angular.module('orderCloud')
	.directive('ordercloudLogo', ordercloudLogo)
;

function ordercloudLogo() {
	var obj = {
		templateUrl: 'common/ordercloud-logo.tpl.html',
		replace:true,
		link: function(scope, element, attrs) {
			scope.OrderCloudLogo = {
				'fillColor': attrs.color,
				'width': attrs.width
			};
		}
	};
	return obj;
}