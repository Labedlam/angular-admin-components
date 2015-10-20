angular.module('orderCloud')

    .config( ApiConsoleConfig )
    .controller('ApiConsoleCtrl', ApiConsoleController)
	.factory('ApiLoader', ApiLoaderService)
	.factory('LockableParams', LockableParamsService)
	.factory('ApiConsoleService', ApiConsoleService)
	.factory('ConsoleContext', ConsoleContextService)
	.directive('parameterObject', ParameterObjectDirective)
	.directive('emptyToNull', EmptyToNullDirective)
	.filter('objectParams', objectParams)
;

function objectParams() {
	return function(params) {
		var result = [];
		angular.forEach(params, function(param) {
			if (param.Type == 'object') result.push(param);
		});
		return result;
	}
}

function ApiConsoleConfig( $stateProvider, $urlMatcherFactoryProvider ) {
    $urlMatcherFactoryProvider.strictMode(false);
    $stateProvider.state('base.console', {
        'url': '/console',
        'templateUrl': 'console/templates/console.tpl.html',
        'controller': 'ApiConsoleCtrl',
        'controllerAs': 'console',
        'resolve': {
			DevAccess: function(DevCenter) {
				return DevCenter.Me.Access();
			},
			ActiveContext: function(ConsoleContext) {
				return ConsoleContext.Get();
			},
			OrderCloudSections:  function($q, Docs) {
				var defer = $q.defer();
				Docs.GetAll().then(function(data) {
					defer.resolve(data.Sections);
				});
				return defer.promise;
			},
			OrderCloudResources: function (ApiLoader) {
                return ApiLoader.getResources('orderCloud.sdk');
            }
        },
        'data':{
			limitAccess: true,
			pageTitle: 'API Console'
		}
    });
};

function ApiConsoleController($scope, $resource, $filter, apiurl, Underscore, ActiveContext, DevAccess, OrderCloudResources, ApiConsoleService, LockableParams, ConsoleContext) {
	var vm = this;
	//Context variables
	vm.AvailableContexts = DevAccess.Items;
	vm.ActiveContext = ActiveContext ? Underscore.where(vm.AvailableContexts, {ClientID: ActiveContext.ClientID})[0] : null;
	vm.SelectedContext = vm.ActiveContext;

	//Console variables
	vm.Resources = OrderCloudResources;
	vm.SelectedResource = null;
	vm.SelectedMethod = '';
	vm.SelectedEndpoint = null;

	//Response variables
	vm.Responses = [];
	vm.SelectedResponse = null;

	vm.setContext = function(context) {
		ConsoleContext.Update(context)
			.then(function() {
				if (!vm.ActiveContext) {
					vm.SelectResource({resource: Underscore.where(vm.Resources, {name: 'Buyers'})[0]});
				} else {
					LockableParams.Clear();
					vm.SelectedMethod = null;
					vm.Responses = [];
					vm.SelectedResponse = null;
				}
				vm.ActiveContext = context;
			});
	};

	vm.removeContext = function() {
		LockableParams.Clear();
		vm.SelectedContext = null;
		vm.ActiveContext = null;
		vm.SelectedResource = null;
		vm.Responses = [];
		vm.SelectedResponse = null;
		LockableParams.Clear();
		ConsoleContext.Remove();
	};

	vm.isLocked = function(paramName) {
		return LockableParams.IsLocked(paramName);
	};

	vm.unlockParam = function(paramName) {
		LockableParams.RemoveLock(paramName)
	};

	vm.lockParam = function(paramName, paramValue) {
		LockableParams.SetLock(paramName, paramValue)
	};

	vm.setMaxLines = function(editor) {
		editor.setOptions({
			maxLines:200
		});
	};

	vm.addNewFilter = function() {
		vm.SelectedMethod.ResolvedParameters.Filters.push({Key: null, Value: null})
	};

	vm.removeFilter = function(filterIndex) {
		vm.SelectedMethod.ResolvedParameters.Filters.splice(filterIndex, 1);
	};

	vm.Execute = function() {
		ApiConsoleService.ExecuteApi(vm.SelectedResource, vm.SelectedMethod);
/*			.then( function(data) {
				console.log(data);
				if (!(data.ID || data.Meta)) return;
				vm.Response = $filter('json')(data);
			})
			.catch( function(ex) {
				if (!ex) return;
				vm.Response = $filter('json')(ex);
			});*/
	};

	vm.SelectResource = function(scope) {
		vm.SelectedResource = scope.resource;
		vm.SelectedResource.Documentation = $resource( apiurl + '/v1/docs/' + vm.SelectedResource.name ).get();
		vm.SelectedMethod = null;
	};

	if (vm.ActiveContext) {
		vm.SelectResource({resource: Underscore.where(vm.Resources, {name: 'Buyers'})[0]});
	}

	vm.SelectMethod = function(scope) {
		vm.SelectedMethod = scope.method;
	};

	$scope.$watch(function () {
		return vm.SelectedResource;
	}, function (n, o) {
		if (!n || n === o) return;
		vm.Response = null;
		vm.SelectedEndpoint = null;
		vm.SelectedMethod = '';
	});

	$scope.$watch(function () {
		return vm.SelectedMethod;
	}, function (n, o) {
		if (!n || n == '' || n === o) return;
		vm.Response = null;
		vm.SelectedEndpoint = null;
		if (angular.isDefined(n.params)) {
			ApiConsoleService.CreateParameters(vm.SelectedResource, n)
				.then(function(data) {
					vm.SelectedEndpoint = data.SelectedEndpoint;
					vm.SelectedMethod.ResolvedParameters = data.ResolvedParameters;
				});
		}
	});

	$scope.$on('event:responseSuccess', function(event, c) {
		if (c.config.url.indexOf('.html') > -1 || c.config.url.indexOf('docs/') > -1 || c.config.url.indexOf('devcenter/') > -1 || c.config.url.indexOf('devcenterapi') > -1) return;
		c.data = $filter('json')(c.data);
		vm.Responses.push(c);
		vm.SelectResponse(c);
	});

	$scope.$on('event:responseError', function(event, c) {
		if (c.config.url.indexOf('.html') > -1 || c.config.url.indexOf('docs/') > -1 || c.config.url.indexOf('devcenter/') > -1 || c.config.url.indexOf('devcenterapi') > -1) return;
		c.data = $filter('json')(c.data);
		vm.Responses.push(c);
		vm.SelectResponse(c);
	});

	vm.SelectResponse = function(response) {
		vm.SelectedResponse = response;
	}
}

