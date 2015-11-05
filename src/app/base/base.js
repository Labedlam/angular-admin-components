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

										var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
										currentUser.TrialDaysRemaining = Math.round(Math.abs((today.getTime() - trialEnd.getTime())/(oneDay)));
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
			Display: 'Angular SDK',
			Description: 'Four51 has developed a sophisticated SDK for the AngularJS framework. Unleash the power of OrderCloud by combining this tool with the Angular Seed.',
			StateRef: 'base.sdk'
		},
		{
			Display: 'Angular Seed',
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
	];
	vm.resourcesDropdown.activeItem = vm.resourcesDropdown[0];
}
