angular.module('orderCloud')
    .config(CatalogsConfig)
    .controller('CatalogsCtrl', CatalogsController)
    .controller('CatalogDetailsCtrl', CatalogDetailsController)
    .controller('CatalogAssignModalCtrl', CatalogAssignModalController)
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
}

function CatalogsController($uibModal, BuyersList, CatalogsList){
    var vm = this;
    vm.buyers = BuyersList;
    vm.list = CatalogsList;

    vm.assignCatalogModal = function() {
        $uibModal.open({
            animation: true,
            templateUrl: 'catalogs/templates/catalogAssign.modal.tpl.html',
            controller: 'CatalogAssignModalCtrl',
            controllerAs: 'catalogAssignModal',
            size: 'lg',
            resolve: {
                BuyersList : function() {
                    return vm.buyers;
                },
                CatalogsList: function() {
                    return vm.list;
                }
            }
        });
    };
}

function CatalogDetailsController(SelectedCatalog, Assignments){
    var vm = this;
    vm.selectedCatalog = SelectedCatalog;
    vm.assignments = Assignments;

    console.log('catalog', vm.selectedCatalog);
    console.log('assign', vm.assignments);
}

function CatalogAssignModalController(OrderCloud, $uibModalInstance, Assignments, BuyersList){
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

    vm.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
}