define(["require", "exports", "log", "util", "message", "guiState.controller", "blockly", "configuration.model", "confVisualization", "jquery", "jquery-validate"], function (require, exports, LOG, UTIL, MSG, GUISTATE_C, Blockly, CONFIGURATION, CV, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.configurationToBricklyWorkspace = exports.resetView = exports.changeRobotSvg = exports.reloadView = exports.reloadConf = exports.getBricklyWorkspace = exports.showConfiguration = exports.newConfiguration = exports.showSaveAsModal = exports.initConfigurationEnvironment = exports.loadFromListing = exports.saveAsToServer = exports.saveToServer = exports.initConfigurationForms = exports.init = void 0;
    var $formSingleModal;
    var bricklyWorkspace;
    var confVis;
    var listenToBricklyEvents = true;
    var seen = false;
    function init() {
        initView();
        initEvents();
        initConfigurationForms();
        initConfigurationEnvironment();
    }
    exports.init = init;
    /**
     * Inject Brickly with initial toolbox
     *
     * @param {response}
     *            toolbox
     */
    function initView() {
        var toolbox = GUISTATE_C.getConfigurationToolbox();
        bricklyWorkspace = Blockly.inject(document.getElementById('bricklyDiv'), {
            path: '/blockly/',
            toolbox: toolbox,
            trashcan: true,
            scrollbars: true,
            media: '../blockly/media/',
            zoom: {
                controls: true,
                wheel: false,
                startScale: 1.0,
                maxScale: 4,
                minScale: 0.25,
                scaleSpeed: 1.1,
            },
            checkInTask: ['-Brick', 'robConf'],
            variableDeclaration: true,
            robControls: true,
            theme: GUISTATE_C.getTheme(),
        });
        bricklyWorkspace.setDevice({
            group: GUISTATE_C.getRobotGroup(),
            robot: GUISTATE_C.getRobot(),
        });
        // Configurations can't be executed
        bricklyWorkspace.robControls.runOnBrick.setAttribute('style', 'display : none');
        GUISTATE_C.setBricklyWorkspace(bricklyWorkspace);
        bricklyWorkspace.robControls.disable('saveProgram');
    }
    function initEvents() {
        $('#tabConfiguration').onWrap('show.bs.tab', function (e) {
            GUISTATE_C.setView('tabConfiguration');
        });
        $('#tabConfiguration').onWrap('shown.bs.tab', function (e) {
            bricklyWorkspace.markFocused();
            if (GUISTATE_C.isConfigurationUsed()) {
                bricklyWorkspace.setVisible(true);
            }
            else {
                bricklyWorkspace.setVisible(false);
            }
            $(window).resize();
            UTIL.clearAnnotations(bricklyWorkspace);
            if (GUISTATE_C.confAnnos !== undefined) {
                UTIL.annotateBlocks(bricklyWorkspace, GUISTATE_C.confAnnos);
                delete GUISTATE_C.confAnnos;
            }
            confVis && confVis.refresh();
        }, 'tabConfiguration clicked');
        $('#tabConfiguration').onWrap('hide.bs.tab', function (e) {
            Blockly.hideChaff(false);
        });
        $('#tabConfiguration').onWrap('hidden.bs.tab', function (e) {
            var dom = confVis ? confVis.getXml() : Blockly.Xml.workspaceToDom(bricklyWorkspace);
            var xml = Blockly.Xml.domToText(dom);
            GUISTATE_C.setConfigurationXML(xml);
            bricklyWorkspace.setVisible(false);
        });
        Blockly.bindEvent_(bricklyWorkspace.robControls.saveProgram, 'mousedown', null, function (e) {
            LOG.info('saveConfiguration from brickly button');
            saveToServer();
        });
        bricklyWorkspace.addChangeListener(function (event) {
            if (listenToBricklyEvents && event.type != Blockly.Events.UI && GUISTATE_C.isConfigurationSaved()) {
                if (GUISTATE_C.isConfigurationStandard()) {
                    GUISTATE_C.setConfigurationName('');
                }
                GUISTATE_C.setConfigurationSaved(false);
                GUISTATE_C.setProgramSaved(false);
            }
            if (event.type === Blockly.Events.DELETE) {
                if (bricklyWorkspace.getAllBlocks().length === 0) {
                    newConfiguration(true);
                }
            }
        });
    }
    function initConfigurationForms() {
        $formSingleModal = $('#single-modal-form');
    }
    exports.initConfigurationForms = initConfigurationForms;
    /**
     * Save configuration to server
     */
    function saveToServer() {
        $('.modal').modal('hide'); // close all opened popups
        if (GUISTATE_C.isConfigurationStandard() || GUISTATE_C.isConfigurationAnonymous()) {
            LOG.error('saveToServer may only be called with an explicit config name');
            return;
        }
        var dom = confVis ? confVis.getXml() : Blockly.Xml.workspaceToDom(bricklyWorkspace);
        var xmlText = Blockly.Xml.domToText(dom);
        CONFIGURATION.saveConfigurationToServer(GUISTATE_C.getConfigurationName(), xmlText, function (result) {
            if (result.rc === 'ok') {
                GUISTATE_C.setConfigurationSaved(true);
                LOG.info('save brick configuration ' + GUISTATE_C.getConfigurationName());
            }
            MSG.displayInformation(result, 'MESSAGE_EDIT_SAVE_CONFIGURATION', result.message, GUISTATE_C.getConfigurationName());
        });
    }
    exports.saveToServer = saveToServer;
    /**
     * Save configuration with new name to server
     */
    function saveAsToServer() {
        $formSingleModal.validate();
        if ($formSingleModal.valid()) {
            $('.modal').modal('hide'); // close all opened popups
            var confName = $('#singleModalInput').val().trim();
            if (GUISTATE_C.getConfigurationStandardName() === confName) {
                LOG.error('saveAsToServer may NOT use the config standard name');
                return;
            }
            var dom = confVis ? confVis.getXml() : Blockly.Xml.workspaceToDom(bricklyWorkspace);
            var xmlText = Blockly.Xml.domToText(dom);
            CONFIGURATION.saveAsConfigurationToServer(confName, xmlText, function (result) {
                if (result.rc === 'ok') {
                    result.name = confName;
                    GUISTATE_C.setConfiguration(result);
                    GUISTATE_C.setProgramSaved(false);
                    LOG.info('save brick configuration ' + GUISTATE_C.getConfigurationName());
                    MSG.displayInformation(result, 'MESSAGE_EDIT_SAVE_CONFIGURATION_AS', result.message, GUISTATE_C.getConfigurationName());
                }
                else if (result.cause == 'ORA_CONFIGURATION_SAVE_AS_ERROR_CONFIGURATION_EXISTS') {
                    //Replace popup window
                    var modalMessage = Blockly.Msg.POPUP_BACKGROUND_REPLACE_CONFIGURATION ||
                        'A configuration with the same name already exists! <br> Would you like to replace it?';
                    $('#show-message-confirm').onWrap('shown.bs.modal', function (e) {
                        $('#confirm').off();
                        $('#confirm').onWrap('click', function (e) {
                            e.preventDefault;
                            CONFIGURATION.saveConfigurationToServer(confName, xmlText, function (result) {
                                if (result.rc == 'ok') {
                                    result.name = confName;
                                    GUISTATE_C.setConfiguration(result);
                                    GUISTATE_C.setProgramSaved(false);
                                    LOG.info('saved configuration' + GUISTATE_C.getConfigurationName() + ' as' + confName + ' and overwrote old content');
                                    MSG.displayInformation(result, 'MESSAGE_EDIT_SAVE_CONFIGURATION_AS', result.message, GUISTATE_C.getConfigurationName());
                                }
                                else {
                                    LOG.info('failed to overwrite ' + confName);
                                    MSG.displayMessage(result.message, 'POPUP', '');
                                }
                            });
                        }, 'confirm modal');
                        $('#confirmCancel').off();
                        $('#confirmCancel').onWrap('click', function (e) {
                            e.preventDefault();
                            $('.modal').modal('hide');
                        }, 'cancel modal');
                    });
                    MSG.displayPopupMessage('ORA_CONFIGURATION_SAVE_AS_ERROR_CONFIGURATION_EXISTS', modalMessage, Blockly.Msg.POPUP_REPLACE, Blockly.Msg.POPUP_CANCEL);
                }
            });
        }
    }
    exports.saveAsToServer = saveAsToServer;
    /**
     * Load the configuration that was selected in configurations list
     */
    function loadFromListing(conf) {
        LOG.info('loadFromList ' + conf[0]);
        CONFIGURATION.loadConfigurationFromListing(conf[0], conf[1], function (result) {
            if (result.rc === 'ok') {
                result.name = conf[0];
                $('#tabConfiguration').oneWrap('shown.bs.tab', function () {
                    showConfiguration(result);
                });
                $('#tabConfiguration').clickWrap();
            }
            MSG.displayInformation(result, '', result.message);
        });
    }
    exports.loadFromListing = loadFromListing;
    function initConfigurationEnvironment() {
        var conf = GUISTATE_C.getConfigurationConf();
        configurationToBricklyWorkspace(conf);
        if (isVisible()) {
            if ($(window).width() < 768) {
                x = $(window).width() / 50;
                y = 25;
            }
            else {
                x = $(window).width() / 5;
                y = 50;
            }
            var blocks = bricklyWorkspace.getTopBlocks(true);
            for (var i = 0; i < blocks.length; i++) {
                var coord = Blockly.getSvgXY_(blocks[i].svgGroup_, bricklyWorkspace);
                var coordBlock = blocks[i].getRelativeToSurfaceXY();
                blocks[i].moveBy(coordBlock.x - coord.x + x, coordBlock.y - coord.y + y);
            }
            seen = true;
        }
        else {
            seen = false;
            bricklyWorkspace.setVisible(false);
        }
        var dom = confVis ? confVis.getXml() : Blockly.Xml.workspaceToDom(bricklyWorkspace);
        var xml = Blockly.Xml.domToText(dom);
        GUISTATE_C.setConfigurationXML(xml);
    }
    exports.initConfigurationEnvironment = initConfigurationEnvironment;
    function showSaveAsModal() {
        var regexString = new RegExp('^(?!\\b' + GUISTATE_C.getConfigurationStandardName() + '\\b)([a-zA-Z_öäüÖÄÜß$€][a-zA-Z0-9_öäüÖÄÜß$€]*)$');
        $.validator.addMethod('regex', function (value, element, regexp) {
            value = value.trim();
            return value.match(regexp);
        }, 'No special Characters allowed here. Use only upper and lowercase letters (A through Z; a through z) and numbers.');
        UTIL.showSingleModal(function () {
            $('#singleModalInput').attr('type', 'text');
            $('#single-modal h3').text(Blockly.Msg['MENU_SAVE_AS']);
            $('#single-modal label').text(Blockly.Msg['POPUP_NAME']);
        }, saveAsToServer, function () { }, {
            rules: {
                singleModalInput: {
                    required: true,
                    regex: regexString,
                },
            },
            errorClass: 'form-invalid',
            errorPlacement: function (label, element) {
                label.insertAfter(element);
            },
            messages: {
                singleModalInput: {
                    required: jQuery.validator.format(Blockly.Msg['VALIDATION_FIELD_REQUIRED']),
                    regex: jQuery.validator.format(Blockly.Msg['MESSAGE_INVALID_CONF_NAME']),
                },
            },
        });
    }
    exports.showSaveAsModal = showSaveAsModal;
    /**
     * New configuration
     */
    function newConfiguration(opt_further) {
        var further = opt_further || false;
        if (further || GUISTATE_C.isConfigurationSaved()) {
            var result = {};
            result.name = GUISTATE_C.getRobotGroup().toUpperCase() + 'basis';
            result.lastChanged = '';
            GUISTATE_C.setConfiguration(result);
            initConfigurationEnvironment();
        }
        else {
            $('#show-message-confirm').oneWrap('shown.bs.modal', function (e) {
                $('#confirm').off();
                $('#confirm').onWrap('click', function (e) {
                    e.preventDefault();
                    newConfiguration(true);
                });
                $('#confirmCancel').off();
                $('#confirmCancel').onWrap('click', function (e) {
                    e.preventDefault();
                    $('.modal').modal('hide');
                });
            });
            if (GUISTATE_C.isUserLoggedIn()) {
                MSG.displayMessage('POPUP_BEFOREUNLOAD_LOGGEDIN', 'POPUP', '', true);
            }
            else {
                MSG.displayMessage('POPUP_BEFOREUNLOAD', 'POPUP', '', true);
            }
        }
    }
    exports.newConfiguration = newConfiguration;
    /**
     * Show configuration
     *
     * @param {load}
     *            load configuration
     * @param {data}
     *            data of server call
     */
    function showConfiguration(result) {
        if (result.rc == 'ok') {
            configurationToBricklyWorkspace(result.confXML);
            GUISTATE_C.setConfiguration(result);
            LOG.info('show configuration ' + GUISTATE_C.getConfigurationName());
        }
    }
    exports.showConfiguration = showConfiguration;
    function getBricklyWorkspace() {
        return bricklyWorkspace;
    }
    exports.getBricklyWorkspace = getBricklyWorkspace;
    function reloadConf(opt_result) {
        var conf;
        if (opt_result) {
            conf = opt_result.confXML;
        }
        else {
            conf = GUISTATE_C.getConfigurationXML();
        }
        if (!seen) {
            configurationToBricklyWorkspace(conf);
            var x, y;
            if ($(window).width() < 768) {
                x = $(window).width() / 50;
                y = 25;
            }
            else {
                x = $(window).width() / 5;
                y = 50;
            }
            var blocks = bricklyWorkspace.getTopBlocks(true);
            for (var i = 0; i < blocks.length; i++) {
                var coord = Blockly.getSvgXY_(blocks[i].svgGroup_, bricklyWorkspace);
                var coordBlock = blocks[i].getRelativeToSurfaceXY();
                blocks[i].moveBy(coordBlock.x - coord.x + x, coordBlock.y - coord.y + y);
            }
        }
        else {
            configurationToBricklyWorkspace(conf);
        }
    }
    exports.reloadConf = reloadConf;
    function reloadView() {
        if (isVisible()) {
            var dom = confVis ? confVis.getXml() : Blockly.Xml.workspaceToDom(bricklyWorkspace);
            var xml = Blockly.Xml.domToText(dom);
            configurationToBricklyWorkspace(xml);
        }
        else {
            seen = false;
        }
        var toolbox = GUISTATE_C.getConfigurationToolbox();
        bricklyWorkspace.updateToolbox(toolbox);
    }
    exports.reloadView = reloadView;
    function changeRobotSvg() {
        if (CV.CircuitVisualization.isRobotVisualized(GUISTATE_C.getRobotGroup() + '_' + GUISTATE_C.getRobot())) {
            bricklyWorkspace.setDevice({
                group: GUISTATE_C.getRobotGroup(),
                robot: GUISTATE_C.getRobot(),
            });
            confVis.resetRobot();
        }
    }
    exports.changeRobotSvg = changeRobotSvg;
    function resetView() {
        bricklyWorkspace.setDevice({
            group: GUISTATE_C.getRobotGroup(),
            robot: GUISTATE_C.getRobot(),
        });
        initConfigurationEnvironment();
        var toolbox = GUISTATE_C.getConfigurationToolbox();
        bricklyWorkspace.updateToolbox(toolbox);
    }
    exports.resetView = resetView;
    function isVisible() {
        return GUISTATE_C.getView() == 'tabConfiguration';
    }
    function resetConfVisIfAvailable() {
        if (confVis) {
            confVis.dispose();
            confVis = null;
        }
    }
    function configurationToBricklyWorkspace(xml) {
        // removing changelistener in blockly doesn't work, so no other way
        listenToBricklyEvents = false;
        Blockly.hideChaff();
        bricklyWorkspace.clear();
        Blockly.svgResize(bricklyWorkspace);
        var dom = Blockly.Xml.textToDom(xml, bricklyWorkspace);
        resetConfVisIfAvailable();
        if (CV.CircuitVisualization.isRobotVisualized(GUISTATE_C.getRobotGroup(), GUISTATE_C.getRobot())) {
            confVis = CV.CircuitVisualization.domToWorkspace(dom, bricklyWorkspace);
        }
        else {
            Blockly.Xml.domToWorkspace(dom, bricklyWorkspace);
        }
        bricklyWorkspace.setVersion(dom.getAttribute('xmlversion'));
        var name;
        var configName = GUISTATE_C.getConfigurationName() == undefined ? '' : GUISTATE_C.getConfigurationName();
        if (xml == GUISTATE_C.getConfigurationConf()) {
            name = GUISTATE_C.getRobotGroup().toUpperCase() + 'basis';
        }
        else {
            name = configName;
        }
        GUISTATE_C.setConfigurationName(name);
        GUISTATE_C.setConfigurationSaved(true);
        $('#tabConfigurationName').html(name);
        setTimeout(function () {
            listenToBricklyEvents = true;
        }, 500);
        if (isVisible()) {
            seen = true;
        }
        else {
            seen = false;
        }
        if (GUISTATE_C.isConfigurationUsed()) {
            bricklyWorkspace.setVisible(true);
        }
        else {
            bricklyWorkspace.setVisible(false);
        }
    }
    exports.configurationToBricklyWorkspace = configurationToBricklyWorkspace;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9yb2JlcnRhL2NvbnRyb2xsZXIvY29uZmlndXJhdGlvbi5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVdBLElBQUksZ0JBQWdCLENBQUM7SUFFckIsSUFBSSxnQkFBZ0IsQ0FBQztJQUNyQixJQUFJLE9BQU8sQ0FBQztJQUNaLElBQUkscUJBQXFCLEdBQUcsSUFBSSxDQUFDO0lBQ2pDLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQztJQUVqQixTQUFTLElBQUk7UUFDVCxRQUFRLEVBQUUsQ0FBQztRQUNYLFVBQVUsRUFBRSxDQUFDO1FBQ2Isc0JBQXNCLEVBQUUsQ0FBQztRQUN6Qiw0QkFBNEIsRUFBRSxDQUFDO0lBQ25DLENBQUM7SUFrYkcsb0JBQUk7SUFoYlI7Ozs7O09BS0c7SUFDSCxTQUFTLFFBQVE7UUFDYixJQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztRQUNuRCxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDckUsSUFBSSxFQUFFLFdBQVc7WUFDakIsT0FBTyxFQUFFLE9BQU87WUFDaEIsUUFBUSxFQUFFLElBQUk7WUFDZCxVQUFVLEVBQUUsSUFBSTtZQUNoQixLQUFLLEVBQUUsbUJBQW1CO1lBQzFCLElBQUksRUFBRTtnQkFDRixRQUFRLEVBQUUsSUFBSTtnQkFDZCxLQUFLLEVBQUUsS0FBSztnQkFDWixVQUFVLEVBQUUsR0FBRztnQkFDZixRQUFRLEVBQUUsQ0FBQztnQkFDWCxRQUFRLEVBQUUsSUFBSTtnQkFDZCxVQUFVLEVBQUUsR0FBRzthQUNsQjtZQUNELFdBQVcsRUFBRSxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUM7WUFDbEMsbUJB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