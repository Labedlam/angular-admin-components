describe('Component: Catalog', function() {
    var scope,
        q,
        oc,
        currentOrder,
        fakeProduct,
        fakeSpecList,
        uibModalInstance,
        addToOrder
        ;

    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope, OrderCloud, AddToOrder, CurrentOrder) {
        scope = $rootScope.$new();
        q = $q;
        oc = OrderCloud;
        currentOrder =CurrentOrder;
        addToOrder = AddToOrder;
        fakeProduct = {
            ID: "18"
        };
        fakeSpecList =  [{}];
    }));


    describe('Controller: ProductQuickViewController', function() {
        var ProductQuickViewCtrl;
        beforeEach(inject(function($controller) {
            ProductQuickViewCtrl = $controller('ProductQuickViewCtrl', {
                $scope: scope
            });
            var defer = q.defer();
            defer.resolve();
            scope.$digest();
            spyOn(oc.Me, 'GetProduct').and.returnValue(defer.promise);
            spyOn(oc.Specs, 'ListProductAssignments').and.returnValue(defer.promise);
            ProductQuickViewCtrl.open(fakeProduct);
        }));
        it('Should resolve SelectedProduct and SpecList', function() {
            expect(oc.Me.GetProduct).toHaveBeenCalledWith(fakeProduct.ID);
            expect(oc.Specs.ListProductAssignments).toHaveBeenCalledWith(null,fakeProduct.ID);
        });
    });

    describe('Controller: ProductQuickViewModalController', function() {
        var ProductQuickViewModalCtrl;
        beforeEach(inject(function($controller) {
            ProductQuickViewModalCtrl = $controller('ProductQuickViewModalCtrl', {
                $scope: scope,
                $uibModalInstance: uibModalInstance,
                SelectedProduct: fakeProduct,
                SpecList: fakeSpecList
            });
        }));

        describe('addToCart', function() {
            beforeEach(function() {
                var defer = q.defer();
                defer.resolve(fakeProduct);
                spyOn(addToOrder, 'Add').and.returnValue(defer.promise);
                ProductQuickViewModalCtrl.selectedProduct = fakeProduct;
                ProductQuickViewModalCtrl.addToCart(fakeProduct);
            });
            it('Should call Add method and pass product object', function() {
                expect(addToOrder.Add).toHaveBeenCalledWith(fakeProduct);
            });
        });
    });
});

