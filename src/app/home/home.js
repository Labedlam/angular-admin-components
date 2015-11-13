angular.module( 'orderCloud' )

    .config( HomeConfig )
    .controller( 'HomeCtrl', HomeController )
    .controller( 'HomeVideoCtrl', HomeVideoController )

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

function HomeController( $uibModal ) {
    var vm = this;
    function openVideoModal() {
        $uibModal.open({
            animation: true,
            templateUrl: 'home/templates/homeVideo.tpl.html',
            controller: 'HomeVideoCtrl',
            controllerAs: 'homeVideo'
        });
    }

    vm.carouselInterval = 5000;
    vm.slides1 = [
        {
            image:'assets/images/bluerImage.jpg',
            title:"OrderCloud",
            description:'One platform. Infinite possibilities.',
            button: {
                title: 'WATCH VIDEO',
                action: openVideoModal
            }
        },
        {
            image:'assets/images/configureDeployQuickly.jpg',
            title:'Create, Configure and Deploy Quickly.',
            description:'Our data model is 100% accessible through the API.',
            button: {
                title: 'VIEW DOCS',
                stateRef: 'base.docs'
                //link: 'https://four51.leadpages.co/leadbox/146f1c9f3f72a2%3A14a01b56f346dc/5631725669449728/'
            }
        },
        {
            image:'assets/images/IntegrateEverythingimg.jpg',
            title:'Integrate Everything.',
            description:"OrderCloud's REST API has your back. Integrate CRM, ERP, Tax, Analytics and more.",
            button: {
                title: 'SIGN UP TODAY',
                stateRef: 'register'
            }
        }
    ];

    vm.slides2 = [
        {
            image:'assets/images/world-class.jpg',
            title:'World Class Scalability & Security',
            description:'99% uptime across all experiences. PCI DSS and SSAE 16 Type || compliance',
            buttonTitle:'watch video'
        },
        {
            image:'assets/images/b3.png',
            title:'The control of on-premise. The flexibility of custom development. The scalability and low cost of SaaS.',
            description:'OrderCloud is a platform-as-a-service (PaaS). This brings you the best of all worlds; control, flexibility, scalability, and security. Leverage our Component Based Architecture to rapidly build customized solutions while leveraging real-world, customer-proven components. ',
            buttonTitle:'watch video'
        }
    ];

    vm.mobileslides = [
        {
            image:'assets/images/papa_johns.png',
            title:'Papa johns',
            description:'15000+ orders a month? No problem',
            text:'Papa John\'s, founded in 1985, has grown to over 20,700 employees who operate and franchise more than 4,000 delivery and carryout pizza restaurants worldwide. In order to systematize and make these franchisees more efficient, they were in need of a serious operational makeover.',
            link: 'http://public.four51.com/papa-johns-case-study'

        },
        {
            image:'assets/images/turtle-wax-logo.png',
            title:'Turtle Wax',
            description:'Eliminate fax and manual order entry. In the Cloud.',
            text:'Turtle Wax is a world leader in car care with sales in over 90 countries. Founded more than 70 years ago, the company is recognized for its continuous innovation in manufacturing appearance and performance car care products.But despite it\'s success, Turtle Wax had a problem.',
            link: 'http://451.yourdevsite.com/turtle-wax-case-study'
        },
        {
            image:'assets/images/Burroughs_logo.png',
            title:'Burroughs',
            description:'Massive Cost Savings? You bet.',
            text:'Burroughs Payment Systems was looking for a solution to support worldwide sales of Burroughs image-processing technology through their network of resellers.',
            link:'http://public.four51.com/burroughs-case-study'
        }
    ]
}


function HomeVideoController($uibModalInstance) {
    var vm = this;
    vm.dismiss = function() {
        $uibModalInstance.dismiss();
    }
}