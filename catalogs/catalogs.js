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
                AssignedBuyers: function($stateParams, OrderCloud, Parameters) {
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
                AssignedBuyers: function($stateParams, OrderCloud, Parameters) {
                    return OrderCloud.Catalogs.ListAssignments(Parameters.page, Parameters.pageSize, Parameters.buyerID, Parameters.catalogID);
                }
            }
        })
}

function CatalogsController($stateParams, $exceptionHandler, toastr, OrderCloudConfirm, BuyersList, CatalogsList){
    var vm = this;
    vm.buyers = BuyersList;
    vm.list = CatalogsList;
    vm.catalogID = $stateParams.catalogid;

    vm.deleteCatalog = function(){
        OrderCloudConfirm.Confirm('Are you sure you want to delete this catalog?')
            .then(function(){
                OrderCloud.Catalogs.Delete(vm.catalogID)
                    .then(function() {
                        $state.reload();
                        toastr.success('Catalog Deleted', 'Success')
                    })
                    .catch(function(ex) {
                        $exceptionHandler(ex)
                    });
            });
    };
}

function CatalogCreateController(OrderCloud, $state, $exceptionHandler, toastr){
    var vm = this;
    vm.catalog = {};
    vm.catalog.Active = true;
    vm.catalogCreated = false;

    vm.saveCatalog = function(){
        if(vm.catalogCreated) {
            OrderCloud.Catalogs.Update(vm.catalog.ID, vm.catalog)
                .then(function(){
                    toastr.success('Catalog Saved', 'Success');
                    $state.go('catalogs', {catalogid: vm.catalog.ID, fromstate: "catalogCreate"}, {reload: true});
                })
                .catch(function(ex){
                    $exceptionHandler(ex)
                })
        } else {
            OrderCloud.Catalogs.Create(vm.catalog)
                .then(function(data){
                    vm.catalog.ID = data.ID;
                    vm.catalogCreated = true;
                    toastr.success('Catalog Created', 'Success');
                    $state.go('catalogs', {catalogid: vm.catalog.ID, fromstate: "catalogCreate"}, {reload: true});
                })
                .catch(function(ex){
                    $exceptionHandler(ex)
                });
        }
    }

}

function CatalogDetailsController(SelectedCatalog, AssignedBuyers){
    var vm = this;
    vm.selectedCatalog = SelectedCatalog;
    vm.assignments = AssignedBuyers;
}

function CatalogAssignController(OrderCloud, SelectedCatalog, Assignments, toastr, AssignedBuyers, BuyersList){
    var vm = this;
    vm.selectedCatalog = SelectedCatalog;
    vm.buyers = BuyersList;
    vm.assignedBuyers = AssignedBuyers;
    //vm.catalogs = CatalogsList;
    vm.saveAssignments = SaveAssignment;

    function SaveFunc(ItemID) {
        return OrderCloud.Catalogs.SaveAssignment({
            BuyerID: ItemID,
            CatalogID: vm.selectedCatalog.ID
        });
    }

    function DeleteFunc(ItemID){
        return OrderCloud.Catalogs.DeleteAssignment(vm.selectedCatalog.ID, ItemID);
    }

    function SaveAssignment() {
        return Assignments.SaveAssignments(vm.buyers.Items, vm.assignedBuyers.Items, SaveFunc, DeleteFunc, 'buyerID')
            .then(function(){
                toastr.success('Assignment Updated', 'Success')
            });
    }
}