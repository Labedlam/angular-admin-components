//Local Constants

(function(window, angular, undefined) {
     angular.module('orderCloud')
     .constant('authurl', 'http://core.four51.com:11629/oauth/token')
        .constant('apiurl', 'http://core.four51.com:9002')
        .constant('integrationurl', 'http://core.four51.com:9004')
        .constant('devcenterClientID', '6d60154e-8a55-4bd2-93aa-494444e69996') //Local
        .constant('environment', 'local')
        .constant('devapiurl', 'https://devcenterapi-test.herokuapp.com');
})(window, window.angular);