function ApiConsoleService($injector, $resource, Underscore, apiurl, LockableParams) {
	var service = {
		ExecuteApi: _executeApi,
		CreateParameters: _createParameters
	};

	return service;

	/////
	function _executeApi(SelectedResource, SelectedMethod) {
		var params = [];
		angular.forEach(SelectedMethod.ResolvedParameters.Fields, function(p) {
			if (p.Value == "") return; //Avoid registering blank strings
			params.push(p.Value);
		});
		if (SelectedMethod.ResolvedParameters.Objects.length && SelectedMethod.ResolvedParameters.Objects[0].Value) params.push(JSON.parse(SelectedMethod.ResolvedParameters.Objects[0].Value));
		if (SelectedMethod.ResolvedParameters.Filters.length) {
			var filters = {};
			angular.forEach(SelectedMethod.ResolvedParameters.Filters, function(filter) {
				if (filter.Key && filter.Value) filters[filter.Key] = filter.Value;
			});
			params.push(filters);
		}
		return $injector.get(SelectedResource.name)[SelectedMethod.name].apply(this, params);
	}

	function _createParameters(SelectedResource, SelectedMethod) {
		var result = {
			SelectedEndpoint: null,
			ResolvedParameters: {
				Fields: [],
				Objects: [],
				Filters: []
			}
		};
		return $resource( apiurl + '/v1/docs/' + SelectedResource.name + '/' + SelectedMethod.name).get().$promise
			.then( function(data) {
				result.SelectedEndpoint = data;
				analyzeParamters(data);
				return result;
			});

		function analyzeParamters(endpoint) {
			var lockableParams = LockableParams.Get();
			angular.forEach(SelectedMethod.params, function(methodParameter) {
				var match = Underscore.where(endpoint.Parameters, {Name: methodParameter});
				var param = match.length ? match[0] : {Value: endpoint.RequestBody.Sample, Name: methodParameter, Required: true, Lockable: false, Type: 'object'};
				if (param.Value) {
					result.ResolvedParameters.Objects.push(param);
				} else {
					param.Lockable = angular.isDefined(lockableParams[param.Name]);
					param.Value = param.Lockable ? lockableParams[param.Name] : null;
					param.Name == 'filters' ? result.ResolvedParameters.CanFilter = true : result.ResolvedParameters.Fields.push(param);
				}
			});
		}
	}
}

