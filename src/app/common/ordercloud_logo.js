angular.module('orderCloud')
	.directive('ordercloudLogo', ordercloudLogo)
;

function ordercloudLogo() {
	var obj = {
		scope: {
			icon: '='
		},
		templateUrl: 'common/ordercloud-logo.tpl.html',
		replace:true,
		link: function(scope, element, attrs) {
			scope.OrderCloudLogo = {
				'Icon': scope.icon,
				'maxHeight':attrs.height,
				'fillColor': attrs.color,
				'width': attrs.width
			};
		}
	};
	return obj;
}