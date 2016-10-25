describe('Component: AdminUserGroups', function(){
    var scope,
        q,
        oc;
    beforeEach(module('orderCloud'));
    beforeEach(module('orderCloud.sdk'));
    beforeEach(inject(function($q, $rootScope, OrderCloud) {
        q = $q;
        scope = $rootScope.$new();
        oc = OrderCloud;
    }));
    describe('State: adminUserGroups', function() {
        var state;
        beforeEach(inject(function($state) {
            state = $state.get('adminUserGroups');
            spyOn(oc.AdminUserGroups.List).and.returnValue(null);
        }))

    });
});