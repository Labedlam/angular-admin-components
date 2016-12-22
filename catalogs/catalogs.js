angular.module('orderCloud')
    .config(CatalogsConfig)
    .controller('CatalogsCtrl', CatalogsController)
    .controller('CatalogDetailsCtrl', CatalogDetailsController)
    .controller('CatalogCreateCtrl', CatalogCreateController)
    .controller('CatalogAssignCtrl', CatalogAssignController)
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
                    return OrderCloud.Catalogs.List(Parameters.search, Parameters.page, Parameters.pageSize, Parameters.searchOn, Parameters.sortBy);
                },
                BuyersList: function (OrderCloud, Parameters) {
                    return OrderCloud.Buyers.List(Parameters.search, Parameters.page, Parameters.pageSize, Parameters.searchOn, Parameters.sortBy);
                }
            }
        })
        .state('catalogs.create', {
            url: '/create?catalogid',
            templateUrl: 'catalogs/templates/createNewCatalog.tpl.html',
            controller: 'CatalogCreateCtrl',
            controllerAs: 'catalogCreate'
        })
        .state('catalogs.details', {
            url: '/:catalogid/details',
            templateUrl: 'catalogs/templates/catalogDetails.tpl.html',
            controller: 'CatalogDetailsCtrl',
            controllerAs: 'catalogDetails',
            resolve: {
                Parameters: function ($stateParams, OrderCloudParameters) {
                    return OrderCloudParameters.Get($stateParams);
                },
                SelectedCatalog: function ($stateParams, OrderCloud) {
                    return OrderCloud.Catalogs.Get($stateParams.catalogid);
                },
                Assignments: function($stateParams, OrderCloud, Parameters) {
                    return OrderCloud.Catalogs.ListAssignments(Parameters.page, Parameters.pageSize, Parameters.buyerID, Parameters.catalogID);
                }
            }
        })
        .state('catalogs.createAssignment', {
            url: '/:catalogid/assignments/new',
            templateUrl: 'catalogs/templates/catalogAssign.tpl.html',
            controller: 'CatalogAssignCtrl',
            controllerAs: 'catalogAssign',
            resolve: {
                SelectedCatalog: function ($stateParams, OrderCloud) {
                    return OrderCloud.Catalogs.Get($stateParams.catalogid);
                },
                Assignments: function($stateParams, OrderCloud, Parameters) {
                    return OrderCloud.Catalogs.ListAssignments(Parameters.page, Parameters.pageSize, Parameters.buyerID, Parameters.catalogID);
                }
            }
        })
}

function CatalogsController(BuyersList, CatalogsList){
    var vm = this;
    vm.buyers = BuyersList;
    vm.list = CatalogsList;

    console.log('list',vm.list);
}

function CatalogCreateController(OrderCloud, $exceptionHandler, toastr){
    var vm = this;
    vm.catalog = {};
    vm.catalog.Active = true;
    vm.catalogCreated = false;

    vm.saveCatalog = function(){
        if(vm.catalogCreated) {
            OrderCloud.Catalogs.Update(vm.catalog.ID, vm.catalog)
                .then(function(){
                    toastr.success('Catalog Saved');
                })
                .catch(function(ex){
                    $exceptionHandler(ex)
                })
        } else {
            OrderCloud.Catalogs.Create(vm.catalog)
                .then(function(data){
                    vm.catalog.ID = data.ID;
                    vm.catalogCreated = true;
                    toastr.success('Catalog Created')
                })
                .catch(function(ex){
                    $exceptionHandler(ex)
                });
        }
    }

}

function CatalogDetailsController(SelectedCatalog, Assignments){
    var vm = this;
    vm.selectedCatalog = SelectedCatalog;
    vm.assignments = Assignments;

    console.log('catalog', vm.selectedCatalog);
    console.log('assign', vm.assignments);
}

function CatalogAssignController(OrderCloud, Assignments, BuyersList){
    var vm = this;
    vm.buyers = BuyersList;
    //list all buyers;
    //vm.assignments = AssignedBuyers
    //vm.catalogs = CatalogsList;
    vm.saveAssignments = SaveAssignment;

    function SaveFunc(buyerID) {
        return OrderCloud.Catalogs.SaveAssignment({
            BuyerID: buyerID,
            CatalogID: vm.list.Items.ID
        });
    }

    function DeleteFunc(){
        return OrderCloud.Catalogs.DeleteAssignment(vm.buyers.Items.ID, vm.list.Items.ID);
    }

    function SaveAssignment() {
        return Assignments.SaveAssignment(vm.buyers.Items, vm.list.Items, SaveFunc, DeleteFunc, 'buyerID');
    }
}