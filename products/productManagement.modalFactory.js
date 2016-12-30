angular.module('orderCloud')
    .factory('ProductManagementModal', ProductManagementModalFactory)
    .controller('EditPriceScheduleModalCtrl', EditPriceScheduleModalController)
    .controller('ProductCategoryAssignmentModalCtrl', ProductCategoryAssignmentModalController);

function ProductManagementModalFactory($uibModal) {
    return {
        EditPriceSchedule: _editPriceSchedule,
        ProductCategoryAssignment: _productCategoryAssignment
    };

    function _editPriceSchedule(priceSchedule) {
        var ps = angular.copy(priceSchedule);
        return $uibModal.open({
            templateUrl: 'products/templates/productManagement.editPriceSchedule.modal.tpl.html',
            controller: 'EditPriceScheduleModalCtrl',
            controllerAs: 'editPriceSchedule',
            size: 'md',
            resolve: {
                SelectedPriceSchedule: function() {
                    return ps;
                }
            }
        }).result;
    }

    function _productCategoryAssignment(categoryid, catalogid) {
        $uibModal.open({
            templateUrl: 'products/templates/assign.modal.tpl.html',
            controller: 'ProductCategoryAssignmentModalCtrl',
            controllerAs: 'assignProduct',
            size: 'lg',
            resolve: {
                CatalogID: function(){
                    return catalogid;
                },
                Category: function(OrderCloud){
                    return OrderCloud.Categories.Get(categoryid);
                },
                ProductList: function(OrderCloud) {
                    var pageSize = 10;
                    return OrderCloud.Products.List(null, null, pageSize)
                        .then(function(data) {
                            data.Meta.PageSize = pageSize;
                            return data;
                        });
                }
            }
        }).result;
    }
}

function EditPriceScheduleModalController($q, $state, $exceptionHandler, $uibModalInstance, toastr, OrderCloud, SelectedPriceSchedule, PriceBreak, OrderCloudConfirm) {
    var vm = this;
    vm.priceSchedule = SelectedPriceSchedule;
    PriceBreak.AddDisplayQuantity(vm.priceSchedule);

    vm.addPriceBreak = function() {
        PriceBreak.AddPriceBreak(vm.priceSchedule, vm.price, vm.quantity);
        vm.quantity = null;
        vm.price = null;
    };
    vm.deletePriceBreak = function(priceSchedule, index) {
        PriceBreak.DeletePriceBreak(priceSchedule, index)
    };

    vm.cancel = function() {
        $uibModalInstance.dismiss();
    };

    vm.submit = function() {
        //loading indicator promise
        var df = $q.defer();
        df.templateUrl = 'common/loading-indicators/templates/view.loading.tpl.html';
        df.message = 'Editing Credit Card';
        vm.loading = df;

        OrderCloud.PriceSchedules.Patch(vm.priceSchedule.ID, vm.priceSchedule)
            .then(function(data) {
                df.resolve();
                $uibModalInstance.close(data);
            })
            .catch(function(error) {
                $exceptionHandler(error);
            });
    };

    vm.Delete = function() {
        OrderCloudConfirm.Confirm('Are you sure you want to delete this Price Schedule? It may be assigned to other products.')
            .then(function() {
                var df = $q.defer();
                df.templateUrl = 'common/loading-indicators/templates/view.loading.tpl.html';
                df.message = 'Deleting Price Schedule';
                vm.loading = df;
                OrderCloud.PriceSchedules.Delete(vm.priceSchedule.ID)
                    .then(function() {
                        df.resolve();
                        $uibModalInstance.close();
                        toastr.success('Price Schedule Deleted', 'Success');
                        $state.go('.', {}, {
                            reload: true
                        });
                    })
                    .catch(function(error) {
                        $exceptionHandler(error);
                    });
            });
    }
}

function ProductCategoryAssignmentModalController($state, $exceptionHandler, $uibModalInstance, toastr, OrderCloud, CatalogID, Category, ProductList) {
    var vm = this;
    vm.list = ProductList;
    vm.parameters = {};
    vm.parameters.pageSize = ProductList.Meta.PageSize;
    vm.sortSelection = null;
    vm.category = Category;
    vm.catalogid = CatalogID;
    vm.selectedProducts = [];

    vm.submit = function(productid){
        vm.loading = {
            templateUrl: 'common/loading-indicators/templates/view.loading.tpl.html',
            message: 'Adding Product'
        };
        var assignment = {
            ProductID: productid,
            CategoryID: vm.category.ID
        };
        vm.loading.promise = OrderCloud.Categories.SaveProductAssignment(assignment, vm.catalogid)
            .then(function(){
                toastr.success('Product Assigned to Category ' + vm.category.ID, 'Success');
            })
            .catch(function(err){
                $exceptionHandler(err);
            });
    };

    vm.cancel = function() {
        $uibModalInstance.dismiss();
    };

    //retrieve list with new parameters
    vm.filter = function() {
        return OrderCloud.Products.List(vm.parameters.search, vm.parameters.page, vm.parameters.pageSize, null, vm.parameters.sortBy)
            .then(function(data) {
                vm.list = data;
            });
    };

    vm.search = function() {
        vm.searchResults = vm.parameters.search && vm.parameters.search.length;
        vm.parameters.page = null;
        vm.filter();
    };

    vm.clearSearch = function() {
        vm.parameters.search = null;
        vm.searchResults = false;
        vm.filter();
    };

    vm.pageChanged = function() {
        vm.selected = _.where(vm.list.Items)
        vm.filter();
    };

    //Load the next page of results with all of the same parameters, used by mobile
    vm.loadMore = function() {
        return OrderCloud.Products.List(vm.parameters.search, vm.list.Meta.Page + 1, vm.parameters.pageSize, null, vm.parameters.sortBy)
            .then(function(data) {
                vm.list.Items = vm.list.Items.concat(data.Items);
                vm.list.Meta = data.Meta;
            });
    };

    //Conditionally set, reverse, remove the sortBy parameter & reload the state
    vm.updateSort = function(value) {
        value ? angular.noop() : value = vm.sortSelection;
        switch (vm.parameters.sortBy) {
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
        vm.parameters.sortBy.indexOf('!') === 0 ? vm.parameters.sortBy = vm.parameters.sortBy.split('!')[1] : vm.parameters.sortBy = '!' + vm.parameters.sortBy;
        vm.filter(false);
    };
}