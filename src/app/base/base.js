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
				CurrentUser: function($q, Auth, Me) {
					var deferred = $q.defer();
					Auth.IsAuthenticated()
						.then(function() {
							Me.Get()
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
			Display: 'Console',
			Description: 'The Console is an interactive tool for using the OrderCloud API to perform basic CRUD operations against your available instances.',
			StateRef: 'base.console'
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
