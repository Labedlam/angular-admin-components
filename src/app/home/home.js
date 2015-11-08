angular.module( 'orderCloud' )

	.config( HomeConfig )
	.controller( 'HomeCtrl', HomeController )

;

function HomeConfig( $stateProvider ) {
	$stateProvider
		.state( 'base.home', {
			url: '/home',
			templateUrl:'home/templates/home.tpl.html',
			controller:'HomeCtrl',
			controllerAs: 'home'
		})
}

function HomeController( $resource ) {
	var vm = this;
	vm.tabs = [
    { title:'DEVELOPERS', 
    image:'assets/images/help.png',
    content:'Shortened development time driven by component based development. Code, configure, and optimize your project using OrderCloud Dev Center. Bring your development projects to market quickly.', 
    description1:'OrderCloud documentation and courses get developers on track and building on our platform effectively.',
    description2:'Integration access to hundreds of 3rd party platforms for ERP, CRM, CMS, Analytics, Tax, PIM and more.'
 },
        { title:'BUSINESS OWNER', image:'assets/images/business.png', content:['second tab content', 'second tab content','second tab content','second tab content'] }
  ];

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
        }).$promise.then(successPardot);
    };

    function successPardot(data) {
        vm.submission = true;
    }

    vm.myInterval = 5000;
    vm.noWrapSlides = false;
    vm.slides = [
        {
            image:'assets/images/bluerImage.jpg',
            title:'OrderCloud',
            description:'one platform. infinite possibilities.',
            buttonTitle:'watch video'
        },
        {
            image:'assets/images/a3.jpg',
            title:'Create, Configure and Deploy Quickly.',
            description:'Rest APIs give 100% access to our data model ',
            buttonTitle:'Learn More',
            id:'spot2'
        },
        {
            image:'assets/images/IntegrateEverythingimg.jpg',
            title:'Integrate Everything.',
            description:"OrderCloud's REST API has your back. Integrate CRM, ERP, Tax, Analytics and more.",
            buttonTitle:'watch video'
        }
  ]
    vm.slides2 = [
        {
            image:'assets/images/Github_Banner.jpg',
            title:'GitHub',
            description:'GitHub Enterprise supports apps and services to customize your development environment. Leverage OrderCloud with GitHub to help you work more efficiently across the entire',
            buttonTitle:'watch video'
        },
        {
            image:'assets/images/world-class.jpg',
            title:'World Class Scalability & Security',
            description:'99% uptime across all experiences. PCI DSS and SSAE 16 Type || compliance',
            buttonTitle:'Learn More'
        },
        {
            image:'assets/images/b3.png',
            title:'The control of on-premise. The flexibility of custom development. The scalability and low cost of SaaS.',
            description:'OrderCloud is a platform-as-a-service (PaaS). This brings you the best of all worlds; control, flexibility, scalability, and security. Leverage our Component Based Architecture to rapidly build customized solutions while leveraging real-world, customer-proven components. ',
            buttonTitle:'watch video'
        }
    ]
  vm.mobileslides = [
  {
    image:'assets/images/papa_johns.png',
    title:'Papa johns',
    description:'15000+ orders a month? No problem',
    text:'Staples needed to empower each corporate customer with a unique brand and product set. With OrderCloud they drive over 20,000 fully automated monthly orders online and via mobile. ',
    button:'Learn More'
  },
    {
    image:'assets/images/staples.png',
    title:'Staples',
    description:'15000+ orders a month? No problem',
    text:'Staples needed to empower each corporate customer with a unique brand and product set. With OrderCloud they drive over 20,000 fully automated monthly orders online and via mobile. ',
    button:'Learn More'
  },
    {
    image:'assets/images/Burroughs_logo.png',
    title:'Burroughs',
    description:'15000+ orders a month? No problem',
    text:'Staples needed to empower each corporate customer with a unique brand and product set. With OrderCloud they drive over 20,000 fully automated monthly orders online and via mobile. ',
    button:'Learn More'
  }
  ]
}
