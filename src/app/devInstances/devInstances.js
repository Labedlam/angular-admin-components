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
				AvailableInstances: function($q, Underscore, DevCenter) {
					var deferred = $q.defer();
					DevCenter.Me.GetAccess().then(function(data) {
						var results = [];
						angular.forEach(data.Items, function(instance) {
							var existingResult = Underscore.where(results, {ClientID: instance.ClientID, UserID: instance.UserID, Claims: instance.Claims})[0];
							if (existingResult) {
								var existingIndex = results.indexOf(existingResult);
								results[existingIndex].DevGroups.push({
									AccessID: instance.ID,
									ID: instance.DevGroupID,
									Name: instance.DevGroupName,
									Accepted: instance.Accepted
								});
							} else {
								instance.DevGroups = [
									{
										AccessID: instance.ID,
										ID: instance.DevGroupID,
										Name: instance.DevGroupName,
										Accepted: instance.Accepted
									}
								];
								delete instance.ID;
								delete instance.DevGroupID;
								delete instance.DevGroupName;
								results.push(instance);
							}
						});
						deferred.resolve(results);
					});
					return deferred.promise;
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

function DevInstancesController($state, $timeout, CurrentUser, DevCenter, Auth, AvailableInstances) {
	var vm = this;
	vm.list = AvailableInstances;
	vm.selectedInstance = null;
	vm.selectInstance = function(scope) {
		vm.selectedInstance = scope.instance;
		vm.selectedInstance.activeTab = 'instance';
	};

	vm.setInstanceTab = function(tabName) {
		vm.selectedInstance.activeTab = tabName;
		vm.groupSearchTerm = null;
		vm.selectedInstance.addNewGroup = false;
	};

	var searching;
	vm.searchDevGroups = function(model) {
		if (!model || model.length < 2) return;
		if (searching) $timeout.cancel(searching);
		searching = $timeout((function() {
			//TODO: waiting for a search term to be available on DevGroup list
			if (CurrentUser.TrialDateStart) {
				return DevCenter.Me.Groups.List(1, 10).then(function(data) {
					return data.Items;
				});
			}
			return DevCenter.Group.List(model, 1, 10).then(function(data) {
				return data.Items;
			});

		}), 300);
		return searching;
	};

	vm.shareAccess = function(group) {
		if (!vm.selectedInstance) return;
		vm.selectedInstance.DevGroupID = group.ID;
		vm.selectedInstance.DevGroupName = group.Name;
		DevCenter.AccessToken(vm.selectedInstance.DevGroups[0].AccessID).then(function(data) {
			Auth.RemoveToken();
			DevCenter.SaveGroupAccess(vm.selectedInstance, ('Bearer ' + data['access_token'])).then(function(data) {
				console.log('Group Access');
				console.dir(data);
				vm.selectedInstance.DevGroups.push({
					ID:group.ID,
					Name:group.Name
				});
				vm.groupSearchTerm = null;
				vm.selectedInstance.addNewGroup = false;
			})
		})
	};

	vm.deleteAccess = function(scope) {
		DevCenter.AccessToken(scope.group.AccessID)
			.then(function(data) {
				Auth.RemoveToken();
				DevCenter.DeleteGroupAccess(scope.group.AccessID, ('Bearer ' + data['access_token']))
					.then(function() {
						vm.selectedInstance.DevGroups.splice(vm.selectedInstance.DevGroups.indexOf(scope.group), 1);
					})
			})
	}
}

function DevInstanceCreateController($state, $timeout, DevCenter) {
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
			//Only search on your own dev groups when creating an instance
			//TODO: waiting for a search term to be available on Me.DevGroup list
			return DevCenter.Me.Groups.List(1, 10).then(function(data) {
				return data.Items;
			});
		}), 300);
		return searching;
	};

	vm.selectGroup = function(item) {
		vm.assignedGroupID = item.ID;
	};

	vm.submit = function() {
		DevCenter.Company.Create(vm.information, vm.assignedGroupID).then(function() {
			$state.go('base.instancesList');
		});
	}
}