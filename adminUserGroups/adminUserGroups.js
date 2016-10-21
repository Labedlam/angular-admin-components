angular.module('orderCloud')
    .config(AdminUserGroupsConfig)
    .controller('AdminUserGroupsCtrl', AdminUserGroupsController)
    .controller('AdminUserGroupEditCtrl', AdminUserGroupEditController)
    .controller('AdminUserGroupCreateCtrl', AdminUserGroupCreateController)
    .controller('AdminUserGroupAssignCtrl', AdminUserGroupAssignController)
;

function AdminUserGroupsConfig($stateProvider) {
    $stateProvider
        .state('adminUserGroups', {
            parent: 'base',
            templateURL: 'adminUserGroups/templates/adminUserGroups.tpl.html',
            controller: 'AdminUserGroupsCtrl',
            controllerAs: 'adminUserGroups',
            url: '',
            data: {componentName: 'Admin User Groups'},
            resolve: {
                Parameters: function($stateParams, OrderCloudParameters) {
                    return OrderCloudParameters.Get($stateParams);
                },
                AdminUserGroupList: function(OrderCloud, Parameters) {
                    return OrderCloud.AdminUserGroups.List(Parameters.search, Parameters.page, Parameters.pageSize || 12, Parameters.searchOn, Parameters.sortBy, Parameters.filters);
                }
            }
        })
        .state('adminUserGroups.edit', {
            url: '/:adminusergroupid/edit',
            templateURL: '/adminUserGroups/templates/adminUserGroupEdit.tpl.html',
            controller: 'AdminUserGroupEditCtrl',
            controllerAs: 'adminUserGroupsEdit',
            resolve: {
                SelectedAdminUserGroup: function($stateParams, OrderCloud) {
                    return OrderCloud.AdminUserGroups.Get($stateParams.adminusergroupid);
                }
            }
        })
        .state('adminUserGroups.create', {
            url: '/:adminusergroupid/create',
            templateURL: '/adminUserGroups/templates/adminUserGroupCreate.tpl.html',
            controller: 'AdminUserGroupCreateCtrl',
            controllerAs: 'adminUserGroupCreate'
        })
        .state('adminUserGroups.assign', {
            url: '/:adminusergroupid/assign',
            templateURL: '/adminUserGroups/templates/adminUserGroupAssign.tpl.html',
            controller: 'AdminUserGroupAssignCtrl',
            controllerAs: 'adminUserGroupAssign',
            resolve: {
                AdminUserList: function(OrderCloud) {
                    return OrderCloud.AdminUsers.List(null, 1, 20);
                },
                AssignedAdminUsers: function($stateParams, OrderCloud){
                    return OrderCloud.AdminUserGroups.ListUserAssignments($stateParams.adminusergroupid);
                },
                SelectedAdminUserGroup: function($stateParams, OrderCloud) {
                    return OrderCloud.AdminUserGroups.Get($stateParams.adminusergroupid);
                }
            }
        })
    ;
}

function AdminUserGroupsController($state, $ocMedia, OrderCloud, OrderCloudParameters, AdminUserGroupList, Parameters){
    var vm = this;
    vm.list = AdminUserGroupList;
    vm.parameters = Parameters;

    //check if filters are applied:
    vm.filtersApplied = vm.parameters.filters || ($ocMedia('max-width: 767px') && vm.sortSelection);
    vm.showFilters = vm.filtersApplied;

    //check if search was used:
    vm.searchResults = Parameters.search && Parameters.search.length > 0;

    //reload the state with new parameters:
    vm.filter = function(resetPage) {
        $state.go('.', OrderCloudParameters.Create(vm.parameters, resetPage));
    };

    //reload the state with new search parameters & reset the page
    vm.search = function() {
        vm.filter(true);
    };

    //clear the search parameter, reload the state & reset the page
    vm.clearSearch = function() {
        vm.parameters.search = null;
        vm.filter(true);
    };

    //clear the relevant filters, reload the state & reset the page
    vm.clearFilters = function() {
        vm.parameters.filters = null;
        $ocMedia('max-width: 767px') ? vm.parameters.sortBy = null : angular.noop();
        vm.filter(true);
    };

    //conditionally set, reverse, and remove the sortBy parameters & reload the state
    vm.updateSort = function(value) {
        value ? angular.noop() : value = vm.sortSelection;
        switch(vm.parameters.sortBy) {
            case value:
                vm.parameters.sortBy = '!' + value;
                break;
            case '!' + value:
                vm.parameters.sortBy = null;
                break;
            default:
                vm.parameters.sortBy = value;
        }
        vm.filter(false);
    };

    vm.reverseSort = function() {
        Parameters.sortBy.indexOf('!') == 0 ? vm.parameters.sortBy = Parameters.sortBy.split("!")[1] : vm.parameters.sortBy = '!' + Parameters.sortBy;
        vm.filter(false);
    };

    //reload the state with the incremented page parameter
    vm.pageChanged = function() {
        $state.go('.', {page: vm.list.Meta.Page});
    };

    //load the next page of results with all the same parameters
    vm.loadMore = function() {
        return OrderCloud.AdminUserGroups.List(Parameters.search, vm.list.Meta.Page + 1, Parameters.pageSize || vm.list.Meta.PageSize, Parameters.searchOn, Parameters.sortBy, Parameters.filters)
            .then(function(data) {
                vm.list.Items = vm.list.Items.concat(data.Items);
                vm.list.Meta = data.Meta;
            });
    };
}

function AdminUserGroupEditController($exceptionHandler, $state, toastr, OrderCloud, SelectedAdminUserGroup) {
    var vm = this,
        adminGroupID = SelectedAdminUserGroup.ID;
    vm.adminUserGroupName = SelectedAdminUserGroup.Name;
    vm.adminUserGroup = SelectedAdminUserGroup;

    vm.submit = function() {
        OrderCloud.AdminUserGroups.Update(adminGroupID, vm.adminUserGroup)
            .then(function(){
                $state.go('adminUserGroups', {}, {reload: true});
                toastr.success('Admin User Group Updated', 'Success');
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    vm.delete = function() {
        OrderCloud.AdminUserGroups.Delete(SelectedAdminUserGroup.ID)
            .then(function(){
                $state.go('adminUserGroups', {}, {reload: true});
            })
            .catch(function(ex){
                $exceptionHandler(ex)
            });
    };
}