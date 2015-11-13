angular.module( 'orderCloud' )

	.config( AboutConfig )
	.controller( 'AboutCtrl', AboutController )
	.controller( 'DemoRequestCtrl', DemoRequestController )
;

function AboutConfig( $stateProvider ) {
	$stateProvider
		.state( 'base.about', {
			url: '/about',
			templateUrl:'about/templates/about.tpl.html',
			controller:'AboutCtrl',
			controllerAs: 'about'
		});
}

function AboutController( $uibModal ) {
	var vm = this;

/*	vm.requestDemo = function() {
		$uibModal.open({
			animation: true,
			templateUrl: 'common/demoRequestModal.tpl.html',
			controller: 'DemoRequestCtrl',
			controllerAs: 'demoRequest'
		});
	}*/
}

function DemoRequestController($uibModalInstance, $resource) {
	var vm = this;

	vm.info = {
		"first_name": null,
		"last_name": null,
		"phone": null,
		"company": null,
		"email": null
	};

	vm.submit = function() {
		vm.info.created_by = 'DemoRequest';
		$resource("https://four51trial104401.jitterbit.net/Four51Dev/v1/pardotprospects",{},{ pardot: { method: 'POST', headers:{ Authorization: 'Basic Rm91cjUxSml0dGVyYml0OkYwdXI1MUoxdHQzcmIxdA==' }}}).pardot(vm.info).$promise.then(function() {
				$uibModalInstance.close();
			});
	};

}