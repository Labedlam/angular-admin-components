angular.module('orderCloud')
    .factory('ProductManagementModal', ProductManagementModalFactory)
    .controller('CreatePriceScheduleModalCtrl', CreatePriceScheduleModalController)
    .controller('EditPriceScheduleModalCtrl', EditPriceScheduleModalController)
    .controller('EditProductModalCtrl', EditProductModalController)
;

function ProductManagementModalFactory($uibModal, $q, OrderCloud, Underscore) {
    return {
        CreatePriceSchedule : _createPriceSchedule,
        EditPriceSchedule : _editPriceSchedule,
        EditProduct : _editProduct,
    };

    function _createPriceSchedule(){
        $uibModal.open({
            templateUrl: 'productManagement/modals/templates/createPriceSchedule.html',
            controller: 'CreatePriceScheduleModalCtrl',
            controllerAs: 'createPriceScheduleModal',
            size: 'lg'
        })
    }

    function _editPriceSchedule(priceSchedule) {

        var priceSchedule = angular.copy(priceSchedule);
        return $uibModal.open({
            templateUrl: 'productManagement/modals/templates/editPriceSchedule.html',
            controller: 'EditPriceScheduleModalCtrl',
            controllerAs: 'editPriceScheduleModal',
            size: 'lg',
            resolve: {
                SelectedPriceSchedule: function() {
                    return priceSchedule;
                },
                ProductsAssignedToPriceSchedule: function(){

                    var productsAssignedToPriceSchedule = [];
                    var dfd = $q.defer();
                    OrderCloud.Products.ListAssignments(null, null, null, null, priceSchedule.ID, null, null, null )
                        .then(function(data){
                            angular.forEach(data.Items, function(assignment){
                                productsAssignedToPriceSchedule.push(assignment.ProductID)
                            });
                            productsAssignedToPriceSchedule = Underscore.uniq(productsAssignedToPriceSchedule);
                            dfd.resolve(productsAssignedToPriceSchedule)
                        });
                    return dfd.promise;
                }
            }
        }).result
    }

    function _editProduct(productID){
        $uibModal.open({
            animation: true,
            templateUrl: 'productManagement/modals/templates/editProduct.html',
            controller: 'EditProductModalCtrl',
            controllerAs: 'editProductModal',
            size: 'lg',
            resolve: {
                SelectedProduct: function ($stateParams, OrderCloud) {
                    return OrderCloud.Products.Get(productID);
                }
            }
        });

    }
}

function CreatePriceScheduleModalController($uibModalInstance, $exceptionHandler, toastr, OrderCloud, PriceBreak) {
    var vm = this;
    vm.priceSchedule = {};
    vm.priceSchedule.RestrictedQuantity = false;
    vm.priceSchedule.PriceBreaks = [];
    vm.priceSchedule.MinQuantity = 1;
    vm.priceSchedule.OrderType = 'Standard';

    vm.addPriceBreak = function () {
        PriceBreak.AddPriceBreak(vm.priceSchedule, vm.price, vm.quantity);
        vm.quantity = null;
        vm.price = null;
    };

    vm.deletePriceBreak = PriceBreak.DeletePriceBreak;

    vm.submit = function () {
        vm.priceSchedule = PriceBreak.SetMinMax(vm.priceSchedule);
        OrderCloud.PriceSchedules.Create(vm.priceSchedule)
            .then(function (data) {
                $uibModalInstance.close(data);
                toastr.success('Price Schedule Created', 'Success')
            })
            .catch(function (ex) {
                $exceptionHandler(ex)
            });
    };

    vm.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
};

function EditPriceScheduleModalController($q, $state, $exceptionHandler, $uibModalInstance, toastr, OrderCloud, SelectedPriceSchedule, PriceBreak , ProductsAssignedToPriceSchedule, OrderCloudConfirm) {
    var vm = this;

    vm.priceSchedule = SelectedPriceSchedule;
    vm.productsAssignedToPriceSchedule = ProductsAssignedToPriceSchedule;

    PriceBreak.AddDisplayQuantity(vm.priceSchedule);



    vm.addPriceBreak =  function(){
        PriceBreak.AddPriceBreak(vm.priceSchedule, vm.price, vm.quantity);
        vm.quantity = null;
        vm.price = null;
    };
    vm.deletePriceBreak = function(priceSchedule, index){
        PriceBreak.DeletePriceBreak(priceSchedule, index)
    };

    vm.cancel = function() {
        $uibModalInstance.dismiss();
    };

    vm.submit = function() {
        //loading indicator promise
        var df =  $q.defer();
        df.templateUrl = 'common/loading-indicators/templates/view.loading.tpl.html';
        df.message = 'Editing Price Schedule';
        vm.loading = df;

        OrderCloud.PriceSchedules.Patch(vm.priceSchedule.ID, vm.priceSchedule)
            .then(function(data){
                df.resolve(data);
                $uibModalInstance.close(data);
            })
            .catch(function(error){
                $exceptionHandler(error);
            });
    };

    vm.Delete = function(){
        OrderCloudConfirm.Confirm("Are you sure you want to delete this Price Schedule, it may be assigned to other products?")
            .then(function(){
                var df = $q.defer();
                df.templateUrl = 'common/loading-indicators/templates/view.loading.tpl.html';
                df.message = 'Deleting Selected Price Schedule';
                vm.loading = df;

                OrderCloud.PriceSchedules.Delete(vm.priceSchedule.ID)
                    .then(function(){

                        df.resolve();
                        $uibModalInstance.close();
                        toastr.success('Price Schedule Deleted', 'Success');
                        $state.go('.', {}, {reload: true});
                    })
                    .catch(function(error) {
                        $exceptionHandler(error);
                    });
            });
    }
}

function EditProductModalController($exceptionHandler, $uibModalInstance, $state, $stateParams, toastr, OrderCloud, OrderCloudConfirm, SelectedProduct) {
    var vm = this,
        productid = angular.copy(SelectedProduct.ID);
    vm.productName = angular.copy(SelectedProduct.Name);
    vm.productID = $stateParams.productid;
    vm.product = SelectedProduct;

    vm.updateProduct = function() {
        OrderCloud.Products.Update(productid, vm.product)
            .then(function() {
                $state.go('products.detail', {}, {reload: true});
                toastr.success('Product Updated', 'Success');
                vm.submit();
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    vm.deleteProduct = function(){
        OrderCloudConfirm.Confirm('Are you sure you want to delete this product?')
            .then(function(){
                OrderCloud.Products.Delete(vm.productID)
                    .then(function() {
                        toastr.success('Product Deleted', 'Success');
                        vm.submit();
                        $state.go('products', {}, {reload: true});
                    })
                    .catch(function(ex) {
                        $exceptionHandler(ex)
                    });
            });
    };

    vm.submit = function() {
        $uibModalInstance.close();
    };

    vm.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

}


