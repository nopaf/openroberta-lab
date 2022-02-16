define(["require", "exports", "message", "log", "util", "guiState.controller", "robot.controller", "program.model", "user.model", "configuration.controller", "progCode.controller", "blockly", "jquery", "jquery-validate"], function (require, exports, MSG, LOG, UTIL, GUISTATE_C, ROBOT_C, PROGRAM, USER, CONFIGURATION_C, PROGCODE_C, Blockly, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.programToBlocklyWorkspace = exports.loadExternalToolbox = exports.loadToolbox = exports.resetView = exports.reloadView = exports.reloadProgram = exports.getBlocklyWorkspace = exports.exportAllXml = exports.exportXml = exports.linkProgram = exports.newProgram = exports.initProgramEnvironment = exports.showSaveAsModal = exports.initProgramForms = exports.loadFromGallery = exports.saveToServer = exports.init = exports.password = exports.SSID = void 0;
    var $formSingleModal;
    var blocklyWorkspace;
    var listenToBlocklyEvents = true;
    var seen = true;
    exports.SSID = '';
    exports.password = '';
    /**
     * Inject Blockly with initial toolbox
     */
    function init() {
        initView();
        initProgramEnvironment();
        initEvents();
        initProgramForms();
    }
    exports.init = init;
    function initView() {
        var toolbox = GUISTATE_C.getProgramToolbox();
        blocklyWorkspace = Blockly.inject(document.getElementById('blocklyDiv'), {
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
            checkInTask: ['start', '_def', 'event'],
            variableDeclaration: true,
            robControls: true,
            theme: GUISTATE_C.getTheme(),
        });
        $(window).resize();
        blocklyWorkspace.setDevice({
            group: GUISTATE_C.getRobotGroup(),
            robot: GUISTATE_C.getRobot(),
        });
        GUISTATE_C.setBlocklyWorkspace(blocklyWorkspace);
        blocklyWorkspace.robControls.disable('saveProgram');
        blocklyWorkspace.robControls.refreshTooltips(GUISTATE_C.getRobotRealName());
        GUISTATE_C.checkSim();
        var toolbox = $('#blockly .blocklyToolboxDiv');
        toolbox.prepend('<ul class="nav nav-tabs levelTabs"><li class="active"><a class="typcn typcn-media-stop-outline" href="#beginner" data-toggle="tab">1</a></li><li class=""><a href="#expert" class="typcn typcn-star-outline" data-toggle="tab">2</a></li></ul>');
    }
    function initEvents() {
        $('#sliderDiv').draggable({
            axis: 'x',
            cursor: 'col-resize',
        });
        $('#tabProgram').onWrap('click', function (e) {
            e.preventDefault();
            if (GUISTATE_C.getView() === 'tabConfiguration' &&
                GUISTATE_C.isUserLoggedIn() &&
                !GUISTATE_C.isConfigurationSaved() &&
                !GUISTATE_C.isConfigurationAnonymous()) {
                $('#show-message-confirm').oneWrap('shown.bs.modal', function (e) {
                    $('#confirm').off();
                    $('#confirm').on('click', function (e) {
                        e.preventDefault();
                        // TODO, check if we want to give the user the opportunity to convert the named configuration into an anonymous one
                        GUISTATE_C.setConfigurationName('');
                        // or reset to last saved version:
                        //$('#tabConfiguration').trigger('reload');
                        $('#tabProgram').tabWrapShow();
                    });
                    $('#confirmCancel').off();
                    $('#confirmCancel').on('click', function (e) {
                        e.preventDefault();
                        $('.modal').modal('hide');
                    });
                });
                MSG.displayMessage('POPUP_CONFIGURATION_UNSAVED', 'POPUP', '', true);
                return false;
            }
            else {
                $('#tabProgram').tabWrapShow();
            }
        });
        $('#tabProgram').onWrap('show.bs.tab', function (e) {
            GUISTATE_C.setView('tabProgram');
        });
        $('#tabProgram').onWrap('shown.bs.tab', function (e) {
            blocklyWorkspace.markFocused();
            blocklyWorkspace.setVisible(true);
            if (!seen) {
                // TODO may need to be removed if program tab can receive changes while in background
                reloadView();
            }
            $(window).resize();
        });
        $('#tabProgram').onWrap('hide.bs.tab', function (e) {
            Blockly.hideChaff();
        });
        $('#tabProgram').onWrap('hidden.bs.tab', function (e) {
            blocklyWorkspace.setVisible(false);
        });
        // work around for touch devices
        $('.levelTabs').on('touchend', function (e) {
            var target = $(e.target).attr('href');
            $('.levelTabs a[href="' + target + '"]').tabWrapShow();
        });
        $('.levelTabs a[data-toggle="tab"]').onWrap('shown.bs.tab', function (e) {
            var target = $(e.target).attr('href').substring(1); // activated tab
            e.preventDefault();
            loadToolbox(target);
            e.stopPropagation();
            LOG.info('toolbox clicked, switched to ' + target);
        });
        bindControl();
        blocklyWorkspace.addChangeListener(function (event) {
            if (listenToBlocklyEvents && event.type != Blockly.Events.UI && GUISTATE_C.isProgramSaved()) {
                GUISTATE_C.setProgramSaved(false);
            }
            if (event.type === Blockly.Events.DELETE) {
                if (blocklyWorkspace.getAllBlocks().length === 0) {
                    newProgram(true);
                }
            }
            $('.selectedHelp').removeClass('selectedHelp');
            if (Blockly.selected && $('#blockly').hasClass('rightActive')) {
                var block = Blockly.selected.type;
                $('#' + block).addClass('selectedHelp');
                $('#helpContent').scrollTo('#' + block, 1000, {
                    offset: -10,
                });
            }
            return false;
        });
    }
    /**
     * Save program to server
     */
    function saveToServer() {
        $('.modal').modal('hide'); // close all opened popups
        var xmlProgram = Blockly.Xml.workspaceToDom(blocklyWorkspace);
        var xmlProgramText = Blockly.Xml.domToText(xmlProgram);
        var isNamedConfig = !GUISTATE_C.isConfigurationStandard() && !GUISTATE_C.isConfigurationAnonymous();
        var configName = isNamedConfig ? GUISTATE_C.getConfigurationName() : undefined;
        var xmlConfigText = GUISTATE_C.isConfigurationAnonymous() ? GUISTATE_C.getConfigurationXML() : undefined;
        PROGRAM.saveProgramToServer(GUISTATE_C.getProgramName(), GUISTATE_C.getProgramOwnerName(), xmlProgramText, configName, xmlConfigText, GUISTATE_C.getProgramTimestamp(), function (result) {
            if (result.rc === 'ok') {
                GUISTATE_C.setProgramTimestamp(result.lastChanged);
                GUISTATE_C.setProgramSaved(true);
                GUISTATE_C.setConfigurationSaved(true);
                LOG.info('save program ' + GUISTATE_C.getProgramName());
            }
            MSG.displayInformation(result, 'MESSAGE_EDIT_SAVE_PROGRAM', result.message, GUISTATE_C.getProgramName());
        });
    }
    exports.saveToServer = saveToServer;
    /**
     * Save program with new name to server
     */
    function saveAsProgramToServer() {
        $formSingleModal.validate();
        if ($formSingleModal.valid()) {
            $('.modal').modal('hide'); // close all opened popups
            var progName = $('#singleModalInput').val().trim();
            var xmlProgram = Blockly.Xml.workspaceToDom(blocklyWorkspace);
            var xmlProgramText = Blockly.Xml.domToText(xmlProgram);
            var isNamedConfig = !GUISTATE_C.isConfigurationStandard() && !GUISTATE_C.isConfigurationAnonymous();
            var configName = isNamedConfig ? GUISTATE_C.getConfigurationName() : undefined;
            var xmlConfigText = GUISTATE_C.isConfigurationAnonymous() ? GUISTATE_C.getConfigurationXML() : undefined;
            var userAccountName = GUISTATE_C.getUserAccountName();
            LOG.info('saveAs program ' + GUISTATE_C.getProgramName());
            PROGRAM.saveAsProgramToServer(progName, userAccountName, xmlProgramText, configName, xmlConfigText, GUISTATE_C.getProgramTimestamp(), function (result) {
                if (result.rc === 'ok') {
                    LOG.info('saved program ' + GUISTATE_C.getProgramName() + ' as ' + progName);
                    result.name = progName;
                    result.programShared = false;
                    GUISTATE_C.setProgram(result, userAccountName, userAccountName);
                    MSG.displayInformation(result, 'MESSAGE_EDIT_SAVE_PROGRAM_AS', result.message, GUISTATE_C.getProgramName());
                }
                else {
                    if (result.cause === 'ORA_PROGRAM_SAVE_AS_ERROR_PROGRAM_EXISTS') {
                        //show replace option
                        //get last changed of program to overwrite
                        var lastChanged = result.lastChanged;
                        var modalMessage = Blockly.Msg.POPUP_BACKGROUND_REPLACE || 'A program with the same name already exists! <br> Would you like to replace it?';
                        $('#show-message-confirm').oneWrap('shown.bs.modal', function (e) {
                            $('#confirm').off();
                            $('#confirm').onWrap('click', function (e) {
                                e.preventDefault();
                                PROGRAM.saveProgramToServer(progName, userAccountName, xmlProgramText, configName, xmlConfigText, lastChanged, function (result) {
                                    if (result.rc === 'ok') {
                                        LOG.info('saved program ' + GUISTATE_C.getProgramName() + ' as ' + progName + ' and overwrote old content');
                                        result.name = progName;
                                        GUISTATE_C.setProgram(result, userAccountName, userAccountName);
                                        MSG.displayInformation(result, 'MESSAGE_EDIT_SAVE_PROGRAM_AS', result.message, GUISTATE_C.getProgramName());
                                    }
                                    else {
                                        LOG.info('failed to overwrite ' + progName);
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
                        MSG.displayPopupMessage('ORA_PROGRAM_SAVE_AS_ERROR_PROGRAM_EXISTS', modalMessage, Blockly.Msg.POPUP_REPLACE, Blockly.Msg.POPUP_CANCEL);
                    }
                }
            });
        }
    }
    /**
     * Load the program that was selected in gallery list
     */
    function loadFromGallery(program) {
        var programName = program[1];
        var user = program[3];
        var robotGroup = program[0];
        var robotType;
        if (robotGroup === GUISTATE_C.getRobotGroup()) {
            robotType = GUISTATE_C.getRobot();
        }
        else {
            robotType = GUISTATE_C.findRobot(robotGroup);
        }
        var owner = 'Gallery';
        function loadProgramFromGallery() {
            PROGRAM.loadProgramFromListing(programName, owner, user, function (result) {
                if (result.rc === 'ok') {
                    result.programShared = 'READ';
                    result.name = programName;
                    GUISTATE_C.setProgram(result, owner, user);
                    GUISTATE_C.setProgramXML(result.progXML);
                    //                    GUISTATE_C.setConfigurationName('');
                    //                    GUISTATE_C.setConfigurationXML(result.confXML);
                    if (result.configName === undefined) {
                        if (result.confXML === undefined) {
                            GUISTATE_C.setConfigurationNameDefault();
                            GUISTATE_C.setConfigurationXML(GUISTATE_C.getConfigurationConf());
                        }
                        else {
                            GUISTATE_C.setConfigurationName('');
                            GUISTATE_C.setConfigurationXML(result.confXML);
                        }
                    }
                    else {
                        GUISTATE_C.setConfigurationName(result.configName);
                        GUISTATE_C.setConfigurationXML(result.confXML);
                    }
                    $('#tabProgram').oneWrap('shown.bs.tab', function (e) {
                        CONFIGURATION_C.reloadConf();
                        reloadProgram();
                    });
                    $('#tabProgram').clickWrap();
                }
                MSG.displayInformation(result, '', result.message);
            });
        }
        ROBOT_C.switchRobot(robotType, null, loadProgramFromGallery);
    }
    exports.loadFromGallery = loadFromGallery;
    function initProgramForms() {
        $formSingleModal = $('#single-modal-form');
        $('#buttonCancelFirmwareUpdateAndRun').onWrap('click', function () {
            start();
        }, 'cancel firmware update and run');
    }
    exports.initProgramForms = initProgramForms;
    function showSaveAsModal() {
        $.validator.addMethod('regex', function (value, element, regexp) {
            value = value.trim();
            return value.match(regexp);
        }, 'No special Characters allowed here. Use only upper and lowercase letters (A through Z; a through z) and numbers.');
        UTIL.showSingleModal(function () {
            $('#singleModalInput').attr('type', 'text');
            $('#single-modal h3').text(Blockly.Msg['MENU_SAVE_AS']);
            $('#single-modal label').text(Blockly.Msg['POPUP_NAME']);
        }, saveAsProgramToServer, function () { }, {
            rules: {
                singleModalInput: {
                    required: true,
                    regex: /^[a-zA-Z_öäüÖÄÜß$€][a-zA-Z0-9_öäüÖÄÜß$€]{0,254}$/,
                },
            },
            errorClass: 'form-invalid',
            errorPlacement: function (label, element) {
                label.insertAfter(element);
            },
            messages: {
                singleModalInput: {
                    required: Blockly.Msg['VALIDATION_FIELD_REQUIRED'],
                    regex: Blockly.Msg['MESSAGE_INVALID_NAME'],
                },
            },
        });
    }
    exports.showSaveAsModal = showSaveAsModal;
    function initProgramEnvironment() {
        var x, y;
        if ($(window).width() < 768) {
            x = $(window).width() / 50;
            y = 25;
        }
        else {
            x = $(window).width() / 5;
            y = 50;
        }
        var program = GUISTATE_C.getProgramProg();
        programToBlocklyWorkspace(program);
        var blocks = blocklyWorkspace.getTopBlocks(true);
        if (blocks[0]) {
            var coord = blocks[0].getRelativeToSurfaceXY();
            blocks[0].moveBy(x - coord.x, y - coord.y);
        }
    }
    exports.initProgramEnvironment = initProgramEnvironment;
    /**
     * New program
     */
    function newProgram(opt_further) {
        var further = opt_further || false;
        function loadNewProgram() {
            var result = {};
            result.rc = 'ok';
            result.name = 'NEPOprog';
            result.programShared = false;
            result.lastChanged = '';
            GUISTATE_C.setProgram(result);
            initProgramEnvironment();
            LOG.info('ProgramNew');
        }
        if (further || GUISTATE_C.isProgramSaved()) {
            loadNewProgram();
        }
        else {
            confirmLoadProgram();
        }
    }
    exports.newProgram = newProgram;
    function confirmLoadProgram() {
        $('#show-message-confirm').oneWrap('shown.bs.modal', function (e) {
            $('#confirm').off();
            $('#confirm').on('click', function (e) {
                e.preventDefault();
                newProgram(true);
            });
            $('#confirmCancel').off();
            $('#confirmCancel').on('click', function (e) {
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
    function linkProgram() {
        var dom = Blockly.Xml.workspaceToDom(blocklyWorkspace);
        var xml = Blockly.Xml.domToText(dom);
        //TODO this should be removed after the next release
        xml = '<export xmlns="http://de.fhg.iais.roberta.blockly"><program>' + xml + '</program><config>' + GUISTATE_C.getConfigurationXML() + '</config></export>';
        var link = 'https://lab.open-roberta.org/#loadProgram';
        link += '&&' + GUISTATE_C.getRobot();
        link += '&&' + GUISTATE_C.getProgramName();
        link += '&&' + xml;
        link = encodeURI(link);
        var $temp = $('<input>');
        $('body').append($temp);
        $temp.val(link).select();
        document.execCommand('copy');
        $temp.remove();
        var displayLink = '</br><textarea readonly style="width:100%;" type="text">' + link + '</textarea>';
        LOG.info('ProgramLinkShare');
        MSG.displayMessage('POPUP_GET_LINK', 'POPUP', displayLink);
    }
    exports.linkProgram = linkProgram;
    /**
     * Create a file from the blocks and download it.
     */
    function exportXml() {
        var dom = Blockly.Xml.workspaceToDom(blocklyWorkspace);
        var xml = '<export xmlns="http://de.fhg.iais.roberta.blockly"><program>' +
            Blockly.Xml.domToText(dom) +
            '</program><config>' +
            GUISTATE_C.getConfigurationXML() +
            '</config></export>';
        LOG.info('ProgramExport');
        UTIL.download(GUISTATE_C.getProgramName() + '.xml', xml);
        MSG.displayMessage('MENU_MESSAGE_DOWNLOAD', 'TOAST', GUISTATE_C.getProgramName());
    }
    exports.exportXml = exportXml;
    /**
     * Download all programs by the current User
     */
    function exportAllXml() {
        USER.userLoggedInCheck(function (result) {
            if (result.rc === 'ok') {
                PROGRAM.exportAllProgramsXml();
            }
            else {
                MSG.displayMessage(result.cause, 'TOAST', 'Log in check failed for Export');
            }
        });
    }
    exports.exportAllXml = exportAllXml;
    function getBlocklyWorkspace() {
        return blocklyWorkspace;
    }
    exports.getBlocklyWorkspace = getBlocklyWorkspace;
    function bindControl() {
        Blockly.bindEvent_(blocklyWorkspace.robControls.saveProgram, 'mousedown', null, function (e) {
            LOG.info('saveProgram from blockly button');
            saveToServer();
            return false;
        });
        blocklyWorkspace.robControls.disable('saveProgram');
    }
    function reloadProgram(opt_result, opt_fromShowSource) {
        var program;
        if (opt_result) {
            program = opt_result.progXML;
            if (!$.isEmptyObject(opt_result.confAnnos)) {
                GUISTATE_C.confAnnos = opt_result.confAnnos;
                UTIL.alertTab('tabConfiguration');
            }
        }
        else {
            program = GUISTATE_C.getProgramXML();
        }
        programToBlocklyWorkspace(program, opt_fromShowSource);
    }
    exports.reloadProgram = reloadProgram;
    function reloadView() {
        if (isVisible()) {
            var dom = Blockly.Xml.workspaceToDom(blocklyWorkspace);
            var xml = Blockly.Xml.domToText(dom);
            programToBlocklyWorkspace(xml);
            var toolbox = GUISTATE_C.getProgramToolbox();
            blocklyWorkspace.updateToolbox(toolbox);
            seen = true;
        }
        else {
            seen = false;
        }
    }
    exports.reloadView = reloadView;
    function resetView() {
        blocklyWorkspace.setDevice({
            group: GUISTATE_C.getRobotGroup(),
            robot: GUISTATE_C.getRobot(),
        });
        initProgramEnvironment();
        var toolbox = GUISTATE_C.getProgramToolbox();
        blocklyWorkspace.updateToolbox(toolbox);
    }
    exports.resetView = resetView;
    function loadToolbox(level) {
        Blockly.hideChaff();
        GUISTATE_C.setProgramToolboxLevel(level);
        var xml = GUISTATE_C.getToolbox(level);
        if (xml) {
            blocklyWorkspace.updateToolbox(xml);
        }
        if (level === 'beginner') {
            $('.help.expert').hide();
        }
        else {
            $('.help.expert').show();
        }
    }
    exports.loadToolbox = loadToolbox;
    function loadExternalToolbox(toolbox) {
        Blockly.hideChaff();
        if (toolbox) {
            blocklyWorkspace.updateToolbox(toolbox);
        }
    }
    exports.loadExternalToolbox = loadExternalToolbox;
    function isVisible() {
        return GUISTATE_C.getView() == 'tabProgram';
    }
    function programToBlocklyWorkspace(xml, opt_fromShowSource) {
        if (!xml) {
            return;
        }
        listenToBlocklyEvents = false;
        Blockly.hideChaff();
        blocklyWorkspace.clear();
        var dom = Blockly.Xml.textToDom(xml, blocklyWorkspace);
        Blockly.Xml.domToWorkspace(dom, blocklyWorkspace);
        blocklyWorkspace.setVersion(dom.getAttribute('xmlversion'));
        $('#infoContent').html(blocklyWorkspace.description);
        if (typeof blocklyWorkspace.description === 'string' && blocklyWorkspace.description.length) {
            $('#infoButton').addClass('notEmpty');
        }
        else {
            $('#infoButton').removeClass('notEmpty');
        }
        var tmpTags = blocklyWorkspace.tags;
        $('#infoTags').tagsinput('removeAll');
        $('.bootstrap-tagsinput input').attr('placeholder', 'Tags');
        $('#infoTags').tagsinput('add', tmpTags);
        var xmlConfiguration = GUISTATE_C.getConfigurationXML();
        var dom = Blockly.Xml.workspaceToDom(blocklyWorkspace);
        var xmlProgram = Blockly.Xml.domToText(dom);
        var isNamedConfig = !GUISTATE_C.isConfigurationStandard() && !GUISTATE_C.isConfigurationAnonymous();
        var configName = isNamedConfig ? GUISTATE_C.getConfigurationName() : undefined;
        var xmlConfigText = GUISTATE_C.isConfigurationAnonymous() ? GUISTATE_C.getConfigurationXML() : undefined;
        var language = GUISTATE_C.getLanguage();
        if ($('#codeDiv').hasClass('rightActive') && !opt_fromShowSource) {
            PROGRAM.showSourceProgram(GUISTATE_C.getProgramName(), configName, xmlProgram, xmlConfigText, language, function (result) {
                PROGCODE_C.setCode(result.sourceCode);
            });
        }
        setTimeout(function () {
            listenToBlocklyEvents = true;
        }, 500);
    }
    exports.programToBlocklyWorkspace = programToBlocklyWorkspace;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3JhbS5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9yb2JlcnRhL2NvbnRyb2xsZXIvcHJvZ3JhbS5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWNBLElBQUksZ0JBQWdCLENBQUM7SUFFckIsSUFBSSxnQkFBZ0IsQ0FBQztJQUNyQixJQUFJLHFCQUFxQixHQUFHLElBQUksQ0FBQztJQUNqQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUM7SUFFSCxRQUFBLElBQUksR0FBRyxFQUFFLENBQUM7SUFDVixRQUFBLFFBQVEsR0FBRyxFQUFFLENBQUM7SUFFM0I7O09BRUc7SUFDSCxTQUFTLElBQUk7UUFDVCxRQUFRLEVBQUUsQ0FBQztRQUNYLHNCQUFzQixFQUFFLENBQUM7UUFDekIsVUFBVSxFQUFFLENBQUM7UUFDYixnQkFBZ0IsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFtakJHLG9CQUFJO0lBampCUixTQUFTLFFBQVE7UUFDYixJQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztRQUM3QyxnQkFBZ0IsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLEVBQUU7WUFDckUsSUFBSSxFQUFFLFdBQVc7WUFDakIsT0FBTyxFQUFFLE9BQU87WUFDaEIsUUFBUSxFQUFFLElBQUk7WUFDZCxVQUFVLEVBQUUsSUFBSTtZQUNoQixLQUFLLEVBQUUsbUJBQW1CO1lBQzFCLElBQUksRUFBRTtnQkFDRixRQUFRLEVBQUUsSUFBSTtnQkFDZCxLQUFLLEVBQUUsS0FBSztnQkFDWixVQUFVLEVBQUUsR0FBRztnQkFDZixRQUFRLEVBQUUsQ0FBQztnQkFDWCxRQUFRLEVBQUUsSUFBSTtnQkFDZCxVQUFVLEVBQUUsR0FBRzthQUNsQjtZQUNELFdBQVcsRUFBRSxDQUFDLE9B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