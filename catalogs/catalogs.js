angular.module('orderCloud')
    .config(CatalogsConfig)
    .controller('CatalogsCtrl', CatalogsController)
    .controller('CatalogCreateCtrl', CatalogCreateController)
;

function CatalogsConfig($stateProvider){
    $stateProvider
        .state('catalogs', {
            parent: 'base',
            url: '/catalogs?search?page?pageSize?searchOn?sortBy?filters',
            templateUrl: 'catalogs/templates/catalogs.tpl.html',
            controller: 'CatalogsCtrl',
            controllerAs: 'catalogs',
            resolve: {
                Parameters: function ($stateParams, OrderCloudParameters) {
                    return OrderCloudParameters.Get($stateParams);
                },
                CatalogsList: function (OrderCloud, Parameters) {
                    return OrderCloud.Catalogs.List(Parameters.search, Parameters.page, Parameters.pageSize || 12, Parameters.searchOn, Parameters.sortBy);
                }
            }
        })
        .state('catalogs.create', {
            url: '/create?catalogid',
            templateUrl: 'catalogs/templates/createNewCatalog.tpl.html',
            controller: 'CatalogCreateCtrl',
            controllerAs: 'catalogCreate'
        });
}

function CatalogsController($state, $ocMedia, OrderCloud, OrderCloudParameters, Parameters, CatalogsList){
    var vm = this;
    vm.list = CatalogsList;
    vm.parameters = Parameters;
    vm.sortSelection = Parameters.sortBy ? (Parameters.sortBy.indexOf('!') == 0 ? Parameters.sortBy.split('!')[1] : Parameters.sortBy) : null;

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

    vm.pageChanged = function(){
        $state.go('.', {page: vm.list.Meta.Page});
    };

    vm.loadMore = function(){
        return OrderCloud.Catalogs.List(Parameters.search, vm.list.Meta.Page + 1, Parameters.pageSize || vm.list.Meta.PageSize, Parameters.searchOn, Parameters.sortBy, Parameters.filters)
            .then(function(data){
                vm.list.Items = vm.list.Items.concat(data.Items);
                vm.list.Meta = data.Meta;
            })
    };

    //vm.deleteCatalog = function(){
    //    OrderCloudConfirm.Confirm('Are you sure you want to delete this catalog?')
    //        .then(function(){
    //            OrderCloud.Catalogs.Delete(vm.catalogID)
    //                .then(function() {
    //                    $state.reload();
    //                    toastr.success('Catalog Deleted', 'Success')
    //                })
    //                .catch(function(ex) {
    //                    $exceptionHandler(ex)
    //                });
    //        });
    //};
}

function CatalogCreateController(OrderCloud, $state, $exceptionHandler, toastr){
    var vm = this;
    vm.catalog = {};

    vm.saveCatalog = function(){
        OrderCloud.Catalogs.Create(vm.catalog)
            .then(function(data){
                vm.catalog.ID = data.ID;
                toastr.success('Catalog Created', 'Success');
                $state.go('catalogs', {}, {reload: true});
            })
            .catch(function(ex){
                $exceptionHandler(ex)
            });
    }

}