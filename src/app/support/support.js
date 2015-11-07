angular.module( 'orderCloud' )

    .config( SupportConfig )
    .controller( 'SupportCtrl', SupportController )

;

function SupportConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.support', {
            url: '/support',
            templateUrl:'support/templates/support.tpl.html',
            controller:'SupportCtrl',
            controllerAs: 'support'
        })
}

function SupportController( $window, CurrentUser, disqussecret, disquspublic ) {
    var vm = this;

    var disqusData = {
        id: CurrentUser.ID,
        username: CurrentUser.Username,
        email: CurrentUser.Email
    };
    var secretKey = disqussecret;
    var publicKey = disquspublic;

    var disqusStr = JSON.stringify(disqusData);
    var timestamp = Math.round(+new Date() / 1000);

    var message = btoa(disqusStr);

    var result = CryptoJS.HmacSHA1(message + " " + timestamp, secretKey);
    var hexsig = CryptoJS.enc.Hex.stringify(result);
    var disqusAuth = message + ' ' + hexsig + ' ' + timestamp;

    var disqus_config = function () {
        // The generated payload which authenticates users with Disqus
        this.page.remote_auth_s3 = disqusAuth;
        this.page.api_key = publicKey;
        this.page.identifier = "OrderCloudDevCenter";
        this.page.url = $window.location.href;
    };

    if (!$window.DISQUS) {
        var d = document, s = d.createElement('script');
        s.src = '//ordercloud.disqus.com/embed.js';  // IMPORTANT: Replace EXAMPLE with your forum shortname!
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    }
    else {
        $window.DISQUS.reset({
            reload: true,
            config: function () {
                this.page.identifier = 'OrderCloudDevCenter';
                this.page.url = $window.location.href;
                this.page.remote_auth_s3 = disqusAuth;
                this.page.api_key = publicKey;
            }
        });
    }
}