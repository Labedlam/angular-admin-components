describe('Component: Catalogs', function(){
    var scope,
        q,
        oc,
        catalog;
    beforeEach(module(function($provide){
        $provide.value('Parameters', {search:null, page: null, pageSize: null, searchOn: null, sortBy: null, userID: null, userGroupID: null, level: null, buyerID: null})
    }));
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($rootScope, $q, OrderCloud){
        scope = $rootScope.$new();
        q = $q;
        oc = OrderCloud;
        catalog = {
            ID: 'CatalogID',
            Name: 'CatalogName'
        }
    }));

    describe('State: catalogs', function(){
        var state;
        beforeEach(inject(function($state, OrderCloudParameters){
            state = $state.get('catalogs', {}, {reload: true});
            spyOn(OrderCloudParameters, 'Get').and.returnValue(null);
            spyOn(oc.Catalogs, 'List').and.returnValue(null);
        }));
        it('should resolve Parameters', inject(function($injector, OrderCloudParameters){
            $injector.invoke(state.resolve.Parameters);
            expect(OrderCloudParameters.Get).toHaveBeenCalled();
        }));
        it('should resolve CatalogsList', inject(function($injector){
            $injector.invoke(state.resolve.CatalogsList);
            expect(oc.Catalogs.List).toHaveBeenCalled();
        }))
    });

    describe('Controller: CatalogCreateCtrl', function(){
        var catalogCreateCtrl;
        beforeEach(inject(function($state, $controller){
            catalogCreateCtrl = $controller('CatalogCreateCtrl', {
                $scope: scope
            });
            spyOn($state, 'go').and.returnValue(true);
        }));
        describe('saveCatalog', function(){
            beforeEach(function(){
                catalogCreateCtrl.catalog = catalog;
                var defer = q.defer();
                defer.resolve(catalog);
                spyOn(oc.Catalogs, 'Create').and.returnValue(defer.promise);
                catalogCreateCtrl.saveCatalog();
                scope.$digest();
            });
            it('should call the Catalogs Create method', function(){
                expect(oc.Catalogs.Create).toHaveBeenCalledWith(catalog);
            });
            it('should enter the catalogs state and reload the state', inject(function($state){
                expect($state.go).toHaveBeenCalledWith('catalogs', {}, {reload: true});
            }))
        })
    })
});