angular.module( 'orderCloud' )

	.config( DevInstancesConfig )
	.controller( 'DevInstancesCtrl', DevInstancesController )
	.controller( 'DevInstanceCreateCtrl', DevInstanceCreateController )

;

function DevInstancesConfig( $stateProvider ) {
	$stateProvider
		.state( 'base.instancesList', {
			url: '/instances',
			templateUrl:'devInstances/templates/devInstances.tpl.html',
			controller:'DevInstancesCtrl',
			controllerAs: 'instances',
			resolve: {
				AvailableInstances: function(DevCenter) {
					return DevCenter.Me.GetAccess()
				}
			}
		})
		.state( 'base.newInstance', {
			url: '/new-instance',
			templateUrl:'devInstances/templates/devInstance.create.tpl.html',
			controller:'DevInstanceCreateCtrl',
			controllerAs: 'instanceCreate',
			resolve: {
				CanCreateInstance: function($q, CurrentUser) {
					var deferred = $q.defer();
					CurrentUser.CreateCompanies ? deferred.resolve() : deferred.reject();
					return deferred.promise;
				}
			}
		})
}

function DevInstancesController(AvailableInstances) {
	var vm = this;
	vm.list = AvailableInstances.Items;
	vm.selectedInstance = null;
	vm.selectInstance = function(scope) {
		vm.selectedInstance = scope.instance;
	}
}

function DevInstanceCreateController($timeout, CanCreateInstance, DevCenter) {
	var vm = this;

	vm.information = {
		"CompanyName": null,
		"Email": null,
		"Username": null,
		"Password": null,
		"FirstName": null,
		"LastName": null
	};

	var searching;
	vm.searchDevGroups = function(model) {
		if (!model || model.length < 2) return;
		if (searching) $timeout.cancel(searching);
		searching = $timeout((function() {
			//TODO: waiting for a search term to be available on DevGroup list
			return DevCenter.Me.Groups(1, 10, true).then(function(data) {
				return data.Items;
			});
		}), 300);
		return searching;
	};

	vm.selectGroup = function(item) {
		vm.assignedGroupID = item.ID;
	};

	vm.submit = function() {
		DevCenter.Company.Create(vm.information, vm.assignedGroupID).then(function(data) {
			//TODO: Success Page for Created Company
		});
	}
}