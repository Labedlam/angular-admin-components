angular.module( 'orderCloud' )

	.config( AboutConfig )
	.controller( 'AboutCtrl', AboutController )
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

function AboutController($sce, $resource) {
	var vm = this;

	vm.info = {
		"name": "",
		"email": ""
	};

	vm.submit = function() {
		$resource("https://four51trial104401.jitterbit.net/Four51Dev/v1/pardotprospects",{},{ pardot: { method: 'POST', headers:{ Authorization: 'Basic Rm91cjUxSml0dGVyYml0OkYwdXI1MUoxdHQzcmIxdA==' }}}).pardot({
			"first_name": vm.info.name,
			"last_name": null,
			"created_by": "MoreInfo",
			"phone": null,
			"company": null,
			"email": vm.info.email
		}).$promise;
	};

	vm.config = {
				preload: "none",
				sources: [
					{src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.mp4"), type: "video/mp4"},
					{src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.webm"), type: "video/webm"},
					{src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.ogg"), type: "video/ogg"}
				],
				theme: {
					url: "http://www.videogular.com/styles/themes/default/latest/videogular.css"
				},
				plugins: {
					controls: {
						autoHide: true,
						autoHideTime: 5000
					}
				}
			};
}
