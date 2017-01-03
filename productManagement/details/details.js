angular.module('orderCloud')
    .config(ProductDetailConfig)
    .controller('DetailsCtrl', DetailsController)
;

function ProductDetailConfig($stateProvider) {
    $stateProvider
        .state('products.detail', {
            url: '/:productid/detail',
            templateUrl: 'productManagement/details/templates/details.html',
            controller: 'DetailsCtrl',
            controllerAs: 'details',
            resolve: {
                Parameters: function($stateParams, OrderCloudParameters) {
                    return OrderCloudParameters.Get($stateParams);
                },
                SelectedProduct: function ($stateParams, OrderCloud) {
                    return OrderCloud.Products.Get($stateParams.productid);
                },
                Assignments: function($stateParams, OrderCloud, Parameters) {
                    return OrderCloud.Products.ListAssignments($stateParams.productid, Parameters.productID, Parameters.userID, Parameters.userGroupID, Parameters.level, Parameters.priceScheduleID, Parameters.page, Parameters.pageSize);
                },
                PriceSchedule: function (OrderCloud, $q, Assignments){
                    var priceSchedules = [];
                    var dfd = $q.defer();
                    angular.forEach(Assignments.Items, function(v){
                        priceSchedules.push(OrderCloud.PriceSchedules.Get(v.StandardPriceScheduleID))

                    });
                    $q.all(priceSchedules)
                        .then(function(data){
                            dfd.resolve(data);
                        });
                    return dfd.promise;
                }
            }
        })

}


function DetailsController($stateParams, $exceptionHandler, $state, toastr, OrderCloud, Assignments, SelectedProduct, PriceSchedule, ProductManagementModal){
    var vm = this;

    vm.list = Assignments;
    vm.listAssignments = Assignments.Items;
    vm.product = SelectedProduct;
    vm.productID = $stateParams.productid;
    vm.productName = angular.copy(SelectedProduct.Name);
    vm.schedule = PriceSchedule;

    vm.DeleteAssignment = DeleteAssignment;
    vm.editProduct = editProduct;



    function editProduct() {
        console.log("hello");
         ProductManagementModal.EditProduct($stateParams.productid)
    };

    function DeleteAssignment(scope) {
        OrderCloud.Products.DeleteAssignment(scope.assignment.ProductID, null, scope.assignment.UserGroupID)
            .then(function() {
                $state.reload();
                toastr.success('Product Assignment Deleted', 'Success');
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };
}


