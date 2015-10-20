angular.module('orderCloud')
	.config(AdminGroupsConfig)
	.controller('AdminGroupsCtrl', AdminGroupsController)
;

function AdminGroupsConfig( $stateProvider ) {
	$stateProvider
		.state( 'base.adminGroups', {
			url: '/admin-groups',
			templateUrl:'adminGroups/templates/adminGroups.tpl.html',
			controller:'AdminGroupsCtrl',
			controllerAs: 'adminGroups',
			resolve: {
				CanCreateGroup: function($q, CurrentUser) {
					var deferred = $q.defer();
					CurrentUser.CreateGroups ? deferred.resolve() : deferred.reject();
					return deferred.promise;
				}
			}
		})
}

function AdminGroupsController(CanCreateGroup, DevCenter) {
	var vm = this;

	vm.newGroup = {
		ID: null,
		Name: null
	};

	vm.submit = function() {
		DevCenter.UserGroups.Create(vm.newGroup).then(function(data){
			//TODO: Success Page for Group Created
		})
	}
}