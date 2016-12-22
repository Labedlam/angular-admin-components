angular.module('orderCloud')
    .config(CatalogsConfig)
    .controller('CatalogsCtrl', CatalogsController)
    .controller('CatalogAssignCtrl', CatalogAssignController)
;

function CatalogsConfig($stateProvider){
    $stateProvider
        .state('catalogs', {
            parent: 'base',
            templateUrl: 'catalogs/templates/catalogs.tpl.html',
            url: '/catalogs?search?page?pageSize?searchOn?sortBy?filters',
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
        });
}

function CatalogsController($uibModal, BuyersList, CatalogsList){
    var vm = this;
    vm.buyers = BuyersList;
    vm.catalogs = CatalogsList;

    vm.assignCatalogModal = function() {
        $uibModal.open({
            animation: true,
            templateUrl: 'catalogs/templates/catalogAssign.modal.tpl.html',
            controller: 'CatalogAssignCtrl',
            controllerAs: 'catalogAssign',
            size: 'lg',
            resolve: {
                BuyersList : function() {
                    return vm.buyers;
                },
                CatalogsList: function() {
                    return vm.catalogs;
                }
            }
        });
    };
}

function CatalogAssignController(OrderCloud, $uibModalInstance, Assignments, BuyersList){
    var vm = this;
    vm.buyers = BuyersList;
    //list all buyers;
    //vm.assignments = AssignedBuyers
    //vm.catalogs = CatalogsList;
    vm.saveAssignments = SaveAssignment;

    function SaveFunc(buyerID) {
        return OrderCloud.Catalogs.SaveAssignment({
            BuyerID: buyerID,
            CatalogID: vm.catalogs.Items.ID
        });
    }

    function DeleteFunc(){
        return OrderCloud.Catalogs.DeleteAssignment(vm.buyers.Items.ID, vm.catalogs.Items.ID);
    }

    function SaveAssignment() {
        return Assignments.SaveAssignment(vm.buyers.Items, vm.catalogs.Items, SaveFunc, DeleteFunc, 'buyerID');
    }

    vm.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
}