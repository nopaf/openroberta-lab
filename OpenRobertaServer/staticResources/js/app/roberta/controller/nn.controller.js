define(["require", "exports", "log", "util", "message", "guiState.controller", "neuralnetwork.playground", "jquery", "blockly", "jquery-validate"], function (require, exports, LOG, UTIL, MSG, GUISTATE_C, PG, $, Blockly) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resetView = exports.reloadView = exports.reloadNN = exports.getBricklyWorkspace = exports.showNN = exports.newNN = exports.showSaveAsModal = exports.initNNEnvironment = exports.loadFromListing = exports.saveAsToServer = exports.saveToServer = exports.initNNForms = exports.init = void 0;
    var $formSingleModal;
    var inputNeurons;
    var outputNeurons;
    function init() {
        initView();
        initEvents();
        initNNForms();
        initNNEnvironment();
    }
    exports.init = init;
    function initView() {
        PG.runPlayground();
    }
    function initEvents() {
        $('#tabNN').onWrap('show.bs.tab', function (e) {
            GUISTATE_C.setView('tabNN');
            extractInputOutputNeuronsFromNNstep();
        }, 'show tabNN');
        $('#tabNN').onWrap('shown.bs.tab', function (e) {
            $(window).trigger('resize');
        }, 'shown tabNN');
        $('#tabNN').onWrap('hide.bs.tab', function (e) { }, 'hide tabNN');
        $('#tabNN').onWrap('hidden.bs.tab', function (e) { }, 'hidden tabNN');
    }
    function initNNForms() {
        $formSingleModal = $('#single-modal-form');
    }
    exports.initNNForms = initNNForms;
    function extractInputOutputNeuronsFromNNstep() {
        inputNeurons = [];
        outputNeurons = [];
        var stepBlockFound = false;
        for (var block in Blockly.Workspace.getByContainer('blocklyDiv').getAllBlocks()) {
            if (block.type === 'robActions_NNstep') {
                if (stepBlockFound) {
                    LOG.error("more than one NNstep block makes no sense");
                }
                stepBlockFound = true;
                extractInputOutputNeurons(block.getChildren());
            }
        }
    }
    function extractInputOutputNeurons(neurons) {
        for (var block in neurons) {
            if (block.type === 'robActions_inputneuron') {
                inputNeurons.push(block.getFieldValue("NAME"));
            }
            else if (block.type === 'robActions_outputneuron') {
                outputNeurons.push(block.getFieldValue("NAME"));
            }
            else {
                LOG.error("in a NNstep block only input and output neurons are allowed");
            }
            var next = block.getChildren();
            if (next) {
                extractInputOutputNeurons(next);
            }
        }
    }
    /**
     * Save nn to server
     */
    function saveToServer() {
        $('.modal').modal('hide'); // close all opened popups
        if (GUISTATE_C.isNNStandard() || GUISTATE_C.isNNAnonymous()) {
            LOG.error('saveToServer may only be called with an explicit nnig name');
            return;
        }
        // TODO get the NN from the dom
        CONFIGURATION.saveNNToServer(GUISTATE_C.getNNName(), xmlText, function (result) {
            if (result.rc === 'ok') {
                GUISTATE_C.setNNSaved(true);
                LOG.info('save brick nn ' + GUISTATE_C.getNNName());
            }
            MSG.displayInformation(result, 'MESSAGE_EDIT_SAVE_CONFIGURATION', result.message, GUISTATE_C.getNNName());
        });
    }
    exports.saveToServer = saveToServer;
    /**
     * Save nn with new name to server
     */
    function saveAsToServer() {
        $formSingleModal.validate();
        if ($formSingleModal.valid()) {
            $('.modal').modal('hide'); // close all opened popups
            var nnName = $('#singleModalInput').val().trim();
            if (GUISTATE_C.getNNStandardName() === nnName) {
                LOG.error('saveAsToServer may NOT use the nnig standard name');
                return;
            }
            var dom = Blockly.Xml.workspaceToDom(bricklyWorkspace);
            var xmlText = Blockly.Xml.domToText(dom);
            CONFIGURATION.saveAsNNToServer(nnName, xmlText, function (result) {
                if (result.rc === 'ok') {
                    result.name = nnName;
                    GUISTATE_C.setNN(result);
                    GUISTATE_C.setProgramSaved(false);
                    LOG.info('save brick nn ' + GUISTATE_C.getNNName());
                }
                MSG.displayInformation(result, 'MESSAGE_EDIT_SAVE_CONFIGURATION_AS', result.message, GUISTATE_C.getNNName());
            });
        }
    }
    exports.saveAsToServer = saveAsToServer;
    /**
     * Load the nn that was selected in nns list
     */
    // TODO check if we want /need a listing
    function loadFromListing(nn) {
        LOG.info('loadFromList ' + nn[0]);
        CONFIGURATION.loadNNFromListing(nn[0], nn[1], function (result) {
            if (result.rc === 'ok') {
                result.name = nn[0];
                $('#tabNN').oneWrap('shown.bs.tab', function () {
                    showNN(result);
                });
                $('#tabNN').clickWrap();
            }
            MSG.displayInformation(result, '', result.message);
        });
    }
    exports.loadFromListing = loadFromListing;
    function initNNEnvironment() { }
    exports.initNNEnvironment = initNNEnvironment;
    function showSaveAsModal() {
        var regexString = new RegExp('^(?!\\b' + GUISTATE_C.getNNStandardName() + '\\b)([a-zA-Z_öäüÖÄÜß$€][a-zA-Z0-9_öäüÖÄÜß$€]*)$');
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
     * New nn
     */
    function newNN(opt_further) {
        var further = opt_further || false;
        if (further || GUISTATE_C.isNNSaved()) {
            var result = {};
            result.name = GUISTATE_C.getRobotGroup().toUpperCase() + 'basis';
            result.lastChanged = '';
            GUISTATE_C.setNN(result);
            initNNEnvironment();
        }
        else {
            $('#show-message-nnirm').oneWrap('shown.bs.modal', function (e) {
                $('#nnirm').off();
                $('#nnirm').on('click', function (e) {
                    e.preventDefault();
                    newNN(true);
                });
                $('#nnirmCancel').off();
                $('#nnirmCancel').on('click', function (e) {
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
    exports.newNN = newNN;
    /**
     * Show nn
     *
     * @param {load}
     *            load nn
     * @param {data}
     *            data of server call
     */
    function showNN(result) {
        if (result.rc == 'ok') {
            GUISTATE_C.setNN(result);
            LOG.info('show nn ' + GUISTATE_C.getNNName());
        }
    }
    exports.showNN = showNN;
    function getBricklyWorkspace() {
        return bricklyWorkspace;
    }
    exports.getBricklyWorkspace = getBricklyWorkspace;
    function reloadNN(opt_result) {
        var nn;
        if (opt_result) {
            nn = opt_result.nnXML;
        }
        else {
            nn = GUISTATE_C.getNNXML();
        }
        if (!seen) {
            nnToBricklyWorkspace(nn);
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
            nnToBricklyWorkspace(nn);
        }
    }
    exports.reloadNN = reloadNN;
    function reloadView() {
        if (isVisible()) {
            var dom = Blockly.Xml.workspaceToDom(bricklyWorkspace);
            var xml = Blockly.Xml.domToText(dom);
            nnToBricklyWorkspace(xml);
        }
        else {
            seen = false;
        }
        var toolbox = GUISTATE_C.getNNToolbox();
        bricklyWorkspace.updateToolbox(toolbox);
    }
    exports.reloadView = reloadView;
    function resetView() {
        bricklyWorkspace.setDevice({
            group: GUISTATE_C.getRobotGroup(),
            robot: GUISTATE_C.getRobot(),
        });
        initNNEnvironment();
        var toolbox = GUISTATE_C.getNNToolbox();
        bricklyWorkspace.updateToolbox(toolbox);
    }
    exports.resetView = resetView;
    function isVisible() {
        return GUISTATE_C.getView() == 'tabNN';
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm4uY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvcm9iZXJ0YS9jb250cm9sbGVyL25uLmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBWUEsSUFBSSxnQkFBZ0IsQ0FBQztJQUNyQixJQUFJLFlBQVksQ0FBQztJQUNqQixJQUFJLGFBQWEsQ0FBQztJQUVsQixTQUFTLElBQUk7UUFDVCxRQUFRLEVBQUUsQ0FBQztRQUNYLFVBQVUsRUFBRSxDQUFDO1FBQ2IsV0FBVyxFQUFFLENBQUM7UUFDZCxpQkFBaUIsRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUE4UUcsb0JBQUk7SUE1UVIsU0FBUyxRQUFRO1FBQ2IsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxTQUFTLFVBQVU7UUFDZixDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsTUFBTSxDQUNkLGFBQWEsRUFDYixVQUFVLENBQUM7WUFDUCxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzVCLG1DQUFtQyxFQUFFLENBQUE7UUFDekMsQ0FBQyxFQUNELFlBQVksQ0FDZixDQUFDO1FBRUYsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FDZCxjQUFjLEVBQ2QsVUFBVSxDQUFDO1lBQ1AsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQyxDQUFDLEVBQ0QsYUFBYSxDQUNoQixDQUFDO1FBRUYsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLElBQUcsQ0FBQyxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBRWpFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLFVBQVUsQ0FBQyxJQUFHLENBQUMsRUFBRSxjQUFj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