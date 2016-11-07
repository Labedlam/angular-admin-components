angular.module('orderCloud')
    .config(BuyOneGetOneConfig)
    .controller('buyOneGetOneCtrl', BuyOneGetOne)
;
function BuyOneGetOneConfig($stateProvider){
    $stateProvider
        .state('bogo',{
            parent:'base',
            templateUrl: 'buyOneGetOne/templates/bogo.tpl.html',
            controller: 'buyOneGetOneCtrl',
            controllerAs: 'bogo',
            url: '/bogo',
            data: {componentName: 'Buy One Get One'},
            resolve: {
                ProductList: function(OrderCloud){
                    return OrderCloud.Products.List(null, null, null, null, null, null)
                },
                UserGroups: function(OrderCloud){
                    return OrderCloud.UserGroups.List(null, null, null, null, null, null, null)
                }
            }

        })
        .state('bogo.products',{
            url: '/form',
            templateUrl: 'buyOneGetOne/templates/bogo-products.tpl.html',

        })
        .state('bogo.promotions', {
            url:'/promotions',
            templateUrl: 'buyOneGetOne/templates/bogo-promotions.tpl.html'
        })
        .state('bogo.access', {
            url:'/access',
        templateUrl: 'buyOneGetOne/templates/bogo-access.tpl.html'
         })
        .state('bogo.review', {
            url:'/review',
            templateUrl: 'buyOneGetOne/templates/bogo-review.tpl.html'
        });
}

function BuyOneGetOne(ProductList, UserGroups){
    var vm = this;
    vm.list=ProductList;
    vm.userGroups = UserGroups;
    vm.productSelected = false;
    vm.assignBuyer = false;
    vm.showReviewBtn=false;
    vm.buyerGroupsSelected = [];
    vm.bogoData = {};
    vm.bogoData.productIDSelected = null;
    vm.promotion = {
        ID: null,
        Code: null,
        Name: null,
        RedemptionLimit: null,
        RedemptionLimitPerUser: null,
        Description: null,
        FinePrint: null,
        StartDate: null,
        ExpirationDate: null,
        EligibleExpression: "items.quantity(ProductID = "+"'"+vm.bogoData.productIDSelected+"'"+") > 1",
        ValueExpression: "items.total(ProductID ="+"'"+vm.bogoData.productIDSelected+"'"+") / items.quantity(ProductID = "+"'"+ vm.bogoData.productIDSelected+"'"+")",
        CanCombine: null,
        xp: null
    };


    vm.selectProduct = function(product){
      vm.productSelected = true;
      vm.bogoData.Products =[];
      vm.bogoData.Products.push(product);
      vm.bogoData.productIDSelected = product.ID;
    };

    vm.removeSelectedProduct =function(product){
       vm.bogoData.Products.splice(_.indexOf(vm.bogoData.Products,_.findWhere(vm.bogoData.Products,{ID: product.ID})),1);

      if(vm.bogoData.Products.length < 1){
            vm.bogoData.productIDSelected = null;
            vm.productSelected = false;
      }
    };

    vm.checkUserAssignment = function(){

      for (var key in vm.checkbox){
          if(vm.checkbox[key]){
              vm.showReviewBtn = true;
          }
          else{
              vm.showReviewBtn = false;
          }
      }
    };

    // vm.CreatePromo = function(){
    //     vm.promotion.EligibleExpression = "items.quantity(ProductID = "+"'"+vm.bogoData.Products[0].ID+"'"+") > 1";
    // };


    vm.bogoSubmit = function(){

    };
    console.log("buy one get one")
}
