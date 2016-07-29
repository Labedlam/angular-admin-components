angular.module('orderCloud')
    .config(RegistrationConfig)
    .controller('RegistrationCtrl', RegistrationController)
;

function RegistrationConfig($stateProvider) {
    $stateProvider
        .state('registration', {
            parent: 'base',
            url: '/registration',
            templateUrl: 'registration/templates/registration.tpl.html',
            controller: 'RegistrationCtrl',
            controllerAs: 'registration',
            data: {componentName: 'Registration'}
        })
    ;
}

function RegistrationController($stateParams) {
    var vm = this;
    vm.user = {Active: true};
    vm.credentials = {
        Username: null,
        Password: null
    };
    vm.token = $stateParams.token;
    vm.form = vm.token ? 'reset' : 'login';
    vm.loginFormHeaders = {
        'login': 'Login',
        'forgot': 'Forgot Password',
        'verificationCodeSuccess': 'Forgot Password',
        'reset': 'Reset Password',
        'resetSuccess': 'Reset Password'
    };
    vm.setForm = function(form) {
        vm.form = form;
    };

    vm.register = function() {

    };

    vm.login = function() {

    };

    vm.forgotPassword = function() {

    };

    vm.resetPassword = function() {

    };
}