describe('Component: AdminAddresses', function(){
    var scope,
        q,
        adminAddress,
        oc;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(module(function($provide) {
        $provide.value('Parameters', {search:null, page: null, pageSize: null, searchOn: null, sortBy: null, userID: null, userGroupID: null, level: null, buyerID: null})
    }));
    beforeEach(inject(function($q, $rootScope, OrderCloud) {
        scope = $rootScope.$new();
        q = $q;
        adminAddress = {
            CompanyName: "TestComp",
            FirstName: "Test",
            LastName: "Testing",
            Street1: "123 4th Ave N",
            Street2: "#200",
            City: "Minneapolis",
            State: "MN",
            Zip: "55403",
            Country: "US",
            AddressName: "TestAddressTest",
            ID: "TestAddress123456789"
        };
        oc = OrderCloud
    }));
    describe('State: adminAddresses', function(){
        var state;
        beforeEach(inject(function($state, OrderCloudParameters){
            state = $state.get('adminAddresses');
            spyOn(OrderCloudParameters, 'Get').and.returnValue(null);
            spyOn(oc.AdminAddresses, 'List').and.returnValue(null);
        }));
        it('should resolve Parameters', inject(function($injector){
            $injector.invoke(state.resolve.Parameters);
            expect(OrderCloudParameters.Get).toHaveBeenCalled();
        }));
        it('should resolve AddressList', inject(function($injector){
            $injector.invoke(state.resolve.AddressList);
            expect(oc.AdminAddresses.List).toHaveBeenCalled();
        }))
    })
});