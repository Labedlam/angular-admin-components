angular.module( 'orderCloud' )

	.config( DocsConfig )
	.controller( 'DocsCtrl', DocsController )
	.controller( 'DocsResourceCtrl', DocsResourceController )
	.controller( 'DocsSectionCtrl', DocsSectionController )
	.factory( 'DocsService', DocsService )
	.factory( 'Docs', DocsFactory )
	.factory( 'DocsExtend', DocsExtend)
;

function DocsConfig( $stateProvider ) {
	$stateProvider
		.state( 'base.docs', {
			url: '/docs',
			templateUrl:'docs/templates/docs.tpl.html',
			controller:'DocsCtrl',
			controllerAs: 'docs',
			resolve: {
				Documentation: function(Docs) {
					return Docs.GetAll();
				}
			}
		})
		.state( 'base.docs.section', {
			url: '/:sectionID',
			templateUrl: 'docs/templates/section.tpl.html',
			controller: 'DocsSectionCtrl',
			controllerAs: 'docsSection'
		})
		.state( 'base.docs.section.resource', {
			url: '/:resourceID',
			views: {
				'@base.docs': {
					templateUrl: 'docs/templates/resource.tpl.html',
					controller: 'DocsResourceCtrl',
					controllerAs: 'docsResource'
				}
			},
			resolve: {
				SelectedResource: function($q, Docs, DocsService, $stateParams) {
					var d = $q.defer();
					Docs.GetResource($stateParams.resourceID)
						.then(function(data) {
							DocsService.SetActiveSection(data.Section);
							d.resolve(data);
						});
					return d.promise;
				}
			}
		})
}

function DocsSectionController( $stateParams  ) {
	var vm = this;
	vm.view = 'docs/templates/' + $stateParams.sectionID.toLowerCase() + '.tpl.html';
}

function DocsController( $scope, DocsService, Documentation ) {
	var vm = this;
	vm.content = Documentation;
	$scope.$watch(function() {
		return DocsService.GetActiveSection();
	}, function(n,o) {
		if (!n) return;
		vm.activeSection = n;
	});

	vm.setMaxLines = function(editor) {
		editor.setOptions({
			maxLines:100
		});
	};

	vm.ReadmeScripts = [
		"{\n\t\"Meta\": {\n\t\t\"Page\": 1,\n\t\t\"PageSize\": 20,\n\t\t\"TotalCount\": 25,\n\t\t\"TotalPages\": 2,\n\t\t\"ItemRange\": [1,20]\n\t},\n\t\"Items\": [\"...\"]\n}",
		"[{\n\t\"ErrorCode\": \"FirstNameRequired\",\n\t\"Message\": \"First Name is required.\"\n},\n{\n\t\"ErrorCode\": \"LastNameRequired\",\n\t\"Message\": \"Last Name is required.\"\n}]"
	];
}

function DocsResourceController ( SelectedResource, DocsService ) {
	var vm = this;
	vm.current = SelectedResource;

	DocsService.SetActiveSection(vm.current.Section);

	vm.setMaxLines = function(editor) {
		editor.setOptions({
			maxLines:100
		});
	};
}

function DocsService(  ) {
	var service = {
		GetActiveSection: _getActiveSection,
		SetActiveSection: _setActiveSection
	};

	var section = null;

	function _getActiveSection() {
		return section;
	}

	function _setActiveSection(value) {
		section = value;
	}

	return service;
}

function DocsExtend() {
	var service = {
        extend: _extend
    };

    function _extend(data) {
        if (Object.prototype.toString.call(data) == '[object Array]') {
            angular.forEach(data, function(item) {
                xtnd(item);
            })
        }
        else {
            xtnd(data);
        }

        function xtnd(doc) {
            //append additional properties to single object here
			angular.forEach(doc.Resources, function(resource) {
				angular.forEach(resource.Endpoints, function(endpoint) {
					var sample = "{0}.{1}({2}).then(successFn).catch(errorFn);";
					endpoint.CodeSample = sample.replace('{0}', resource.ID).replace('{1}', endpoint.ID).replace('{2}', _getParams(endpoint.Parameters));
				});
			});
        }

		function _getParams(params) {
			var temp = [];
			angular.forEach(params, function(p) {
				if (p.Name != 'buyerID')
					temp.push(p.Name);
			});
			return temp.join(", ").replace('search, searchOn, sortBy, page, pageSize, filters', 'listArgs');
		}
    }

    return service;
}

function DocsFactory($resource, $injector, apiurl, Auth) {
	var service = {
		GetAll: _getall,
		GetResource: _getresource,
		GetEndpoint: _getendpoint,
		As: _as
	};

	var _extendCustom, _extendLocal;
	try {
		_extendCustom = $injector.get('Extend');
	}
	catch(ex) { }

	try {
		_extendLocal = $injector.get('DocsExtend');
	}
	catch(ex) { }

	function docsExtend(data) {
		if (_extendLocal) {
			if (_extendCustom && _extendCustom['Docs']) {
				return _extendCustom['Docs'](_extendLocal.extend(data));
			}
			return _extendLocal.extend(data);
		}
		else if (_extendCustom && _extendCustom['Docs']) {
			return _extendCustom['Docs'](data);
		}
		return data;
	}

	function _getall() {
		return $resource(apiurl + '/v1/docs').get().$promise.extend(docsExtend);
	}

	function _getresource(resource) {
		return $resource(apiurl + '/v1/docs/:resource', { 'resource': resource }).get().$promise;
	}

	function _getendpoint(resource, endpoint) {
		return $resource(apiurl + '/v1/docs/:resource/:endpoint', { 'resource': resource, 'endpoint': endpoint }).get().$promise;
	}

	function _as(token) {
		Auth.Impersonate(token);

		return this;
	}

	return service;
}
