angular.module('orderCloud')
    .config(CatalogManagementConfig)
    .factory('CatalogViewManagement', CatalogViewManagement)
;

function CatalogManagementConfig($stateProvider){
    $stateProvider
        .state('catalogManagement', {
            parent:'base',
            url:'/catalogManagement/:catalogid',
            views:{
                '': {
                    templateUrl:'catalogManagement/categoryTreeView/templates/categoryTreeView.html',
                    controller:'CategoryTreeCtrl',
                    controllerAs:'categoryTree',
                    resolve: {
                        CatalogID: function($stateParams){
                            return $stateParams.catalogid;
                        },
                        Tree: function(CategoryTreeService, $stateParams){
                            return CategoryTreeService.GetCategoryTree($stateParams.catalogid);
                        }
                    }
                },
                'assignments@catalogManagement': {
                    templateUrl:'catalogManagement/assignmentsView/templates/assignmentsView.html',
                    controller:'CatalogAssignmentsCtrl',
                    controllerAs:'catalogAssignments',
                    resolve: {
                        CatalogID: function($stateParams){
                            return $stateParams.catalogid;
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