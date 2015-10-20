angular.module( 'orderCloud' )

	.filter('OCRoutingUrl', OCRoutingUrl)
	.filter('OCUrlParams', OCUrlParams)
;

function OCRoutingUrl() {
	return function(value) {
		if (value.split('.io/')[1]) {
			return value.split('.io/')[1];
		} else {
			return value.split(':9002/')[1];
		}

	}
}

function OCUrlParams() {
	return function(obj) {
		var paramString = '';
		angular.forEach(obj, function(value, key) {
			if (!value) return;
			paramString += ((paramString.length ? '&' : '?') + key + '=' + value);
		});
		return paramString;
	}
}