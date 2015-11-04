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
							DevCenter.Me.Get()
								.then(function(currentUser) {
									if (currentUser.TrialDateStart) {
										var today = new Date();
										var trialStart = new Date(currentUser.TrialDateStart);
										var trialEnd = new Date(trialStart.setDate(trialStart.getDate() + 30));
										currentUser.Expired = today >= trialEnd;
									}
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
			StateRef: 'base.sdk'
		},
		{
			Display: 'Seed Overview',
			Description: 'Seed overview Description',
			StateRef: 'base.seed'
		},
		{
			Display: 'Components Overview',
			Description: 'Component overview Description',
			StateRef: 'base.components'
		},
		{
			Display: 'Integrations Overview',
			Description: 'Integration platform Description',
			StateRef: 'base.integrations'
		}
	]
}
