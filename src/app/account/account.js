angular.module('orderCloud')

    .config( AccountConfig )
    .factory( 'AccountService', AccountService )
    .controller( 'AccountCtrl', AccountController )
    .controller( 'ConfirmPasswordCtrl', ConfirmPasswordController )
    .controller( 'ChangePasswordCtrl', ChangePasswordController )

;

function AccountConfig( $stateProvider ) {
    $stateProvider
        .state( 'base.account', {
            url: '/account',
            templateUrl: 'account/templates/account.tpl.html',
            controller: 'AccountCtrl',
            controllerAs: 'account'
        })
        .state( 'base.changePassword', {
            url: '/account/changepassword',
            templateUrl: 'account/templates/changePassword.tpl.html',
            controller: 'ChangePasswordCtrl',
            controllerAs: 'changePassword'
        })
}

function AccountService( $q, $uibModal, DevCenter, Auth, DevAuth ) {
    var service = {
        Update: _update,
        ChangePassword: _changePassword
    };

    function _update(currentProfile, newProfile) {
        var deferred = $q.defer();

        function updateUser() {
            DevCenter.Me.Update(newProfile)
                .then(function(data) {
                    deferred.resolve(data);
                })
                .catch(function(ex) {
                    deferred.reject(ex);
                });
        }

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'account/templates/confirmPassword.modal.tpl.html',
            controller: 'ConfirmPasswordCtrl',
            controllerAs: 'confirmPassword',
            size: 'sm'
        });

        modalInstance.result.then(function(password) {
            var checkPasswordCredentials = {
                Username: currentProfile.Username,
                Password: password
            };
            DevCenter.Login(checkPasswordCredentials).then(
                function() {
                    updateUser();
                }).catch(function( ex ) {
                    deferred.reject(ex);
                });
        }, function() {
            angular.noop();
        });

        return deferred.promise;
    }

    function _changePassword(currentUser) {
        var deferred = $q.defer();

        var checkPasswordCredentials = {
            Username: currentUser.Username,
            Password: currentUser.CurrentPassword
        };

        function changePassword() {
            DevCenter.ResetPassword(currentUser.NewPassword, DevAuth.GetToken())
                .then(function() {
                    deferred.resolve();
                })
                .catch(function(ex) {
                    deferred.reject(ex);
                });
        }

        DevCenter.Login(checkPasswordCredentials).then(
            function() {
                Auth.RemoveToken();
                changePassword();
            }).catch(function( ex ) {
                deferred.reject(ex);
            });

        return deferred.promise;
    }

    return service;
}

function AccountController( $exceptionHandler, AccountService, CurrentUser ) {
    var vm = this;
    vm.profile = angular.copy(CurrentUser);
    var currentProfile = CurrentUser;

    vm.update = function(form) {
        AccountService.Update(currentProfile, vm.profile)
            .then(function(data) {
                vm.profile = angular.copy(data);
                currentProfile = data;
                form.$setPristine(true);
            })
            .catch(function(ex) {
                vm.profile = currentProfile;
                $exceptionHandler(ex)
            })
    };

    vm.resetForm = function(form) {
        vm.profile = currentProfile;
        form.$setPristine(true);
    };

}

function ConfirmPasswordController( $uibModalInstance ) {
    var vm = this;

    vm.submit = function() {
        $uibModalInstance.close(vm.password);
    };

    vm.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };
}

function ChangePasswordController( toastr, $state, AccountService, $exceptionHandler, CurrentUser ) {
    var vm = this;
    vm.currentUser = CurrentUser;

    vm.changePassword = function() {
        AccountService.ChangePassword(vm.currentUser)
            .then(function() {
                vm.currentUser.CurrentPassword = null;
                vm.currentUser.NewPassword = null;
                vm.currentUser.ConfirmPassword = null;
                toastr.success('Your password was successfully changed.', 'Success!');
                $state.go('base.account');
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };
}