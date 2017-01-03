angular.module('orderCloud')
    .controller('CatalogAssignmentsCtrl', CatalogAssignmentsController)
;

 function CatalogAssignmentsController($q, toastr, $rootScope, Underscore, OrderCloud, ProductManagementModal, CatalogID){
     var vm = this;
     vm.productIds = null;
     vm.pageSize = 10;
     vm.catalogID = CatalogID;
     vm.categoryid = null;
     vm.assignments = null;
     vm.products = null;
     //vm.selectedProducts = [];

     $rootScope.$on('CatalogViewManagement:CategoryIDChanged', function(e, id){
         vm.categoryid = id;
         getAssignments();
         getProducts();
     });
     
     function getAssignments(){
         OrderCloud.Categories.ListAssignments(vm.categoryid)   
            .then(function(assignments){
                vm.assignments = assignments;
            });
     }

     function getProducts(){
         OrderCloud.Categories.ListProductAssignments(vm.categoryid)
            .then(function(assignmentList){
                vm.productIds = Underscore.pluck(assignmentList.Items, 'ProductID');
                if(!vm.productIds.length) {
                    vm.products = null;
                } else {
                    var pageone = vm.productIds.length > vm.pageSize ? vm.productIds.slice(0, vm.pageSize) : vm.productIds;
                    var filter = {ID: pageone.join('|')};
                    OrderCloud.Products.List(null, null, null, null, null, filter)
                        .then(function(productList){
                            vm.products = productList.Items;
                        });
                }
            });
     }

     vm.listAllProducts = function(product){
         return OrderCloud.Products.List(product)
             .then(function(data){
                 vm.listProducts = data;
             });
     };

     vm.saveAssignment = function(){
         var productQueue = [];
         var df = $q.defer();
         angular.forEach(vm.selectedProducts, function(product){
             productQueue.push(OrderCloud.Categories.SaveProductAssignment(
                 {
                    ProductID :  product.ID,
                    CategoryID : vm.categoryid
                 },
                 vm.catalogID
             ));
         });
         $q.all(productQueue)
             .then(function(data){
                 df.resolve();
                 toastr.success('All Products Saved', 'Success');
             })
             .catch(function(error){
                 toastr.error(error.data.Errors[0].Message);
             })
             .finally(function(){
                 getProducts();
                 vm.selectedProducts = null;
             });
         return df.promise;
     }
         
     vm.addProductModal = function(){
         ProductManagementModal.AssignProductToCategory(vm.categoryid, vm.catalogID);
     };

     vm.deleteAssignment = function(product){
         OrderCloud.Categories.DeleteProductAssignment(vm.categoryid, product.ID, vm.catalogID)
             .then(function(){
                 toastr.success('Product ' + product.Name + ' Removed from Category ' + vm.categoryid);
             })
             .catch(function(error){
                 toastr.error('There was an error removing products from the category');
             })
             .finally(function(){
                 getProducts();
             })
     }
     
 }