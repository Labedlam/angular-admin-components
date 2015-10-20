angular.module( 'orderCloud' )

	.config( BaseConfig )
	.controller( 'BaseCtrl', BaseController )

;

function BaseConfig( $stateProvider ) {
	$stateProvider
		.state( 'base', {
			url: '',
			abstract: true,
			templateUrl:'base/templates/base.tpl.html',
			controller:'BaseCtrl',
			controllerAs: 'base',
			resolve: {
				CurrentUser: function($q, DevAuth, DevCenter) {
					var deferred = $q.defer();
					DevAuth.IsAuthenticated()
						.then(function() {
							//deferred.resolve(null);
							DevCenter.Me.Get()
								.then(function(currentUser) {
									deferred.resolve(currentUser);
								})
						})
						.catch(function() {
							deferred.resolve(null);
						});
					return deferred.promise;
				}
			}
		})
}

function BaseController( CurrentUser ) {
	var vm = this;
	vm.currentUser = CurrentUser;
	vm.exploreDropdown = [
		{
			Display: 'API Docs',
			Description: 'Documentation of the entire OrderCloud RESTful API.  Everything a developer needs to successfully communicate OrderCloud.',
			StateRef: 'base.docs'
		},
		{
			Display: 'SDKs',
			Description: 'SDKs Description',
			StateRef: ''
		},
		{
			Display: 'Seeds',
			Description: 'Seeds Description',
			StateRef: ''
		}
	]
}
