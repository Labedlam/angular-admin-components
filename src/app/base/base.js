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
	vm.resourcesDropdown = [
		{
			Display: 'Courses',
			Description: 'Train yourself to use the OrderCloud Platform',
			StateRef: 'base.devcourses'
		},
		{
			Display: 'SDK Overview',
			Description: 'SDK overview Description',
			StateRef: 'base.sdkOverview'
		},
		{
			Display: 'Seed Overview',
			Description: 'Seed overview Description',
			StateRef: 'base.seed'
		},
		{
			Display: 'Components Overview',
			Description: 'Component overview Description',
			StateRef: 'base.docs'
		},
		{
			Display: 'Integrations Overview',
			Description: 'Integration platform Description',
			StateRef: 'base.integrations'
		}
	]
}
