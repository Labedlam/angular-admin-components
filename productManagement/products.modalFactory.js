angular.module('orderCloud')
    .factory('ProductModalFactory', ProductModalFactory)
    .controller('AssignProductModalCtrl', AssignProductModalController)
;

function ProductModalFactory($uibModal){
    var service =  {
        Assign: _assign
    };

    function _assign() {
        $uibModal.open({
            templateUrl: 'products/templates/assign.modal.tpl.html',
            controller: 'AssignProductModalCtrl',
            controllerAs: 'assignProduct',
            size: 'lg',
            resolve: {
                ProductList: function(OrderCloud){
                    return OrderCloud.Products.List(null, null, 10);
                }
            }
        }).result;
    }
    return service;
}

function AssignProductModalController($state, $exceptionHandler, $uibModalInstance, OrderCloud, ProductList){
    var vm = this;
    vm.list = ProductList;
    vm.parameters = {};
    vm.parameters.pageSize = 10;

    //check if search was used
    vm.searchResults = vm.parameters.search && vm.parameters.search.length;

    //retrieve list with new parameters
    vm.filter = function(){
        console.log('filtering')
        OrderCloud.Products.List(vm.parameters.search, vm.parameters.page)
            .then(function(data){
                vm.list = data;
            });
    };

    vm.search = function(){
        console.log('searching')
        vm.parameters.page = null;
        vm.filter();
    };

    vm.pageChanged = function(){
        vm.filter();
    };

    //Load the next page of results with all of the same parameters, used by mobile
    vm.loadMore = function() {
        return OrderCloud.Products.List(vm.parameters.search, vm.list.Meta.Page + 1, vm.parameters.pageSize)
            .then(function(data) {
                vm.list.Items = vm.list.Items.concat(data.Items);
                vm.list.Meta = data.Meta;
            });
    };

    /*
    TODO Checklist
    ensure pagination works for mobile
    ensure search works for mobile
    ensure item range is correct
    */

    vm.cancel = function(){
        $uibModalInstance.dismiss();
    };

    vm.submit = function(){
        vm.loading = {
            templateUrl:'common/loading-indicators/templates/view.loading.tpl.html',
            message:'Creating Address'
        };
        vm.loading.promise = 'TODO:add func here';
        //TODO: finish func
    };

    vm.addProduct = function(id){
        vm.loading = {
            templateUrl:'common/loading-indicators/templates/view.loading.tpl.html',
            message:'Creating Address'
        };
        vm.loading.promise = 'TODO:add func here';
        //TODO: finish func
    };



}