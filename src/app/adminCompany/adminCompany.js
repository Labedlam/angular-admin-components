angular.module('orderCloud')
	.config(AdminCompanyConfig)
	.controller('AdminCompanyCtrl', AdminCompanyController)
;

function AdminCompanyConfig( $stateProvider ) {
	$stateProvider
		.state( 'base.adminCompany', {
			url: '/admin-company',
			templateUrl:'adminCompany/templates/adminCompany.tpl.html',
			controller:'AdminCompanyCtrl',
			controllerAs: 'adminCompany',
			resolve: {
				CanCreateCompany: function($q, CurrentUser) {
					var deferred = $q.defer();
					CurrentUser.CreateCompanies ? deferred.resolve() : deferred.reject();
					return deferred.promise;
				}
			}
		})
}

function AdminCompanyController($timeout, CanCreateCompany, DevCenter) {
	var vm = this;

	vm.information = {
		"CompanyName": null,
		"Email": null,
		"Username": null,
		"Password": null,
		"FirstName": null,
		"LastName": null
	};

	var searching;
	vm.searchDevGroups = function(model) {
		if (!model || model.length < 2) return;
		if (searching) $timeout.cancel(searching);
		searching = $timeout((function() {
			//TODO: waiting for a search term to be available on DevGroup list
			return DevCenter.Me.Groups(1, 10, true).then(function(data) {
				return data.Items;
			});
		}), 300);
		return searching;
	};

	vm.selectGroup = function(item) {
		vm.assignedGroupID = item.ID;
	};

	vm.submit = function() {
		DevCenter.Company.Create(vm.information, vm.assignedGroupID).then(function(data) {
			//TODO: Success Page for Created Company
		});
	}
}