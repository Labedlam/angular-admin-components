angular.module( 'orderCloud' )

	.config( DocsConfig )
	.controller( 'DocsCtrl', DocsController )
	.controller( 'DocsSectionCtrl', DocsSectionController )
	.controller( 'DocsResourceCtrl', DocsResourceController )
	.controller( 'DocsEndpointCtrl', DocsEndpointController )
	.factory( 'Docs', DocsFactory )
;
function DocsConfig( $stateProvider ) {
	$stateProvider
		.state( 'base.docs', {
			url: '/docs',
			templateUrl:'docs/templates/docs.tpl.html',
			controller:'DocsCtrl',
			controllerAs: 'docs',
			resolve: {
				Outline: function(Docs) {
					return Docs.Outline();
				}
			}
		})
		.state( 'base.docs.section', {
			url: '/:sectionID',
			templateUrl: 'docs/templates/section.tpl.html',
			controller: 'DocsSectionCtrl',
			controllerAs: 'docsSection',
			resolve: {
				Section: function($stateParams, Docs) {
					return Docs.GetSection($stateParams.sectionID);
				}
			}
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
				Resource: function($stateParams, Docs) {
					return Docs.GetResource($stateParams.sectionID, $stateParams.resourceID);
				}
			}
		})
		.state( 'base.docs.section.resource.endpoint', {
			url: '/:endpointID',
			templateUrl: 'docs/templates/endpoint.tpl.html',
			controller: 'DocsEndpointCtrl',
			controllerAs: 'docsEndpoint',
			resolve: {
				Endpoint: function($stateParams, Docs) {
					return Docs.GetEndpoint($stateParams.sectionID, $stateParams.resourceID, $stateParams.endpointID);
				}
			}
		})
}

function DocsController( Outline ) {
	var vm = this;
	vm.outline = Outline;
	vm.ReadmeScripts = [
		"{\n\t\"Meta\": {\n\t\t\"Page\": 1,\n\t\t\"PageSize\": 20,\n\t\t\"TotalCount\": 25,\n\t\t\"TotalPages\": 2,\n\t\t\"ItemRange\": [1,20]\n\t},\n\t\"Items\": [\"...\"]\n}",
		"[{\n\t\"ErrorCode\": \"FirstNameRequired\",\n\t\"Message\": \"First Name is required.\"\n},\n{\n\t\"ErrorCode\": \"LastNameRequired\",\n\t\"Message\": \"Last Name is required.\"\n}]"
	];
}

function DocsSectionController( Section ) {
	var vm = this;
	vm.Section = Section;
}

function DocsResourceController ( $state, Resource ) {
	var vm = this;
	vm.Resource = Resource;
	$state.go('base.docs.section.resource.endpoint', {endpointID:vm.Resource.Endpoints[0].ID})
}

function DocsEndpointController ( Endpoint ) {
	var vm = this;
	vm.Endpoint = Endpoint;
	vm.setMaxLines = function(editor) {
		editor.setOptions({
			maxLines:100
		});
	};
}

function DocsFactory($resource, apiurl) {
	var service = {
		All: _getall,
		Outline: _getoutline,
		Sections: _listsections,
		GetSection: _getsection,
		Resources: _listresources,
		GetResource: _getresource,
		Endpoints: _listendpoints,
		GetEndpoint: _getendpoint
	};

	function _getall() {
		return $resource(apiurl + '/v1/docs').get().$promise;
	}

	function _getoutline() {
		return $resource(apiurl + '/v1/docs/outline').get().$promise;
	}

	function _listsections() {
		return $resource(apiurl + '/v1/docs/sections').get().$promise;
	}

	function _getsection(section) {
		return $resource(apiurl + '/v1/docs/sections/:section', { 'section':section }).get().$promise;
	}

	function _listresources(section) {
		return $resource(apiurl + '/v1/docs/sections/:section/resources', { 'section':section }).get().$promise;
	}

	function _getresource(section, resource) {
		return $resource(apiurl + '/v1/docs/sections/:section/resources/:resource', { 'section':section, 'resource': resource }).get().$promise;
	}

	function _listendpoints(section, resource) {
		return $resource(apiurl + '/v1/docs/sections/:section/resources/:resource/endpoints', { 'section':section, 'resource': resource }).get().$promise;
	}

	function _getendpoint(section, resource, endpoint) {
		return $resource(apiurl + '/v1/docs/sections/:section/resources/:resource/endpoints/:endpoint', { 'section':section, 'resource': resource, 'endpoint': endpoint }).get().$promise;
	}

	return service;
}
