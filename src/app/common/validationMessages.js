angular.module( 'orderCloud')
    .run( AutoValidate )
    .config( AutoValidateOverride )
;

var customErrorMessages = [
    {
        'ErrorKey': 'registerEmail',
        'Message': '<span>Please use a valid company email address.</span>'
    },
    {
        'ErrorKey': 'registerConfirmPassword',
        'Message': 'Password does not match.'
    },
    {
        'ErrorKey': 'registerPasswordPattern',
        'Message': '<span class="helper-text">Your password must contain a minimum of 8 alphanumeric characters and two or more of the following kinds of characters <ul> <li>Alphabetic (e.g., a-z, A-Z)</li> <li>Numeric (i.e. 0-9)</li> <li>Punctuation and other characters (e.g., !@#$%^&*()_+|~-=\\`{}[]:</li> </ul> </span>'
    }
];

function AutoValidate(defaultErrorMessageResolver) {
    defaultErrorMessageResolver.getErrorMessages().then(function (errorMessages) {
        angular.forEach(customErrorMessages, function(message) {
            errorMessages[message.ErrorKey] = message.Message;
        });
    });
}

function AutoValidateOverride($provide) {
    $provide.decorator('bootstrap3ElementModifier', function ($delegate, $location) {

        var findWithClassElementAsc = function (el, klass) {
            var returnEl,
                parent = el;
            for (var i = 0; i <= 10; i += 1) {
                if (parent !== undefined && parent.hasClass(klass)) {
                    returnEl = parent;
                    break;
                } else if (parent !== undefined) {
                    parent = parent.parent();
                }
            }

            return returnEl;
        };

        var findFormGroupElement = function (el) {
            return findWithClassElementAsc(el, 'form-group');
        };

        var findWithClassElementDesc = function (el, klass) {
            var child;
            for (var i = 0; i < el.children.length; i += 1) {
                child = el.children[i];
                if (child !== undefined && angular.element(child).hasClass(klass)) {
                    break;
                } else if (child.children !== undefined) {
                    child = findWithClassElementDesc(child, klass);
                    if (child.length > 0) {
                        break;
                    }
                }
            }

            return angular.element(child);
        };

        var findInputGroupElement = function (el) {
            return findWithClassElementDesc(el, 'input-group');
        };

        var getCorrectElementToPlaceErrorElementAfter = function (el) {
            var correctEl = el,
                elType = el[0].type ? el[0].type.toLowerCase() : '';

            if ((elType === 'checkbox' || elType === 'radio') && el.parent()[0].nodeName.toLowerCase() === 'label') {
                correctEl = el.parent();
            }

            return correctEl;
        };

        var insertAfter = function (referenceNode, newNode) {
            referenceNode[0].parentNode.insertBefore(newNode[0], referenceNode[0].nextSibling);
        };

        var reset = function (el) {
            angular.forEach(el.find('span'), function (spanEl) {
                spanEl = angular.element(spanEl);
                if (spanEl.hasClass('error-msg') || spanEl.hasClass('form-control-feedback') || spanEl.hasClass('control-feedback')) {
                    spanEl.remove();
                }
            });

            el.removeClass('has-success has-error has-feedback');
        };

        var addValidationStateIcons = false;

        var isHtml = function(string) {
            return /^(\uFEFF|\uFFFE)?\s*<[^>]+>/i.test(string);
        };

        var validationDisabled = function(el) {
            var result = false;
            if (el && el[0] && el[0].attributes) {
                angular.forEach(el[0].attributes, function(a) {
                    if (a.name == 'disable-validation-message') result = true;
                });
            }
            return result;
        };

        $delegate.makeInvalid = function (el, errorMsg) {
            if (validationDisabled(el)) return;

            var frmGroupEl = findFormGroupElement(el),
                helpTextEl = isHtml(errorMsg) ? angular.element(errorMsg) : angular.element('<span class="help-block has-error">' + errorMsg + '</span>'),
                inputGroupEl;

            helpTextEl.addClass('error-msg');

            if (frmGroupEl) {
                reset(frmGroupEl);
                inputGroupEl = findInputGroupElement(frmGroupEl[0]);
                frmGroupEl.addClass('has-error ' + (inputGroupEl.length > 0 || addValidationStateIcons === false ? '' : 'has-feedback'));
                insertAfter(inputGroupEl.length > 0 ? inputGroupEl : getCorrectElementToPlaceErrorElementAfter(el), helpTextEl);
                if (addValidationStateIcons) {
                    var iconElText = '<span class="glyphicon glyphicon-remove form-control-feedback"></span>';
                    if (inputGroupEl.length > 0) {
                        iconElText = iconElText.replace('form-', '');
                        iconElText = '<span class="input-group-addon control-feedback">' + iconElText + '</span';
                    }

                    insertAfter(getCorrectElementToPlaceErrorElementAfter(el), angular.element(iconElText));
                }
            } else {
                $log.error('Angular-auto-validate: invalid bs3 form structure elements must be wrapped by a form-group class');
            }
        };

        return $delegate;
    });
}