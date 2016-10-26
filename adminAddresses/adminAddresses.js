angular.module('orderCloud')
    .config(AdminAddressesConfig)
    .controller('AdminAddressesCtrl', AdminAddressesController)
    .controller('AdminAddressEditCtrl', AdminAddressEditController)
    .controller('AdminAddressCreateCtrl', AdminAddressCreateController)
    //.controller('AdminAddressAssignCtrl', AdminAddressesAssignController)
;

function AdminAddressesConfig($stateProvider){
    $stateProvider
        .state('adminAddresses', {
            parent: 'base',
            templateUrl: 'adminAddresses/templates/adminAddresses.tpl.html',
            controller: 'AdminAddressesCtrl',
            controllerAs: 'adminAddresses',
            url: '',
            data: {componentName: 'AdminAddresses'},
            resolve: {
                Parameters: function($stateParams, OrderCloudParameters) {
                    return OrderCloudParameters.Get($stateParams);
                },
                AddressList: function(OrderCloud, Parameters) {
                    return OrderCloud.AdminAddresses.List(Parameters.search, Parameters.page, Parameters.pageSize || 12, Parameters.searchOn, Parameters.sortBy, Parameters.filters);
                }
            }
        })
        .state('adminAddresses.edit', {
            url: '',
            templateUrl: 'adminAddresses/templates/adminAddressEdit.tpl.html',
            controller: 'AdminAddressEditCtrl',
            controllerAs: 'adminAddressEdit',
            resolve: {
                SelectedAdminAddress: function($stateParams, $state, OrderCloud) {
                    return OrderCloud.AdminAddresses.Get($stateParams.addressid).catch(function() {
                        $state.go('^')
                    })
                }
            }
        })
        .state('adminAddresses.create', {
            url: '',
            templateUrl: 'adminAddresses/templates/adminAddressCreate.tpl.html',
            controller: 'AdminAddressCreateCrl',
            controllerAs: 'adminAddressCreate'
        })
}
        //.state('adminAddresses.assign', {
        //    url: '',
        //    templateUrl: 'adminAddresses/templates/adminAddresses.assign.tpl.html',
        //    controller: 'AdminAddressAssignCtrl',
        //    controllerAs: 'adminAddressAssign',
        //    resolve: {
        //        AdminUserGroupList: function(OrderCloud) {
        //            return OrderCloud.AdminUserGroups.List();
        //        },
        //        AssignmentsList: function($stateParams, OrderCloud) {
        //            return OrderCloud.Addresses.ListAssignments($stateParams.addressid);
        //        }
        //    }
        //})


function AdminAddressesController($ocMedia, OrderCloud, OrderCloudParameters, AddressList, Parameters){
    var vm = this;
    vm.list = AddressList;
    vm.parameters = Parameters;
    vm.sortSelection = Parameters.sortBy ? (Parameters.sortBy.indexOf('!') == 0 ? Parameters.sortBy.split('!')[1] : Parameters.sortBy) : null;

    //Check if filters are applied
    vm.filtersApplied = vm.parameters.filters || vm.parameters.from || vm.parameters.to || ($ocMedia('max-width:767px') && vm.sortSelection); //Sort By is a filter on mobile devices
    vm.showFilters = vm.filtersApplied;

    //Check if search was used
    vm.searchResults = Parameters.search && Parameters.search.length > 0;

    //Reload the state with new parameters
    vm.filter = function(resetPage) {
        $state.go('.', OrderCloudParameters.Create(vm.parameters, resetPage));
    };

    //Reload the state with new search parameters & reset the page
    vm.search = function() {
        vm.filter(true);
    };

    //Clear the search parameters, reload the state & reset the page
    vm.clearSearch = function() {
        vm.parameters.search = null;
        vm.filter(true);
    };

    //Clear relevant filters, reload the state & reset the page
    vm.clearFilters = function() {
        vm.parameters.filters = null;
        vm.parameters.from = null;
        vm.parameters.to = null;
        $ocMedia('max-width: 767px') ? vm.parameters.sortBy = null : angular.noop(); //Clear sort by on mobile devices
        vm.filter(true);
    };

    //Conditionally set, reverse, remove the sortBy parameters & reload the state
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

    //Used on mobile devices
    vm.reverseSort = function() {
        Parameters.sortBy.indexOf('!') == 0 ? vm.parameters.sortBy = Parameters.sortBy.split('!')[1] : vm.parameters.sortBy = '!' + Parameters.sortBy;
        vm.filter(false);
    };

    //Reload the state with the incremented page parameter
    vm.pageChanged = function() {
        $state.go('.', {page:vm.list.Meta.Page});
    };

    //Load the next page of results with all of the same parameters
    vm.loadMore = function() {
        return OrderCloud.AdminAddresses.List(Parameters.search, vm.list.Meta.Page + 1, Parameters.pageSize || vm.list.Meta.PageSize, Parameters.searchOn, Parameters.filters)
            .then(function(data) {
                vm.list.Items = vm.list.Items.concat(data.Items);
                vm.list.Meta = data.Meta;
            });
    };

}

function AdminAddressEditController($exceptionHandler, $state, $scope, toastr, OrderCloud, OCGeography, SelectedAdminAddress) {
    var vm = this,
        adminAddressID = SelectedAdminAddress.ID;
    vm.adminAddressName = SelectedAdminAddress.AddressName;
    vm.adminAddress = SelectedAdminAddress;
    vm.countries = OCGeography.Countries;
    vm.states = OCGeography.States;

    $scope.$watch(function() {
        return vm.address.Country
    }, function() {
        vm.adminAddress.State = null;
    });

    vm.Submit = function() {
        OrderCloud.AdminAddresses.Update(adminAddressID, vm.adminAddress);
    }
}