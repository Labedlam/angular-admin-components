angular.module('orderCloud')
    .factory('ProductManagementModal', ProductManagementModalFactory)

    .controller('EditPriceScheduleModalCtrl', EditPriceScheduleModalController)
;

function ProductManagementModalFactory($uibModal, $q, OrderCloud, Underscore) {
    return {

        EditPriceSchedule: _editPriceSchedule
    };



    function _editPriceSchedule(priceSchedule) {
        var priceSchedule = angular.copy(priceSchedule);
        return $uibModal.open({
            templateUrl: 'products/templates/productManagement.editPriceSchedule.modal.tpl.html',
            controller: 'EditPriceScheduleModalCtrl',
            controllerAs: 'editPriceSchedule',
            size: 'md',
            resolve: {
                SelectedPriceSchedule: function() {
                    return priceSchedule;
                },
                ProductsAssignedToPriceSchedule: function(){

                    var productsAssignedToPriceSchedule = [];
                    var dfd = $q.defer();
                    OrderCloud.Products.ListAssignments(null, null, null, null, priceSchedule.ID, null, null, null )
                        .then(function(data){
                            console.log("hello this is priceSchedule", data);
                            angular.forEach(data.Items, function(assignment){
                                productsAssignedToPriceSchedule.push(assignment.ProductID)

                            });
                            productsAssignedToPriceSchedule = Underscore.uniq(productsAssignedToPriceSchedule);
                            dfd.resolve(productsAssignedToPriceSchedule)
                        });
                    return dfd.promise;
                }
            }
        }).result;
    }
}



function EditPriceScheduleModalController($q, $state, $exceptionHandler, $uibModalInstance, toastr, OrderCloud, SelectedPriceSchedule, PriceBreak , ProductsAssignedToPriceSchedule, OrderCloudConfirm) {
    var vm = this;
    vm.priceSchedule = SelectedPriceSchedule;
    console.log(ProductsAssignedToPriceSchedule);
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