function ApiLoaderService($q, $injector) {
	var service = {
		getResources: _getResources
	};

	return service;

	/////
	function _getParamNames (func) {
		var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
		var ARGUMENT_NAMES = /([^\s,]+)/g;
		var fnStr = func.toString().replace(STRIP_COMMENTS, '');
		var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);

		if(result === null) result = [];

		return result;
	};

	function _getResources(moduleName) {
		var deferred = $q.defer();
		var filterFactories = [
			'Auth',
			'Request',
			'Docs',
			'Underscore',
			'Tests',
			'Registration',
			'Credentials',
			'AdminApiClients'
		];
		var services = [];

		angular.forEach(angular.module(moduleName)._invokeQueue, function(component) {
			var componentName = component[2][0];
			if (component[1] == 'factory' && filterFactories.indexOf(componentName) == -1 && componentName.indexOf('Extend') == -1) {
				var factory = {
					name: componentName,
					methods: []
				};
				var f;
				try {
					f =  $injector.get(factory.name);
					angular.forEach(f, function(value, key) {
						var method = {
							name: key,
							fn: value.toString(),
							resolvedParameters: {},
							callerStatement: null,
							results: null,
							params: _getParamNames(value)
						};
						factory.methods.push(method);
					});
				}
				catch (ex) {}

				services.push(factory);
			}
		});
		deferred.resolve(services);

		return deferred.promise;
	};
}

function LockableParamsService($q) {
	var service = {
		Get: _get,
		IsLocked: _isLocked,
		SetLock: _setLock,
		RemoveLock: _removeLock,
		Clear: _clearAll
	};

	var lockableParams = {
		'buyerID':null,
		'page':null,
		'pageSize':null
	};

	return service;

	function _get() {
		return lockableParams;
	}

	function _isLocked(key) {
		return lockableParams[key] ? true : false;
	}

	function _setLock(key, value) {
		var defer = $q.defer();
		lockableParams[key] = value;
		defer.resolve();
		return defer.promise;
	}

	function _removeLock(key) {
		var defer = $q.defer();
		lockableParams[key] = null;
		defer.resolve();
		return defer.promise;
	}

	function _clearAll() {
		var defer = $q.defer();
		angular.forEach(lockableParams, function(value, key) {
			lockableParams[key] = null;
		});
		defer.resolve();
		return defer.promise;
	}
}

function ParameterObjectDirective() {
	var obj = {
		restrict: 'A',
		require: 'ngModel',
		link: function(scope, element, attrs, ctrl) {
			ctrl.$validators.parameterObject = function(modelValue, viewValue) {
				if (ctrl.$isEmpty(modelValue)) return true;
				try {
					return validateModel(viewValue);
				} catch(ex) {
					return false;
				}
				function validateModel(value) {
					var obj = JSON.parse(value.replace(/\n/g, ''));
					var fieldErrors = 0;
					angular.forEach(scope.console.SelectedEndpoint.RequestBody.Fields, function(field) {
						//TODO: make empty objects and objects that are straight up missing required fields entirely invalid
						angular.forEach(obj, function(value, key) {
							if (key == field.Name && field.Required) {
								switch (field.Type) {
									case('string'):
										if (!angular.isString(value) || !value.length) fieldErrors++;
										break;
									case('boolean'):
										if (typeof(value) != 'boolean') fieldErrors++;
										break;
									case('object'):
										if (!angular.isObject(value)) fieldErrors++;
										break;
									case('integer'):
										if (!angular.isNumber(value)) fieldErrors++;
								}
							}
						})
					});
					return fieldErrors == 0;
				}
			}
		}
	};
	return obj;
}

function ConsoleContextService($q, jwtHelper, DevCenter, Auth) {
	var service = {
		Get: _getContext,
		Update: _updateContext,
		Remove: _removeContext
	};

	function _getContext() {
		var deferred = $q.defer();
		var token = Auth.GetToken();
		if (!angular.isDefined(token)) {
			deferred.resolve('No Context');
		} else {
			var tokenPayload = jwtHelper.decodeToken(token);
			deferred.resolve({
				ClientID: tokenPayload.cid.toUpperCase(),
				User: tokenPayload.usr
			});
		}
		return deferred.promise;
	}

	function _updateContext(context) {
		var deferred = $q.defer();
		DevCenter.AccessToken(context.ClientID, context.UserID)
			.then(function(token) {
				if (typeof token == 'object') {
					var newToken = '';
					angular.forEach(token, function(value, key) {
						if (value != '"' && value.length == 1) {
							newToken = newToken + value;
						}
					});
					token = newToken;
				}
				Auth.SetToken(token);
				deferred.resolve();
			});
		return deferred.promise;
	}

	function _removeContext() {
		Auth.RemoveToken();
	}

	return service;
}

function EmptyToNullDirective() {
	var directive = {
		restrict: 'A',
		require: 'ngModel',
		link: function (scope, elem, attrs, ctrl) {
			ctrl.$parsers.push(function(viewValue) {
				if(viewValue === "") {
					return null;
				}
				return viewValue;
			});
		}
	};

	return directive;
}