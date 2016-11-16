angular.module('orderCloud')
    .config(ApprovalRulesConfig)
    .controller('ApprovalRulesCtrl', ApprovalRulesController)
;

function ApprovalRulesConfig($stateProvider){
    $stateProvider
        .state('approvalRules', {
            parent:'base',
            url:'/approvalRules?search&page&pageSize&searchOn&sortBy&filters',
            templateUrl:'approvalRules/approvalRules.tpl.html',
            controller:'ApprovalRulesCtrl',
            controllerAs:'approvalRules',
            data:{componentName:'Approval Rules'},
            resolve: {
                Parameters: function($stateParams, OrderCloudParameters){
                    return OrderCloudParameters.Get($stateParams);
                },
                ApprovalRulesList: function(OrderCloud, Parameters){
                    return OrderCloud.ApprovalRules.List(Parameters.search, Parameters.page, Parameters.pageSize || 12, Parameters.searchOn, Parameters.sortBy, Parameters.filters)
                }
            }
        })
        .state('approvalRules.create', {
            url:'/approvalRules/create',
            templateUrl:'approvalRules/approvalrules.create.tpl.html',
            controller:'ApprovalRulesCreateCtrl',
            controllerAs:'approvalRulesCreate',
            resolve: {

            }
        });
}

function ApprovalRulesController($state, OrderCloud, $ocMedia,  OrderCloudParameters, ApprovalRulesList, Parameters) {
    var vm = this;
    vm.list = ApprovalRulesList;
    vm.parameters = Parameters;

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
		return OrderCloud.Addresses.List(Parameters.search, vm.list.Meta.Page + 1, Parameters.pageSize || vm.list.Meta.PageSize, Parameters.searchOn, Parameters.sortBy, Parameters.filters)
			.then(function(data) {
				vm.list.Items = vm.list.Items.concat(data.Items);
				vm.list.Meta = data.Meta;
			});
	};
}
