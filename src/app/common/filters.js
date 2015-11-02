angular.module( 'orderCloud' )

	.filter('OCRoutingUrl', OCRoutingUrl)
	.filter('OCUrlParams', OCUrlParams)
	.filter('URItoAngular', URItoAngular)
	.filter('OCFilteredParameters', OCFilteredParameters)
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

function URItoAngular() {
	return function(value) {
		value = value.replace(/{/g, ':');
		value = value.replace(/}/g, '');
		return value;
	}
}

function OCFilteredParameters() {
	return function(parameters, resourceName) {
		var filtered = {
			'buyerID': {
				EndpointExceptions: ['Buyers']
			}
		};

		var results = [];

		angular.forEach(parameters, function(parameter) {
			if (!filtered[parameter.Name] || (filtered[parameter.Name] && filtered[parameter.Name].EndpointExceptions.indexOf(resourceName) > -1)) {
				results.push(parameter);
			}
		});

		return results;
	}
}