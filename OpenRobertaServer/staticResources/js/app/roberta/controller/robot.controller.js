define(["require", "exports", "util", "log", "message", "guiState.controller", "robot.model", "program.controller", "configuration.controller", "webview.controller", "sourceCodeEditor.controller", "progCode.controller", "jquery", "blockly", "jquery-validate"], function (require, exports, UTIL, LOG, MSG, GUISTATE_C, ROBOT, PROGRAM_C, CONFIGURATION_C, WEBVIEW_C, CODEEDITOR_C, PROGCODE_C, $, Blockly) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.switchRobot = exports.updateFirmware = exports.handleFirmwareConflict = exports.showWlanForm = exports.showRobotInfo = exports.showListModal = exports.showScanModal = exports.showSetTokenModal = exports.getPort = exports.setPort = exports.init = void 0;
    var $formSingleModal;
    var $formSingleListModal;
    var robotPort;
    /**
     * Initialize robot
     */
    function init() {
        var ready = $.Deferred();
        $.when(ROBOT.setRobot(GUISTATE_C.getRobot(), function (result) {
            if (result.rc == 'ok') {
                GUISTATE_C.setRobot(GUISTATE_C.getRobot(), result, true);
            }
        })).then(function () {
            initRobotForms();
            ready.resolve();
        });
        return ready.promise();
    }
    exports.init = init;
    /**
     * Set token
     *
     * @param {token}
     *            Token value to be set
     */
    function setToken(token) {
        $formSingleModal.validate();
        if ($formSingleModal.valid()) {
            ROBOT.setToken(token, function (result) {
                if (result.rc === 'ok') {
                    GUISTATE_C.setRobotToken(token);
                    GUISTATE_C.setState(result);
                    // console.log(result.message);
                    MSG.displayInformation(result, 'MESSAGE_ROBOT_CONNECTED', result.message, GUISTATE_C.getRobotName());
                    handleFirmwareConflict(result['robot.update'], result['robot.serverVersion']);
                }
                else {
                    if (result.message === 'ORA_TOKEN_SET_ERROR_WRONG_ROBOTTYPE') {
                        $('.modal').modal('hide');
                    }
                }
                UTIL.response(result);
            });
        }
    }
    function setPort(port) {
        robotPort = port;
        $('#single-modal-list').modal('hide');
        GUISTATE_C.setRobotPort(port);
    }
    exports.setPort = setPort;
    function getPort() {
        return robotPort;
    }
    exports.getPort = getPort;
    function initRobotForms() {
        $('#iconDisplayRobotState').onWrap('click', function () {
            showRobotInfo();
        }, 'display robot state');
        $('#wlan-form').removeData('validator');
        $.validator.addMethod('wlanRegex', function (value, element) {
            return this.optional(element) || /^[a-zA-Z0-9$ *\(\)\{\}\[\]><~`\'\\\/|=+!?.,%#+&^@_\-äöüÄÖÜß]+$/gi.test(value);
        }, 'This field contains nonvalid symbols.');
        $('#wlan-form').validate({
            rules: {
                wlanSsid: {
                    required: true,
                    wlanRegex: true,
                },
                wlanPassword: {
                    required: true,
                    wlanRegex: true,
                },
            },
            errorClass: 'form-invalid',
            errorPlacement: function (label, element) {
                label.insertBefore(element.parent());
            },
            messages: {
                wlanSsid: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                    wlanRegex: Blockly.Msg['VALIDATION_CONTAINS_SPECIAL_CHARACTERS'],
                },
                wlanPassword: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                    wlanRegex: Blockly.Msg['VALIDATION_CONTAINS_SPECIAL_CHARACTERS'],
                },
            },
        });
        $('#setWlanCredentials').onWrap('click', function (e) {
            e.preventDefault();
            $('#wlan-form').validate();
            if ($('#wlan-form').valid()) {
                PROGRAM_C.SSID = document.getElementById('wlanSsid').value;
                PROGRAM_C.password = document.getElementById('wlanPassword').value;
                $('#menu-wlan').modal('hide');
            }
        }, 'wlan form submitted');
        $('#doUpdateFirmware').onWrap('click', function () {
            $('#set-token').modal('hide');
            $('#confirmUpdateFirmware').modal('hide');
            updateFirmware();
        }, 'update firmware of robot');
        $formSingleModal = $('#single-modal-form');
        $('#connectionsTable').bootstrapTable({
            formatNoMatches: function () {
                return '<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>';
            },
            columns: [
                {
                    // TODO: translations
                    title: 'Name',
                    field: 'name',
                },
                {
                    visible: false,
                    field: 'id',
                },
            ],
        });
        $('#connectionsTable').onWrap('click-row.bs.table', function (e, row) {
            WEBVIEW_C.jsToAppInterface({
                target: GUISTATE_C.getRobot(),
                type: 'connect',
                robot: row.id,
            });
        }, 'connect to robot');
        $('#show-available-connections').on('hidden.bs.modal', function (e) {
            WEBVIEW_C.jsToAppInterface({
                target: GUISTATE_C.getRobot(),
                type: 'stopScan',
            });
        });
        $('#show-available-connections').onWrap('add', function (event, data) {
            $('#connectionsTable').bootstrapTable('insertRow', {
                index: 999,
                row: {
                    name: data.brickname,
                    id: data.brickid,
                },
            });
        }, 'insert robot connections');
        $('#show-available-connections').onWrap('connect', function (event, data) {
            var result = {};
            result['robot.name'] = data.brickname;
            result['robot.state'] = 'wait';
            GUISTATE_C.setState(result);
            $('#show-available-connections').modal('hide');
        }, 'connect to a robot');
    }
    function showSetTokenModal() {
        UTIL.showSingleModal(function () {
            $('#singleModalInput').attr('type', 'text');
            $('#single-modal h3').text(Blockly.Msg['MENU_CONNECT']);
            $('#single-modal label').text(Blockly.Msg['POPUP_VALUE']);
            $('#singleModalInput').addClass('capitalLetters');
            $('#single-modal a[href]').text(Blockly.Msg['POPUP_STARTUP_HELP']);
            $('#single-modal a[href]').attr('href', 'http://wiki.open-roberta.org');
        }, function () {
            setToken($('#singleModalInput').val().toUpperCase());
        }, function () {
            $('#singleModalInput').removeClass('capitalLetters');
        }, {
            rules: {
                singleModalInput: {
                    required: true,
                    minlength: 8,
                    maxlength: 8,
                },
            },
            errorClass: 'form-invalid',
            errorPlacement: function (label, element) {
                label.insertAfter(element);
            },
            messages: {
                singleModalInput: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                    minlength: Blockly.Msg['VALIDATION_TOKEN_LENGTH'],
                    maxlength: Blockly.Msg['VALIDATION_TOKEN_LENGTH'],
                },
            },
        });
    }
    exports.showSetTokenModal = showSetTokenModal;
    function showScanModal() {
        if ($('#show-available-connections').is(':visible')) {
            return;
        }
        $('#connectionsTable').bootstrapTable('removeAll');
        WEBVIEW_C.jsToAppInterface({
            target: GUISTATE_C.getRobot(),
            type: 'startScan',
        });
        $('#show-available-connections').modal('show');
    }
    exports.showScanModal = showScanModal;
    function showListModal() {
        UTIL.showSingleListModal(function () {
            $('#single-modal-list h3').text(Blockly.Msg['MENU_CONNECT']);
            $('#single-modal-list label').text(Blockly.Msg['POPUP_VALUE']);
            $('#single-modal-list a[href]').text(Blockly.Msg['POPUP_STARTUP_HELP']);
            $('#single-modal-list a[href]').attr('href', 'http://wiki.open-roberta.org');
        }, function () {
            //console.log(document.getElementById("singleModalListInput").value);
            setPort(document.getElementById('singleModalListInput').value);
        }, function () { });
    }
    exports.showListModal = showListModal;
    /**
     * Show robot info
     */
    function showRobotInfo() {
        if (GUISTATE_C.isRobotConnected()) {
            $('#robotName').text(GUISTATE_C.getRobotName());
            $('#robotSystem').text(GUISTATE_C.getRobotFWName());
            if (GUISTATE_C.getRobotState() === 'wait') {
                $('#robotStateWait').css('display', 'inline');
                $('#robotStateDisconnected').css('display', 'none');
                $('#robotStateBusy').css('display', 'none');
            }
            else if (GUISTATE_C.getRobotState() === 'busy') {
                $('#robotStateWait').css('display', 'none');
                $('#robotStateDisconnected').css('display', 'none');
                $('#robotStateBusy').css('display', 'inline');
            }
            else {
                $('#robotStateWait').css('display', 'none');
                $('#robotStateDisconnected').css('display', 'inline');
                $('#robotStateBusy').css('display', 'none');
            }
            if (GUISTATE_C.getLanguage() == 'EN') {
                $('#robotBattery').text(GUISTATE_C.getRobotBattery() + ' V');
            }
            else {
                $('#robotBattery').text(GUISTATE_C.getRobotBattery().toString().replace('.', ',') + ' V');
            }
            var robotWait = parseInt(GUISTATE_C.getRobotTime(), 10);
            if (robotWait < 1000) {
                $('#robotWait').text(robotWait + ' ms');
            }
            else {
                $('#robotWait').text(Math.round(robotWait / 1000) + ' s');
            }
            $('#show-robot-info').modal('show');
        }
        else {
            MSG.displayMessage('ORA_ROBOT_NOT_CONNECTED', 'POPUP', '');
        }
    }
    exports.showRobotInfo = showRobotInfo;
    /**
     * Show WLAN credentials form to save them for further REST calls.
     */
    function showWlanForm() {
        $('#menu-wlan').modal('show');
    }
    exports.showWlanForm = showWlanForm;
    /**
     * Handle firmware conflict between server and robot
     */
    function handleFirmwareConflict(updateInfo, robotServerVersion) {
        if (updateInfo < 0) {
            LOG.info("The firmware version '" +
                robotServerVersion +
                "' on the server is newer than the firmware version '" +
                GUISTATE_C.getRobotVersion() +
                "' on the robot");
            $('#confirmUpdateFirmware').modal('show');
            return true;
        }
        else if (updateInfo > 0) {
            LOG.info("The firmware version '" +
                robotServerVersion +
                "' on the server is older than the firmware version '" +
                GUISTATE_C.getRobotVersion() +
                "' on the robot");
            MSG.displayMessage('MESSAGE_FIRMWARE_ERROR', 'POPUP', '');
            return true;
        }
        return false;
    }
    exports.handleFirmwareConflict = handleFirmwareConflict;
    /**
     * Update robot firmware
     */
    function updateFirmware() {
        ROBOT.updateFirmware(function (result) {
            GUISTATE_C.setState(result);
            if (result.rc === 'ok') {
                MSG.displayMessage('MESSAGE_RESTART_ROBOT', 'POPUP', '');
            }
            else {
                MSG.displayInformation(result, '', result.message, GUISTATE_C.getRobotFWName());
            }
        });
    }
    exports.updateFirmware = updateFirmware;
    /**
     * Switch robot
     */
    function switchRobot(robot, opt_continue, opt_callback) {
        PROGRAM_C.SSID = null;
        PROGRAM_C.password = null;
        document.getElementById('wlanSsid').value = '';
        document.getElementById('wlanPassword').value = '';
        var further;
        // no need to ask for saving programs if you switch the robot in between a group
        if (typeof opt_continue === 'undefined' && GUISTATE_C.findGroup(robot) == GUISTATE_C.getRobotGroup()) {
            further = true;
        }
        else {
            further = opt_continue || false;
        }
        if (further || (GUISTATE_C.isProgramSaved() && GUISTATE_C.isConfigurationSaved())) {
            if (robot === GUISTATE_C.getRobot()) {
                typeof opt_callback === 'function' && opt_callback();
                return;
            }
            ROBOT.setRobot(robot, function (result) {
                if (result.rc === 'ok') {
                    if (GUISTATE_C.findGroup(robot) != GUISTATE_C.getRobotGroup()) {
                        GUISTATE_C.setRobot(robot, result);
                        CONFIGURATION_C.resetView();
                        PROGRAM_C.resetView();
                    }
                    else {
                        GUISTATE_C.setRobot(robot, result);
                    }
                    CONFIGURATION_C.changeRobotSvg();
                    if (GUISTATE_C.getView() == 'tabConfList') {
                        $('#confList>.bootstrap-table').find('button[name="refresh"]').clickWrap();
                    }
                    if (GUISTATE_C.getView() == 'tabProgList') {
                        $('#progList>.bootstrap-table').find('button[name="refresh"]').clickWrap();
                    }
                    if ($('.rightMenuButton.rightActive')) {
                        $('.rightMenuButton.rightActive').clickWrap();
                    }
                    PROGCODE_C.setCodeLanguage(GUISTATE_C.getSourceCodeFileExtension());
                    CODEEDITOR_C.setCodeLanguage(GUISTATE_C.getSourceCodeFileExtension());
                    CODEEDITOR_C.resetScroll();
                    //TODO inform app if one is there
                    //                    WEBVIEW_C.jsToAppInterface({
                    //                        'target' : 'wedo',
                    //                        'op' : {'type''disconnect'
                    //                    });
                    typeof opt_callback === 'function'
                        ? opt_callback()
                        : MSG.displayInformation(result, result.message, result.message, GUISTATE_C.getRobotRealName());
                }
                else {
                    MSG.displayInformation(result, result.message, result.message, GUISTATE_C.getRobotRealName());
                }
            });
        }
        else {
            $('#show-message-confirm').oneWrap('shown.bs.modal', function (e) {
                $('#confirm').off();
                $('#confirm').onWrap('click', function (e) {
                    e.preventDefault();
                    switchRobot(robot, true, opt_callback);
                }, 'confirm modal');
                $('#confirmCancel').off();
                $('#confirmCancel').onWrap('click', function (e) {
                    e.preventDefault();
                    $('.modal').modal('hide');
                }, 'cancel modal');
            });
            if (GUISTATE_C.isUserLoggedIn()) {
                MSG.displayMessage('POPUP_BEFOREUNLOAD_LOGGEDIN', 'POPUP', '', true);
            }
            else {
                MSG.displayMessage('POPUP_BEFOREUNLOAD', 'POPUP', '', true);
            }
        }
    }
    exports.switchRobot = switchRobot;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3QuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvcm9iZXJ0YS9jb250cm9sbGVyL3JvYm90LmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBZ0JBLElBQUksZ0JBQWdCLENBQUM7SUFDckIsSUFBSSxvQkFBb0IsQ0FBQztJQUN6QixJQUFJLFNBQVMsQ0FBQztJQUVkOztPQUVHO0lBQ0gsU0FBUyxJQUFJO1FBQ1QsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxJQUFJLENBQ0YsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLEVBQUUsVUFBVSxNQUFNO1lBQ2xELElBQUksTUFBTSxDQUFDLEVBQUUsSUFBSSxJQUFJLEVBQUU7Z0JBQ25CLFVBQVUsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQzthQUM1RDtRQUNMLENBQUMsQ0FBQyxDQUNMLENBQUMsSUFBSSxDQUFDO1lBQ0gsY0FBYyxFQUFFLENBQUM7WUFDakIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQXNaRyxvQkFBSTtJQXBaUjs7Ozs7T0FLRztJQUNILFNBQVMsUUFBUSxDQUFDLEtBQUs7UUFDbkIsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDNUIsSUFBSSxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUMxQixLQUFLLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxVQUFVLE1BQU07Z0JBQ2xDLElBQUksTUFBTSxDQUFDLEVBQUUsS0FBSyxJQUFJLEVBQUU7b0JBQ3BCLFVBQVUsQ0FB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