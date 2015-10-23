angular.module('orderCloud')
	.config(DevGroupsConfig)
	.controller('DevGroupsListCtrl', DevGroupsListController)
	.controller('DevGroupCreateCtrl', DevGroupCreateController)
	.controller('DevGroupEditCtrl', DevGroupEditController)
	.controller('DevGroupDetailCtrl', DevGroupDetailController)
;

function DevGroupsConfig( $stateProvider ) {
	$stateProvider
		.state( 'base.groupsList', {
			url: '/groups',
			templateUrl:'devGroups/templates/devGroups.list.tpl.html',
			controller:'DevGroupsListCtrl',
			controllerAs: 'devGroups',
			resolve: {
				AcceptedGroupsList: function($q, DevCenter) {
					var deferred = $q.defer();
					DevCenter.Me.Groups.List(1, 200, true).then(function(data) {
						var queue = [];
						angular.forEach(data.Items, function(group) {
							var members = [],
								instances = [];
							queue.push((function() {
								var df = $q.defer();
								DevCenter.Group.ListMemeberAssignments(group.ID)
									.then(function(mData) {
										members = members.concat(mData.Items);
										DevCenter.Group.GetAccess(group.ID)
											.then(function(aData) {
												instances = instances.concat(aData.Items);
												group.Members = members;
												group.Instances = instances;
												df.resolve();
											})
									});
								return df.promise;
							})());
						});
						$q.all(queue).then(function() {
							deferred.resolve(data.Items);
						})
					});
					return deferred.promise;
				},
				PendingGroupsList: function($q, DevCenter) {
					return DevCenter.Me.Groups.List(1, 200, false);
				}
			}
		})
		.state( 'base.newGroup', {
			url: '/new-group',
			templateUrl:'devGroups/templates/devGroup.create.tpl.html',
			controller: 'DevGroupCreateCtrl',
			controllerAs: 'devGroupCreate',
			resolve: {
				CanCreateGroup: function($q, CurrentUser) {
					var deferred = $q.defer();
					CurrentUser.CreateGroups ? deferred.resolve() : deferred.reject();
					return deferred.promise;
				}
			}
		})
		.state( 'base.editGroup', {
			url: '/groups/:groupID/settings',
			templateUrl: 'devGroups/templates/devGroup.edit.tpl.html',
			controller: 'DevGroupEditCtrl',
			controllerAs: 'devGroupEdit',
			resolve: {
				SelectedGroup: function($q, $stateParams, DevCenter) {
					var deferred = $q.defer();
					DevCenter.Me.Groups.Get($stateParams.groupID).then(function(data) {
						data.GroupAdmin ? deferred.resolve(data) : deferred.reject();
					});
					return deferred.promise;
				}
			}
		})
		.state( 'base.groupDetail', {
			url: '/groups/:groupID',
			templateUrl: 'devGroups/templates/devGroup.detail.tpl.html',
			controller: 'DevGroupDetailCtrl',
			controllerAs: 'devGroupDetail',
			resolve: {
				SelectedGroup: function($stateParams, DevCenter) {
					return DevCenter.Me.Groups.Get($stateParams.groupID);
				},
				GroupMembers: function($stateParams, DevCenter) {
					return DevCenter.Group.ListMemeberAssignments($stateParams.groupID);
				},
				GroupInstances: function($stateParams, DevCenter) {
					return DevCenter.Group.GetAccess($stateParams.groupID);
				}
			}
		})
}

function DevGroupsListController($state, AcceptedGroupsList, PendingGroupsList, CurrentUser, DevCenter) {
	var vm = this;
	vm.searchTerm = null;

	vm.activeTab = AcceptedGroupsList.length ? 'accepted' : 'pending';

	vm.setTab = function(tabName) {
		vm.activeTab = tabName;
	};

	vm.acceptedList = AcceptedGroupsList;
	vm.pendingList = PendingGroupsList.Items;

	vm.acceptInvite = function(scope) {
		DevCenter.Group.SaveMemberAssignment(scope.group.ID, {
			UserID: CurrentUser.ID,
			Accepted: true,
			GroupAdmin: false
		}).then(function() {
			$state.reload()
		})
	};

	vm.leaveGroup = function(scope) {
		DevCenter.Group.DeleteMemberAssignment(scope.group.ID, CurrentUser.ID)
			.then(function() {
				$state.reload();
			})
	};

	vm.declineInvite = function(scope) {
		DevCenter.Group.DeleteMemberAssignment(scope.group.ID, CurrentUser.ID)
			.then(function() {
				$state.reload();
			})
	}
}

