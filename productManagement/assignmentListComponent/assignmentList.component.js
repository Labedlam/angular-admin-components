angular.module('orderCloud')
    .component('ocAssignmentList', {
        bindings: {
            productid : '<',
            buyerid : '<'
        },
        templateUrl : 'productManagement/assignmentListComponent/templates/assignmentList.html',
        controller : ocAssignmentListCtrl,
        controllerAs: 'productAssignment'
    })
;

function ocAssignmentListCtrl($resource, OrderCloud){
    var vm = this;

    //Gets all product assignments for all buyers
    vm.$onInit = onInit;
    // when the buyer is changed it will make an api call to filter based on buyer ID and product ID
    vm.$onChanges = onChanges;

    function onInit(){
        var apiUrl = 'https://api.ordercloud.io/v1/products/assignments';
        var parameters = { 'productID': vm.productid, 'buyerID': null };
        $resource(apiUrl, parameters, {
            callApi: {
                method: 'GET',
                headers: {'Authorization': 'Bearer ' + OrderCloud.Auth.ReadToken()}
            }
        }).callApi(null).$promise
            .then(function(data) {
               vm.listAssignments = data;
            })
            .catch(function(ex) {
                console.warn(ex)
            });
    };

    function onChanges(change){
        // console.log("here is whats happening", change);
        if( change.buyerid.currentValue){
             OrderCloud.Products.ListAssignments(vm.productid, null, null, null, null, null, null, change.buyerid.currentValue.ID)
                 .then(function(data){
                     vm.listAssignments = data;
                 })
                 .catch(function(ex){
                     console.warn(ex)
                 })
        }
    }
}