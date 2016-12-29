angular.module('orderCloud')
    .factory('CategoryModalFactory', CategoryModalFactory)
    .controller('CreateCategoryModalCtrl', CreateCategoryModalController)
;

function CategoryModalFactory($uibModal){
    var service =  {
        Create: _create
    };

    function _create(parentid) {
        $uibModal.open({
            templateUrl: 'categories/templates/create.modal.tpl.html',
            controller: 'CreateCategoryModalCtrl',
            controllerAs: 'createCategory',
            size: 'md',
            resolve: {
                ParentID: function(){
                    return parentid;
                }
            }
        }).result;
    }
    return service;
}

function CreateCategoryModalController($state, $exceptionHandler, $uibModalInstance, OrderCloud, ParentID){
    var vm = this;
    vm.category = {ParentID:ParentID, Active: true};

    vm.cancel = function(){
        $uibModalInstance.dismiss();
    };

    vm.submit = function() {
        if (vm.category.ParentID === '') {
            vm.category.ParentID = null;
        }
        vm.loading = {
            templateUrl:'common/loading-indicators/templates/view.loading.tpl.html',
            message:'Creating Category'
        };
        vm.loading.promise = OrderCloud.Categories.Create(vm.category)
            .then(function(category) {
                $uibModalInstance.close(category);
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };
}