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
		})
}

function AboutController($sce ) {
	var vm = this;

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
