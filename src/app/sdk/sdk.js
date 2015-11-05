angular.module( 'orderCloud' )

    .config( SdkConfig )
    .controller( 'SdkCtrl', SdkController )

;

function SdkConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.sdk', {
            url: '/sdk',
            templateUrl:'sdk/templates/sdk.tpl.html',
            controller:'SdkCtrl',
            controllerAs: 'sdk',
            resolve: {
                Documentation: function(Docs) {
                    return Docs.GetAll();
                }
            }
        })
}

function SdkController( ) {
    var vm = this;
    vm.installScript1 = "\nangular.module('myAngularApp', [\n\t'orderCloud.sdk'\n]);\n";
    vm.constantsScript1 = "\nangular.module('myAngularApp', ['orderCloud.sdk'])\n\t.constant('clientid', 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')\n\t.constant('ocscope', '...')\n\t.constant('appname', 'OrderCloud App')\n\t.constant('buyerid', 'xxxx')\n\t.constant('authurl', 'https://auth.ordercloud.io/oauth/token')\n\t.constant('apiurl', 'https://api.ordercloud.io')\n;\n";
    vm.runtimeScript1 = "\nangular.module('myAngularApp', ['orderCloud.sdk'])\n\t.run( SetBuyerID )\n;\n\nfunction SetBuyerID(BuyerID, buyerid) {\n\tBuyerID.Get() ? angular.noop() : BuyerID.Set(buyerid);\n}\n";
    vm.credentialsScript1 = "\nCrentials.Get({\n\tUsername: 'xxxx',\n\tPassword: 'xxxxxx'\n});\n";
    vm.authScript1 = "\nif (response.status === 200 && response.data && response.data['access_token']) {\n\t Auth.SetToken(response.data['access_token']);\n }\n";
    vm.authScript2 = "\nif (config.url.indexOf('OAuth') > -1)\n\tconfig.headers['Content-Type'] = 'application/x-www-form-urlencoded';\nif (Auth.GetToken())\n\tconfig.headers['Authorization'] = 'Bearer ' + Auth.GetToken();\n";
    vm.extendScript1 = "\nangular.module('orderCloud.sdk')\n.factory('Extend', Extend)\n;\n\nfunction Extend() {\n\tvar service = {\n\t\tBuyers: _buyers\n\t};\n\n\tfunction _buyers(data) {\n\t\tif (Object.prototype.toString.call(data) == '[object Array]') { \n\t\t\tangular.forEach(data, function(item) {\n\t\t\t\txtnd(item);\n\t\t\t})\n\t\t} else {\n\t\t\txtnd(data);\n\t\t}\n\n\t\tfunction xtnd(buyer) {\n\t\t\t//append additional properties to a single object here...\n\t\t}\n\t}\n\treturn service;\n}\n";
    vm.impersonationScript1 = '';

    vm.setMaxLines = function(editor) {
        editor.setOptions({
            maxLines:1000
        });
    };
}