function DevGroupCreateController($state, DevCenter) {
	var vm = this;
	vm.newGroup = {
		Name: null,
		Description: null
	};

	vm.submit = function() {
		DevCenter.Group.Create(vm.newGroup).then(function(data){
			$state.go('base.groupsList');
			//TODO: Success Page for Group Created
		})
	}
}

function DevGroupEditController($state, DevCenter, SelectedGroup) {
	var vm = this;
	vm.model = SelectedGroup;

	vm.submit = function() {
		DevCenter.Group.Update(vm.model.ID, vm.model).then(function(data) {
			$state.go('base.groupDetail', {groupID:vm.model.ID});
		})
	};

	vm.deleteGroup = function() {
		DevCenter.Group.Delete(vm.model.ID).then(function(data) {
			$state.go('base.groupsList');
		});
	}
}

function DevGroupDetailController($state, $timeout, DevCenter, SelectedGroup, GroupMembers, GroupInstances) {
	var vm = this,
		selectedAccess,
		selectedUser;
	vm.model = SelectedGroup;
	vm.members = GroupMembers.Items;
	vm.instances = GroupInstances.Items;
	vm.activeTab = 'Members';

	vm.setTab = function(tabName) {
		vm.activeTab = tabName;
	};

	var searchingUsers;
	vm.searchDevUsers = function(model) {
		if (!model || model.length < 2) return;
		if (searchingUsers) $timeout.cancel(searchingUsers);
		searchingUsers = $timeout((function() {
			//TODO: waiting for a search term to be available on DevGroup list
			return DevCenter.Users.List(model, 1, 10).then(function(data) {
				return data.Items;
			});
		}), 300);
		return searchingUsers;
	};

	vm.selectDevUser = function(item) {
		selectedUser = item;
	};

	vm.inviteDevUser = function() {
		if (!selectedUser) return;
		DevCenter.Group.SaveMemberAssignment(vm.model.ID, {
			UserID: selectedUser.ID,
			Accepted: false,
			GroupAdmin: false
		}).then(function() {
			$state.reload();
		})
	};

	vm.removeMember = function(scope) {
		DevCenter.Group.DeleteMemberAssignment(vm.model.ID, scope.member.ID)
			.then(function() {
				$state.reload();
			});
	};

	vm.makeGroupAdmin = function(scope) {
		DevCenter.Group.SaveMemberAssignment(vm.model.ID, {
			UserID: scope.member.ID,
			Accepted: true,
			GroupAdmin: true
		}).then(function() {
			$state.reload();
		})
	};

	vm.demoteMember = function(scope) {
		DevCenter.Group.SaveMemberAssignment(vm.model.ID, {
			UserID: scope.member.ID,
			Accepted: true,
			GroupAdmin: false
		}).then(function() {
			$state.reload();
		})
	};

	var searchingAccess;
	vm.searchAccess = function(model) {
		if (!model || model.length < 2) return;
		if (searchingAccess) $timeout.cancel(searchingAccess);
		searchingAccess = $timeout((function() {
			//TODO: waiting for a search term to be available on DevGroup list
			return DevCenter.Me.GetAccess(1, 10).then(function(data) {
				return data.Items;
			});
		}), 300);
		return searchingAccess;
	};

	vm.selectAccess = function(item) {
		selectedAccess = item;
	};

	vm.grantAccess = function() {
		if (!selectedAccess) return;
		selectedAccess.DevGroupID = vm.model.ID;
		DevCenter.AccessToken(selectedAccess.ClientID, selectedAccess.UserID).then(function(data) {
			DevCenter.SaveGroupAccess(selectedAccess, true, data['access_token'])
		})
	}

}