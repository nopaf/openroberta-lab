define(["require", "exports", "message", "util", "user.model", "guiState.controller", "jquery", "blockly"], function (require, exports, MSG, UTIL, USER, GUISTATE_C, $, Blockly) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initValidationMessages = exports.showResetPassword = exports.showUserInfo = exports.showDeleteUserModal = exports.showUserGroupLoginForm = exports.showLoginForm = exports.showUserDataForm = exports.init = exports.logout = exports.activateAccount = void 0;
    var $divForms;
    var $formLogin;
    var $formLost;
    var $formRegister;
    var $formUserPasswordChange;
    var $formSingleModal;
    var $h3Login;
    var $h3Register;
    var $h3Lost;
    var $formUserGroupLogin;
    var $articleLostUserGroupPassword;
    var $h3LoginUserGroupLogin;
    var $h3LostPasswordUsergroupLogin;
    var $modalAnimateTime = 300;
    var $msgAnimateTime = 150;
    var $msgShowTime = 2000;
    /**
     * Create new user
     */
    function createUserToServer() {
        $formRegister.validate();
        if ($formRegister.valid()) {
            USER.createUserToServer($('#registerAccountName').val(), $('#registerUserName').val(), $('#registerUserEmail').val(), $('#registerPass').val(), $('#registerUserAge').val(), GUISTATE_C.getLanguage(), function (result) {
                if (result.rc === 'ok') {
                    $('#loginAccountName').val($('#registerAccountName').val());
                    $('#loginPassword').val($('#registerPass').val());
                    login();
                }
                MSG.displayInformation(result, result.message, result.message, $('#registerAccountName').val());
            });
        }
    }
    /**
     * Update user
     */
    function updateUserToServer() {
        if (GUISTATE_C.isUserMemberOfUserGroup()) {
            $('#login-user').modal('hide');
            return;
        }
        $formRegister.validate();
        if ($formRegister.valid()) {
            USER.updateUserToServer(GUISTATE_C.getUserAccountName(), $('#registerUserName').val(), $('#registerUserEmail').val(), $('#registerUserAge').val(), GUISTATE_C.getLanguage(), function (result) {
                if (result.rc === 'ok') {
                    USER.getUserFromServer(function (result) {
                        if (result.rc === 'ok') {
                            GUISTATE_C.setLogin(result);
                        }
                    });
                }
                MSG.displayInformation(result, result.message, result.message);
            });
        }
    }
    /**
     * Update User Password
     */
    function updateUserPasswordOnServer() {
        restPasswordLink = $('#resetPassLink').val();
        $formUserPasswordChange.validate();
        if ($formUserPasswordChange.valid()) {
            if (restPasswordLink) {
                USER.resetPasswordToServer(restPasswordLink, $('#passNew').val(), function (result) {
                    if (result.rc === 'ok') {
                        $('#change-user-password').modal('hide');
                        $('#resetPassLink').val(undefined);
                        // not to close the startup popup, if it is open
                        MSG.displayMessage(result.message, 'TOAST', '');
                    }
                    else {
                        MSG.displayInformation(result, '', result.message);
                    }
                });
            }
            else {
                USER.updateUserPasswordToServer(GUISTATE_C.getUserAccountName(), $('#passOld').val(), $('#passNew').val(), function (result) {
                    if (result.rc === 'ok') {
                        $('#change-user-password').modal('hide');
                    }
                    MSG.displayInformation(result, '', result.message);
                });
            }
        }
    }
    /**
     * Get user from server
     */
    function getUserFromServer() {
        USER.getUserFromServer(GUISTATE_C.getUserAccountName(), function (result) {
            if (result.rc === 'ok') {
                $('#registerAccountName').val(result.userAccountName);
                $('#registerUserEmail').val(result.userEmail);
                $('#registerUserName').val(result.userName);
                $('#registerUserAge').val(result.isYoungerThen14 ? 1 : 2);
            }
        });
    }
    /**
     * resend account activation
     */
    function sendAccountActivation() {
        //        if ($("#registerUserEmail").val() != "") {
        USER.userSendAccountActivation(GUISTATE_C.getUserAccountName(), GUISTATE_C.getLanguage(), function (result) {
            MSG.displayInformation(result, result.message, result.message);
        });
        //        }
    }
    /**
     * account activation
     */
    function activateAccount(url) {
        USER.userActivateAccount(url, function (result) {
            MSG.displayInformation(result, result.message, result.message);
        });
    }
    exports.activateAccount = activateAccount;
    /**
     * Login user
     */
    function login() {
        $formLogin.validate();
        if ($formLogin.valid()) {
            USER.login($('#loginAccountName').val(), $('#loginPassword').val(), function (result) {
                if (result.rc === 'ok') {
                    GUISTATE_C.setLogin(result);
                    if (result.userId === 1) {
                        $('#menuNotificationWrap').removeClass('hidden');
                    }
                }
                MSG.displayInformation(result, 'MESSAGE_USER_LOGIN', result.message, GUISTATE_C.getUserName());
            });
        }
    }
    /**
     * Login member of user-group
     */
    function loginToUserGroup() {
        $formUserGroupLogin.validate();
        if ($formUserGroupLogin.valid()) {
            var values = $formUserGroupLogin.serializeArray(), valuesObj = {};
            for (var i = 0; i < values.length; i++) {
                if (typeof values[i].name === 'undefined' || typeof values[i].value === 'undefined') {
                    continue;
                }
                valuesObj[values[i].name] = values[i].value;
            }
            USER.loginUserGroup(valuesObj.userGroupOwner, valuesObj.userGroupName, valuesObj.userGroupName + ':' + valuesObj.accountName, valuesObj.password, function (result) {
                if (result.rc === 'ok') {
                    $('#menuDeleteUser, #menuGroupPanel').parent().addClass('unavailable');
                    GUISTATE_C.setLogin(result);
                    MSG.displayInformation(result, 'MESSAGE_USER_LOGIN', result.message, GUISTATE_C.getUserName());
                    if (valuesObj.password === valuesObj.userGroupName + ':' + valuesObj.accountName) {
                        $('#passOld').val(valuesObj.password);
                        $('#grOldPassword').hide();
                        $('#change-user-password').modal('show');
                    }
                }
                else {
                    MSG.displayInformation(result, 'MESSAGE_USER_LOGIN', result.message, GUISTATE_C.getUserName());
                }
            });
        }
    }
    /**
     * Logout user
     */
    function logout() {
        USER.logout(function (result) {
            UTIL.response(result);
            if (result.rc === 'ok') {
                if (GUISTATE_C.isUserMemberOfUserGroup()) {
                    $('#menuDeleteUser, #menuGroupPanel').parent().removeClass('unavailable');
                }
                GUISTATE_C.setLogout();
            }
            MSG.displayInformation(result, 'MESSAGE_USER_LOGOUT', result.message, GUISTATE_C.getUserName());
        });
    }
    exports.logout = logout;
    /**
     * Update user password
     */
    function userPasswordRecovery() {
        $formLost.validate();
        if ($formLost.valid()) {
            USER.userPasswordRecovery($('#lost_email').val(), GUISTATE_C.getLanguage(), function (result) {
                MSG.displayInformation(result, result.message, result.message);
            });
        }
    }
    /**
     * Delete user on server
     */
    function deleteUserOnServer() {
        $formSingleModal.validate();
        if ($formSingleModal.valid()) {
            USER.deleteUserOnServer(GUISTATE_C.getUserAccountName(), $('#singleModalInput').val(), function (result) {
                if (result.rc === 'ok') {
                    logout();
                }
                MSG.displayInformation(result, result.message, result.message, GUISTATE_C.getUserAccountName());
            });
        }
    }
    function validateLoginUser() {
        $formLogin.removeData('validator');
        $.validator.addMethod('loginRegex', function (value, element) {
            return this.optional(element) || /^[a-zA-Z0-9=+!?.,%#+&^@_\- ]+$/gi.test(value);
        }, 'This field contains nonvalid symbols.');
        $formLogin.validate({
            rules: {
                loginAccountName: {
                    required: true,
                    loginRegex: true,
                },
                loginPassword: {
                    required: true,
                },
            },
            errorClass: 'form-invalid',
            errorPlacement: function (label, element) {
                label.insertBefore(element.parent());
            },
            messages: {
                loginAccountName: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                    loginRegex: Blockly.Msg['VALIDATION_CONTAINS_SPECIAL_CHARACTERS'],
                },
                loginPassword: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                },
            },
        });
    }
    function validateLoginUserGroupMember() {
        $formUserGroupLogin.removeData('validator');
        $.validator.addMethod('loginRegex', function (value, element) {
            return this.optional(element) || /^[a-zA-Z0-9=+!?.,%#+&^@_\- ]+$/gi.test(value);
        }, 'This field contains nonvalid symbols.');
        $formUserGroupLogin.validate({
            rules: {
                usergroupLoginOwner: {
                    required: true,
                    loginRegex: true,
                },
                usergroupLoginUserGroup: {
                    required: true,
                },
                usergroupLoginAccount: {
                    required: true,
                    loginRegex: true,
                },
                usergroupLoginPassword: {
                    required: true,
                },
            },
            errorClass: 'form-invalid',
            errorPlacement: function (label, element) {
                label.insertBefore(element.parent());
            },
            messages: {
                usergroupLoginOwner: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                    loginRegex: Blockly.Msg['VALIDATION_CONTAINS_SPECIAL_CHARACTERS'],
                },
                usergroupLoginUserGroup: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                },
                loginAccountName: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                    loginRegex: Blockly.Msg['VALIDATION_CONTAINS_SPECIAL_CHARACTERS'],
                },
                loginPassword: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                },
            },
        });
    }
    function validateRegisterUser() {
        $formRegister.removeData('validator');
        $.validator.addMethod('emailRegex', function (value, element) {
            return (this.optional(element) ||
                /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i.test(value));
        }, 'This field must contain a valid email adress.');
        $.validator.addMethod('loginRegex', function (value, element) {
            return this.optional(element) || /^[a-zA-Z0-9=+!?.,%#+&^@_\- ]+$/gi.test(value);
        }, 'This field must contain only letters, numbers, or dashes.');
        $formRegister.validate({
            rules: {
                registerAccountName: {
                    required: true,
                    maxlength: 25,
                    loginRegex: true,
                },
                registerPass: {
                    required: true,
                    minlength: 6,
                },
                registerPassConfirm: {
                    required: true,
                    equalTo: '#registerPass',
                },
                registerUserName: {
                    required: false,
                    maxlength: 25,
                    loginRegex: true,
                },
                registerUserEmail: {
                    required: false,
                    emailRegex: true,
                },
                registerUserAge: {
                    required: function (element) {
                        return $('#registerUserEmail').val() != '';
                    },
                },
            },
            onfocusout: false,
            errorClass: 'form-invalid',
            errorPlacement: function (label, element) {
                label.insertBefore(element.parent());
            },
            showErrors: function (errorMap, errorList) {
                if (errorList.length) {
                    var firstError = errorList.shift();
                    this.errorList = [firstError];
                }
                this.defaultShowErrors();
            },
            messages: {
                registerAccountName: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                    maxlength: Blockly.Msg['VALIDATION_MAX_LENGTH'],
                    loginRegex: Blockly.Msg['VALIDATION_CONTAINS_SPECIAL_CHARACTERS'],
                },
                registerPass: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                    minlength: Blockly.Msg['VALIDATION_PASSWORD_MIN_LENGTH'],
                },
                registerPassConfirm: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                    equalTo: Blockly.Msg['VALIDATION_SECOND_PASSWORD_EQUAL'],
                },
                registerUserName: {
                    required: jQuery.validator.format(Blockly.Msg['VALIDATION_FIELD_REQUIRED']),
                    maxlength: Blockly.Msg['VALIDATION_MAX_LENGTH'],
                    loginRegex: Blockly.Msg['VALIDATION_CONTAINS_SPECIAL_CHARACTERS'],
                },
                registerUserEmail: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                    emailRegex: Blockly.Msg['VALIDATION_VALID_EMAIL_ADDRESS'],
                },
                registerUserAge: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                },
            },
        });
    }
    function validateUserPasswordChange() {
        $formUserPasswordChange.removeData('validator');
        $formUserPasswordChange.validate({
            rules: {
                passOld: 'required',
                passNew: {
                    required: true,
                    minlength: 6,
                },
                passNewRepeat: {
                    required: true,
                    equalTo: '#passNew',
                },
            },
            errorClass: 'form-invalid',
            errorPlacement: function (label, element) {
                label.insertBefore(element.parent());
            },
            messages: {
                passOld: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                },
                passNew: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                    minlength: Blockly.Msg['VALIDATION_PASSWORD_MIN_LENGTH'],
                },
                passNewRepeat: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                    equalTo: Blockly.Msg['VALIDATION_SECOND_PASSWORD_EQUAL'],
                },
            },
        });
    }
    function validateLostPassword() {
        $formLost.removeData('validator');
        $formLost.validate({
            rules: {
                lost_email: {
                    required: true,
                    email: true,
                },
            },
            errorClass: 'form-invalid',
            errorPlacement: function (label, element) {
                label.insertBefore(element.parent());
            },
            messages: {
                lost_email: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                    email: Blockly.Msg['VALIDATION_VALID_EMAIL_ADDRESS'],
                },
            },
        });
    }
    //Animate between forms in login modal
    function modalAnimate($oldForm, $newForm) {
        $oldForm.fadeToggle($modalAnimateTime, function () {
            $newForm.fadeToggle();
        });
    }
    function msgFade($msgId, $msgText) {
        $msgId.fadeOut($msgAnimateTime, function () {
            $(this).text($msgText).fadeIn($msgAnimateTime);
        });
    }
    //header change of the modal login
    function headerChange($oldHeder, $newHeder) {
        $oldHeder.addClass('hidden');
        $newHeder.removeClass('hidden');
    }
    /**
     * Resets the validation of every form in login modal
     * also resets the shown hint
     */
    function resetForm() {
        $formLogin.validate().resetForm();
        $formLost.validate().resetForm();
        $formRegister.validate().resetForm();
        $('#register-form .hint').hide();
    }
    /**
     * Clear input fields in login modal
     */
    function clearInputs() {
        $divForms.find('input').val('');
        $('#registerUserAge').val('none');
    }
    function showRegisterForm() {
        $formRegister.off('submit');
        $formRegister.onWrap('submit', function (e) {
            e.preventDefault();
            createUserToServer();
        }, 'submit registration data');
        $('#registerUser').text(Blockly.Msg['POPUP_REGISTER_USER']);
        $('#registerAccountName').prop('disabled', false);
        $('#userInfoLabel').addClass('hidden');
        if (!GUISTATE_C.isPublicServerVersion()) {
            $('#fgUserAge').addClass('hidden');
        }
        $('#fgRegisterPass').show();
        $('#fgRegisterPassConfirm').show();
        $('#showChangeUserPassword').addClass('hidden');
        $('#resendActivation').addClass('hidden');
        $('#register_login_btn').show();
        $('#register_lost_btn').show();
    }
    function initLoginModal() {
        $('#login-user').onWrap('hidden.bs.modal', function () {
            resetForm();
            clearInputs();
        });
        $formLost.onWrap('submit', function (e) {
            e.preventDefault();
            userPasswordRecovery();
        }, 'submit password recovery data');
        $formLogin.onWrap('submit', function (e) {
            e.preventDefault();
            login();
        }, 'submit login data');
        $('#register-form input.form-control, #register-form select.form-control').focus(function (e) {
            var $hint = $(this).parent().next('.hint');
            $('#register-form .hint').not($hint).slideUp($msgAnimateTime);
            $hint.slideDown($msgAnimateTime);
        });
        $('#registerUserEmail').on('change paste keyup', function () {
            if ($('#registerUserEmail').val() == '') {
                $('#fgUserAge').fadeOut();
            }
            else {
                $('#fgUserAge').fadeIn();
            }
        });
        // Login form change between sub-form
        $('#login_register_btn').onWrap('click', function () {
            showRegisterForm();
            headerChange($h3Login, $h3Register);
            modalAnimate($formLogin, $formRegister);
            UTIL.setFocusOnElement($('#registerAccountName'));
        }, 'login_register_btn');
        $('#register_login_btn').onWrap('click', function () {
            headerChange($h3Register, $h3Login);
            modalAnimate($formRegister, $formLogin);
            UTIL.setFocusOnElement($('#loginAccountName'));
        }, 'register_login_btn');
        $('#login_lost_btn').onWrap('click', function () {
            headerChange($h3Login, $h3Lost);
            modalAnimate($formLogin, $formLost);
            UTIL.setFocusOnElement($('#lost_email'));
        }, 'login_lost_btn');
        $('#lost_login_btn').onWrap('click', function () {
            headerChange($h3Lost, $h3Login);
            modalAnimate($formLost, $formLogin);
            UTIL.setFocusOnElement($('#loginAccountName'));
        }, 'lost_login_btn');
        $('#lost_register_btn').onWrap('click', function () {
            headerChange($h3Lost, $h3Register);
            modalAnimate($formLost, $formRegister);
            UTIL.setFocusOnElement($('#registerAccountName'));
        }, 'lost_register_btn');
        $('#register_lost_btn').onWrap('click', function () {
            headerChange($h3Register, $h3Lost);
            modalAnimate($formRegister, $formLost);
            UTIL.setFocusOnElement($('#lost_email'));
        }, 'register_lost_btn');
        validateLoginUser();
        validateRegisterUser();
        validateLostPassword();
    }
    function initUserGroupLoginModal() {
        $('#usergroupLoginPopup').onWrap('hidden.bs.modal', function () {
            $formUserGroupLogin.validate().resetForm();
            $formUserGroupLogin.find('input, select').val('');
        });
        $formUserGroupLogin.onWrap('submit', function (e) {
            e.preventDefault();
            loginToUserGroup();
        });
        $formUserGroupLogin.find('input, select').focus(function (e) {
            var $hint = $(this).parent().next('.hint');
            $formUserGroupLogin.find('.hint').not($hint).slideUp($msgAnimateTime);
            $hint.slideDown($msgAnimateTime);
        });
        // Login form change between sub-form
        $('#lostPasswordUsergroupLogin').onWrap('click', function () {
            headerChange($h3LoginUserGroupLogin, $h3LostPasswordUsergroupLogin);
            modalAnimate($formUserGroupLogin, $articleLostUserGroupPassword);
            UTIL.setFocusOnElement($articleLostUserGroupPassword);
        });
        $('#loginUsergroupLogin').onWrap('click', function () {
            headerChange($h3LostPasswordUsergroupLogin, $h3LoginUserGroupLogin);
            modalAnimate($articleLostUserGroupPassword, $formUserGroupLogin);
            UTIL.setFocusOnElement($('#usergroupLoginOwner'));
        });
        validateLoginUserGroupMember();
    }
    function initUserPasswordChangeModal() {
        $formUserPasswordChange.onWrap('submit', function (e) {
            e.preventDefault();
            updateUserPasswordOnServer();
        });
        $('#showChangeUserPassword').onWrap('click', function () {
            $('#change-user-password').modal('show');
        });
        $('#resendActivation').onWrap('click', function () {
            sendAccountActivation();
        });
        $('#change-user-password').onWrap('hidden.bs.modal', function () {
            $formUserPasswordChange.validate().resetForm();
            $('#grOldPassword').show();
            $('#passOld').val('');
            $('#passNew').val('');
            $('#passNewRepeat').val('');
        });
        validateUserPasswordChange();
    }
    /**
     * Initialize the login modal
     */
    function init() {
        var ready = $.Deferred();
        $.when(USER.clear(function (result) {
            UTIL.response(result);
        })).then(function () {
            $divForms = $('#div-login-forms');
            $formLogin = $('#login-form');
            $formLost = $('#lost-form');
            $formRegister = $('#register-form');
            $formUserPasswordChange = $('#change-user-password-form');
            $formSingleModal = $('#single-modal-form');
            $h3Login = $('#loginLabel');
            $h3Register = $('#registerInfoLabel');
            $h3Lost = $('#forgotPasswordLabel');
            $formUserGroupLogin = $('#loginUsergroupLoginForm');
            $articleLostUserGroupPassword = $('#lostPasswordUsergroupLoginArticle');
            $h3LoginUserGroupLogin = $('#loginUsergroupLoginTitle');
            $h3LostPasswordUsergroupLogin = $('#lostPasswordUsergroupLoginTitle');
            $('#iconDisplayLogin').onWrap('click', function () {
                showUserInfo();
            }, 'icon user click');
            initLoginModal();
            initUserGroupLoginModal();
            initUserPasswordChangeModal();
            ready.resolve();
        });
        return ready.promise();
    }
    exports.init = init;
    function showUserDataForm() {
        getUserFromServer();
        $formRegister.off('submit');
        $formRegister.onWrap('submit', function (e) {
            e.preventDefault();
            updateUserToServer();
        });
        $('#registerUser').text('OK');
        $('#registerAccountName').prop('disabled', true);
        $('#userInfoLabel').removeClass('hidden');
        $('#loginLabel').addClass('hidden');
        $('#registerInfoLabel').addClass('hidden');
        $('#forgotPasswordLabel').addClass('hidden');
        $('#fgRegisterPass').hide();
        $('#fgRegisterPassConfirm').hide();
        $('#register_login_btn').hide();
        $('#showChangeUserPassword').removeClass('hidden');
        if (GUISTATE_C.isPublicServerVersion()) {
            $('#resendActivation').removeClass('hidden');
        }
        $('#register_lost_btn').hide();
        $formLogin.hide();
        $formRegister.show();
        if (GUISTATE_C.isUserMemberOfUserGroup()) {
            $('#change-user-password').modal('show');
        }
        else {
            $('#login-user').modal('show');
        }
    }
    exports.showUserDataForm = showUserDataForm;
    function showLoginForm() {
        $('#userInfoLabel').addClass('hidden');
        $('#registerInfoLabel').addClass('hidden');
        $('#forgotPasswordLabel').addClass('hidden');
        $formLogin.show();
        $formLost.hide();
        $formRegister.hide();
        $('#login-user').modal('show');
    }
    exports.showLoginForm = showLoginForm;
    function showUserGroupLoginForm() {
        $('#lostPasswordUsergroupLoginTitle').addClass('hidden');
        $formUserGroupLogin.show();
        $articleLostUserGroupPassword.hide();
        $('#usergroupLoginPopup').modal('show');
    }
    exports.showUserGroupLoginForm = showUserGroupLoginForm;
    function showDeleteUserModal() {
        UTIL.showSingleModal(function () {
            $('#singleModalInput').attr('type', 'password');
            $('#single-modal h3').text(Blockly.Msg['MENU_DELETE_USER']);
            $('#single-modal label').text(Blockly.Msg['POPUP_PASSWORD']);
            $('#single-modal span').removeClass('typcn-pencil');
            $('#single-modal span').addClass('typcn-lock-closed');
        }, deleteUserOnServer, function () {
            $('#single-modal span').addClass('typcn-pencil');
            $('#single-modal span').removeClass('typcn-lock-closed');
        }, {
            rules: {
                singleModalInput: {
                    required: true,
                },
            },
            errorClass: 'form-invalid',
            errorPlacement: function (label, element) {
                label.insertBefore(element.parent());
            },
            messages: {
                singleModalInput: {
                    required: jQuery.validator.format(Blockly.Msg['VALIDATION_FIELD_REQUIRED']),
                },
            },
        });
    }
    exports.showDeleteUserModal = showDeleteUserModal;
    /**
     * Show user info
     */
    function showUserInfo() {
        $('#loggedIn').text(GUISTATE_C.getUserAccountName());
        if (GUISTATE_C.isUserLoggedIn()) {
            $('#popup_username').text(Blockly.Msg['POPUP_USERNAME'] + ': ');
        }
        else {
            $('#popup_username').text(Blockly.Msg['POPUP_USERNAME_LOGOFF']);
        }
        $('#programName').text(GUISTATE_C.getProgramName());
        $('#configurationName').text(GUISTATE_C.getConfigurationName());
        if (GUISTATE_C.getProgramToolboxLevel() === 'beginner') {
            $('#toolbox').text(Blockly.Msg['MENU_BEGINNER']);
        }
        else {
            $('#toolbox').text(Blockly.Msg['MENU_EXPERT']);
        }
        $('#show-state-info').modal('show');
    }
    exports.showUserInfo = showUserInfo;
    function showResetPassword(target) {
        USER.checkTargetRecovery(target, function (result) {
            if (result.rc === 'ok') {
                $('#passOld').val(target);
                $('#resetPassLink').val(target);
                $('#grOldPassword').hide();
                $('#change-user-password').modal('show');
            }
            else {
                result.rc = 'error';
                MSG.displayInformation(result, '', result.message);
            }
        });
    }
    exports.showResetPassword = showResetPassword;
    function initValidationMessages() {
        validateLoginUser();
        validateRegisterUser();
        validateLostPassword();
    }
    exports.initValidationMessages = initValidationMessages;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9yb2JlcnRhL2NvbnRyb2xsZXIvdXNlci5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVFBLElBQUksU0FBUyxDQUFDO0lBQ2QsSUFBSSxVQUFVLENBQUM7SUFDZixJQUFJLFNBQVMsQ0FBQztJQUNkLElBQUksYUFBYSxDQUFDO0lBQ2xCLElBQUksdUJBQXVCLENBQUM7SUFDNUIsSUFBSSxnQkFBZ0IsQ0FBQztJQUVyQixJQUFJLFFBQVEsQ0FBQztJQUNiLElBQUksV0FBVyxDQUFDO0lBQ2hCLElBQUksT0FBTyxDQUFDO0lBRVosSUFBSSxtQkFBbUIsQ0FBQztJQUN4QixJQUFJLDZCQUE2QixDQUFDO0lBRWxDLElBQUksc0JBQXNCLENBQUM7SUFDM0IsSUFBSSw2QkFBNkIsQ0FBQztJQUVsQyxJQUFJLGlCQUFpQixHQUFHLEdBQUcsQ0FBQztJQUM1QixJQUFJLGVBQWUsR0FBRyxHQUFHLENBQUM7SUFDMUIsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDO0lBRXhCOztPQUVHO0lBQ0gsU0FBUyxrQkFBa0I7UUFDdkIsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3pCLElBQUksYUFBYSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ3ZCLElBQUksQ0FBQyxrQkFBa0IsQ0FDbkIsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsR0FBRyxFQUFFLEVBQy9CLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUM1QixDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFDN0IsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUN4QixDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFDM0IsVUFBVSxDQUFDLFdB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