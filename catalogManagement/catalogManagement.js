angular.module('orderCloud')
    .config(CatalogManagementConfig)
    .factory('CatalogViewManagement', CatalogViewManagement)
;

function CatalogManagementConfig($stateProvider){
    $stateProvider
        .state('catalogManagement', {
            parent:'buyers.details',
            url:'/catalogManagement',
            views:{
                '': {
                    templateUrl:'catalogManagement/categoryTreeView/templates/categoryTreeView.html',
                    controller:'CategoryTreeCtrl',
                    controllerAs:'categoryTree',
                    resolve: {
                        CatalogID: function($stateParams){
                            //set catalog id instead to use non-default catalog
                            return $stateParams.buyerid;
                        },
                        Tree: function(CategoryTreeService, $stateParams){
                            return CategoryTreeService.GetCategoryTree($stateParams.buyerid);
                        }
                    }
                },
                'assignments@catalogManagement': {
                    templateUrl:'catalogManagement/assignmentsView/templates/assignmentsView.html',
                    controller:'CatalogAssignmentsCtrl',
                    controllerAs:'catalogAssignments',
                    resolve: {
                        CatalogID: function($stateParams){
                            return $stateParams.buyerid;
                        }
                    }
                }
            }
        });
}

 function CatalogViewManagement($rootScope){
     var service = {
         GetCategoryID: GetCategoryID,
         SetCategoryID: SetCategoryID
     };
     var catalogid = null;

     function GetCategoryID(){
         return catalogid;
     }

     function SetCategoryID(category){
         catalogid = category;
         $rootScope.$broadcast('CatalogViewManagement:CategoryIDChanged', catalogid);
     }
     return service;
 }