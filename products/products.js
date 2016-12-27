angular.module('orderCloud')
    .config(ProductsConfig)
    .controller('ProductsCtrl', ProductsController)
    .controller('ProductDetailCtrl', ProductDetailController)
    .controller('ProductEditModalCtrl', ProductEditModalController)
    .controller('ProductCreateCtrl', ProductCreateController)
    .controller('ProductCreateAssignmentCtrl', ProductCreateAssignmentController)
;

function ProductsConfig($stateProvider) {
    $stateProvider
        .state('products', {
            parent: 'base',
            templateUrl: 'products/templates/products.tpl.html',
            controller: 'ProductsCtrl',
            controllerAs: 'products',
            url: '/products?from&to&search&page&pageSize&searchOn&sortBy&filters',
            data: {componentName: 'Products'},
            resolve: {
                Parameters: function($stateParams, OrderCloudParameters) {
                    return OrderCloudParameters.Get($stateParams);
                },
                ProductList: function(OrderCloud, Parameters) {
                    return OrderCloud.Products.List(Parameters.search, Parameters.page, Parameters.pageSize || 12, Parameters.searchOn, Parameters.sortBy, Parameters.filters);
                }
            }
        })
        .state('products.detail', {
            url: '/:productid/detail',
            templateUrl: 'products/templates/productDetail.tpl.html',
            controller: 'ProductDetailCtrl',
            controllerAs: 'productDetail',
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
                    angular.forEach(Assignments.Items, function(v, k){
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
        .state('products.create', {
            url: '/create?productid',
            templateUrl: 'products/templates/productCreate.tpl.html',
            controller: 'ProductCreateCtrl',
            controllerAs: 'productCreate'

        })
        .state('products.createAssignment', {
            url: '/:productid/assignments/new?fromstate',
            templateUrl: 'products/templates/productCreateAssignment.tpl.html',
            controller: 'ProductCreateAssignmentCtrl',
            controllerAs: 'productCreateAssignment',
            resolve: {
                Parameters: function($stateParams, OrderCloudParameters) {
                    return OrderCloudParameters.Get($stateParams);
                },
                PriceScheduleList: function(OrderCloud) {
                    return OrderCloud.PriceSchedules.List(null,1, 20);
                },
                Buyers: function(OrderCloud){
                    return OrderCloud.Buyers.List();
                },
                Assignments: function($q, $resource, OrderCloud, Parameters) {
                    var apiUrl = 'https://api.ordercloud.io/v1/products/assignments';
                    var parameters = { 'productID': Parameters.productid, 'buyerID': null, 'userID': Parameters.userID, 'userGroupID': Parameters.userGroupID, 'level': Parameters.level, 'priceScheduleID': Parameters.priceScheduleID, 'page': Parameters.page , 'pageSize': Parameters.pageSize || 5 }
                    var d = $q.defer();
                    $resource(apiUrl, parameters, {
                        callApi: {
                            method: 'GET',
                            headers: {'Authorization': 'Bearer ' + OrderCloud.Auth.ReadToken()}
                        }
                    }).callApi(null).$promise
                        .then(function(data) {
                            d.resolve(data);
                        })
                        .catch(function(ex) {
                            d.reject(ex);
                        });

                    return d.promise;
                },
                SelectedProduct: function ($stateParams, OrderCloud) {
                    return OrderCloud.Products.Get($stateParams.productid);
                }

            }
        });
}

function ProductsController($state, $ocMedia, OrderCloud, OrderCloudParameters, ProductList, Parameters) {
    var vm = this;
    vm.list = ProductList;
    vm.parameters = Parameters;
    vm.sortSelection = Parameters.sortBy ? (Parameters.sortBy.indexOf('!') == 0 ? Parameters.sortBy.split('!')[1] : Parameters.sortBy) : null;

    //Check if filters are applied
    vm.filtersApplied = vm.parameters.filters || vm.parameters.from || vm.parameters.to || ($ocMedia('max-width:767px') && vm.sortSelection); //Sort by is a filter on mobile devices
    vm.showFilters = vm.filtersApplied;

    //Check if search was used
    vm.searchResults = Parameters.search && Parameters.search.length > 0;

    //Reload the state with new parameters
    vm.filter = function(resetPage) {
        $state.go('.', OrderCloudParameters.Create(vm.parameters, resetPage));
    };

    //Reload the state with new search parameter & reset the page
    vm.search = function() {
        vm.filter(true);
    };

    //Clear the search parameter, reload the state & reset the page
    vm.clearSearch = function() {
        vm.parameters.search = null;
        vm.filter(true);
    };

    //Clear relevant filters, reload the state & reset the page
    vm.clearFilters = function() {
        vm.parameters.filters = null;
        vm.parameters.from = null;
        vm.parameters.to = null;
        $ocMedia('max-width:767px') ? vm.parameters.sortBy = null : angular.noop(); //Clear out sort by on mobile devices
        vm.filter(true);
    };

    //Conditionally set, reverse, remove the sortBy parameter & reload the state
    vm.updateSort = function(value) {
        value ? angular.noop() : value = vm.sortSelection;
        switch(vm.parameters.sortBy) {
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
        Parameters.sortBy.indexOf('!') == 0 ? vm.parameters.sortBy = Parameters.sortBy.split('!')[1] : vm.parameters.sortBy = '!' + Parameters.sortBy;
        vm.filter(false);
    };

    //Reload the state with the incremented page parameter
    vm.pageChanged = function() {
        $state.go('.', {page:vm.list.Meta.Page});
    };

    //Load the next page of results with all of the same parameters
    vm.loadMore = function() {
        return OrderCloud.Products.List(Parameters.search, vm.list.Meta.Page + 1, Parameters.pageSize || vm.list.Meta.PageSize, Parameters.searchOn, Parameters.sortBy, Parameters.filters)
            .then(function(data) {
                vm.list.Items = vm.list.Items.concat(data.Items);
                vm.list.Meta = data.Meta;
            });
    };
}

function ProductDetailController($stateParams, $uibModal, $exceptionHandler, $state, toastr, OrderCloud, OrderCloudConfirm, Assignments, SelectedProduct, PriceSchedule){
    var vm = this;
    vm.schedule = PriceSchedule;

    vm.product = SelectedProduct;
    vm.list = Assignments;
    vm.listAssignments = Assignments.Items;
    vm.productID = $stateParams.productid;
    vm.productName = angular.copy(SelectedProduct.Name);
    //vm.pagingfunction = PagingFunction;

    vm.editProduct = function() {
        $uibModal.open({
            animation: true,
            templateUrl: 'products/templates/productEdit.modal.tpl.html',
            controller: 'ProductEditModalCtrl',
            controllerAs: 'productEditModal',
            size: 'lg',
            resolve: {
                SelectedProduct: function ($stateParams, OrderCloud) {
                    return OrderCloud.Products.Get($stateParams.productid);
                }
            }
        });
    };

    vm.deleteProduct = function(){
        OrderCloudConfirm.Confirm('Are you sure you want to delete this product?')
            .then(function(){
                OrderCloud.Products.Delete(vm.productID)
                    .then(function() {
                        $state.go('products', {}, {reload: true});
                        toastr.success('Product Deleted', 'Success')
                    })
                    .catch(function(ex) {
                        $exceptionHandler(ex)
                    });
        });
    };

    vm.DeleteAssignment = function(scope) {
        OrderCloud.Products.DeleteAssignment(scope.assignment.ProductID, null, scope.assignment.UserGroupID)
            .then(function() {
                $state.reload();
                toastr.success('Product Assignment Deleted', 'Success');
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    //function PagingFunction() {
    //    if (vm.list.Meta.Page < vm.list.Meta.TotalPages) {
    //        OrderCloud.Products.ListAssignments($stateParams.productid, null, null, null, null, vm.list.Meta.Page + 1, vm.list.Meta.PageSize)
    //            .then(function(data) {
    //                vm.list.Items = [].concat(vm.list.Items, data.Items);
    //                vm.list.Meta = data.Meta;
    //            });
    //    }
    //}
}

function ProductEditModalController($exceptionHandler, $uibModalInstance, $state, toastr, OrderCloud, SelectedProduct) {
    var vm = this,
        productid = angular.copy(SelectedProduct.ID);
    vm.productName = angular.copy(SelectedProduct.Name);
    vm.product = SelectedProduct;

    vm.Update = function() {
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

    vm.submit = function() {
        $uibModalInstance.close();
    };

    vm.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
}

function ProductCreateController($exceptionHandler, $state, toastr, OrderCloud, $stateParams ) {
    var vm = this;
    vm.product = {};
    vm.product.Active = true;
    vm.product.QuantityMultiplier = 1;
    vm.productCreated = false;


    vm.saveProduct = function(){
        if(vm.productCreated){
            OrderCloud.Products.Update(vm.product.ID ,vm.product)
                .then(function(data) {
                    toastr.success('Product Saved', 'Click next to assign prices');
                })
                .catch(function(ex) {
                    $exceptionHandler(ex)
                });
        } else {
            OrderCloud.Products.Create(vm.product)
                .then(function(data) {
                    vm.product.ID = data.ID;
                    vm.productCreated = true;
                    // $state.go('products', {}, {reload: true});
                    toastr.success('Product Saved', 'Click next to assign prices');
                })
                .catch(function(ex) {
                    $exceptionHandler(ex)
                });
            }
    };

    vm.Submit = function() {
        if(vm.productCreated){
            OrderCloud.Products.Update(vm.product.ID ,vm.product)
                .then(function(data) {
                    toastr.success('Product Saved', 'Click next to assign prices');
                    $state.go('products.createAssignment', {productid: vm.product.ID, fromstate: "productCreate"}, {reload: true});
                })
                .catch(function(ex) {
                    $exceptionHandler(ex)
                });
        } else {
            OrderCloud.Products.Create(vm.product)
                .then(function(data) {
                    vm.product.ID = data.ID;
                    vm.productCreated = true;
                    toastr.success('Product Saved', 'Click next to assign prices');
                    $state.go('products.createAssignment', {productid: vm.product.ID, fromstate: "productCreate"}, {reload: true});
                })
                .catch(function(ex) {
                    $exceptionHandler(ex)
                });
        }
    };
}

function ProductCreateAssignmentController($q, $stateParams, $state, $uibModal, Underscore, toastr, OrderCloud, PriceScheduleList, Assignments, SelectedProduct, Buyers, ProductManagementModal) {

    var vm = this;
    // vm.list = UserGroupList;
    vm.priceSchedules = PriceScheduleList.Items;
    vm.assignments =  Assignments;
    console.log(Assignments);
    vm.product = SelectedProduct;
    vm.buyers = Buyers;
    vm.fromState = $stateParams.fromstate;

    vm.StandardPriceScheduleID;
    vm.ReplenishmentPriceScheduleID;
    vm.selectedPriceSchedules = [];


    vm.assignBuyer = false;
    vm.model = {
        ProductID:$stateParams.productid,
        BuyerID: vm.selectedBuyer,
        UserGroupID: null,
        PriceScheduleID: null
    };

    vm.getUserList = function(buyer){
        vm.selectedUserGroups = null;
        vm.model.BuyerID = buyer.ID;
        OrderCloud.UserGroups.List(null, 1, 20, null, null, null, buyer.ID)
            .then(function(data){
                vm.list = data;
            })
        OrderCloud.Products.ListAssignments($stateParams.productid, null, null, null, null, null, null, buyer.ID)
            .then(function(data){
                console.log("assignments after buyer is selected",data);
                vm.assignments = data;
            })
    };

    vm.toggleReplenishmentPS = function(id) {
        vm.ReplenishmentPriceScheduleID == id ? vm.ReplenishmentPriceScheduleID = null : vm.ReplenishmentPriceScheduleID = id;
    };

    vm.toggleStandardPS = function(id) {
        vm.StandardPriceScheduleID == id ? vm.StandardPriceScheduleID = null : vm.StandardPriceScheduleID = id;
    };

    //Reload the state with the incremented page parameter
    vm.pageChanged = function() {
        $state.go('.', {page:vm.assignments.Meta.Page});
    };


    vm.createScheduleModal = function(){
        $uibModal.open({
            animation: true,
            templateUrl: 'priceSchedules/templates/priceScheduleCreate.modal.tpl.html',
            controller: 'PriceScheduleCreateModalCtrl',
            controllerAs: 'priceScheduleCreateModal',
            backdrop:'static',
            size: 'lg'
        })
    };
    vm.editPriceSchedule =  function(priceSchedule){
        ProductManagementModal.EditPriceSchedule(priceSchedule)
            .then(function(data){
                angular.forEach(vm.priceSchedules, function(priceSchedule,index){
                    if(priceSchedule.ID == data.ID){
                        console.log("hello priceSchedule", priceSchedule, data, index );
                        vm.priceSchedules[index] = data;
                        vm.selectedPriceSchedule = data;
                    }
                });
                // var b= Underscore.find(vm.priceSchedules,function(priceSchedule) {return priceSchedule.ID == data.ID});
                console.log("here is the index",data) ;
                console.log("this is the array of price schedules", vm.priceSchedules);
                toastr.success('Price Schedule modified', 'Success');
                // $state.go('.', {},{reload: true});
            })
    }

    vm.saveAssignment = function() {

        // if (!(vm.StandardPriceScheduleID || vm.ReplenishmentPriceScheduleID) || (!vm.assignBuyer && !vm.selectedUserGroups.length)) return;
        if (vm.selectedBuyer && vm.selectedUserGroups) {
            var assignmentQueue = [];
            var df = $q.defer();
            angular.forEach(vm.selectedUserGroups, function (group) {
                // angular.forEach(vm.selectedPriceSchedules, function (priceSchedule) {
                console.log(vm.model);
                var assignment = angular.copy(vm.model);
                assignment.UserGroupID = group.ID;
                assignment.PriceScheduleID = vm.selectedPriceSchedule.ID;
                assignmentQueue.push(OrderCloud.Products.SaveAssignment(assignment));
                // });
            })
            $q.all(assignmentQueue)
                .then(function () {
                    df.resolve();
                    toastr.success('Assignment Updated', 'Success');
                    // vm.makeAnotherAssignment ? $state.go('.',{},{reload: true}) :( (vm.fromState == "productCreate") ?  $state.go('products', {}, {reload: true}) : $state.go('products.detail',{productid: vm.product.ID}, {reload: true}) );
                    $state.go('.',{},{reload: true});
                })
                .catch(function (error) {
                    // vm.submit();
                    console.log(error);
                    toastr.error('An error occurred while trying to save your product assignment', 'Error');
                })
            return df.promise;

        } else {

            var assignmentQueue = [];
            var df = $q.defer();
            var assignment = angular.copy(vm.model);
            assignment.PriceScheduleID = vm.selectedPriceSchedule.ID;
            assignmentQueue.push(OrderCloud.Products.SaveAssignment(assignment));

            $q.all(assignmentQueue)
                .then(function () {
                    df.resolve();
                    // vm.makeAnotherAssignment ? $state.go('.',{},{reload: true}) :( (vm.fromState == "productCreate") ?  $state.go('products', {}, {reload: true}) : $state.go('products.detail',{productid: vm.product.ID}, {reload: true}) );
                    toastr.success('Assignment Updated', 'Success');
                    $state.go('.',{},{reload: true})
                })
                .catch(function (error) {
                    toastr.error('An error occurred while trying to save your product assignment', 'Error');
                })
            return df.promise;





        }
    };

    vm.DeleteAssignment = function(scope) {
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

