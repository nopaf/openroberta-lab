define(["require", "exports", "message", "util", "webots.simulation", "simulation.simulation", "simulation.constants", "guiState.controller", "tour.controller", "program.controller", "program.model", "blockly", "jquery", "jquery-validate"], function (require, exports, MSG, UTIL, NAOSIM, SIM, simulation_constants_1, GUISTATE_C, TOUR_C, PROG_C, PROGRAM, Blockly, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.init = void 0;
    var INITIAL_WIDTH = 0.5;
    var blocklyWorkspace;
    var debug = false;
    function init() {
        blocklyWorkspace = GUISTATE_C.getBlocklyWorkspace();
        initEvents();
    }
    exports.init = init;
    function initEvents() {
        $('#simButton').off('click touchend');
        $('#simButton').onWrap('click touchend', function (event) {
            debug = false;
            // Workaround for IOS speech synthesis, speech must be triggered once by a button click explicitly before it can be used programmatically
            if (window.speechSynthesis && GUISTATE_C.getRobot().indexOf('ev3') !== -1) {
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
            }
            toggleSim();
            return false;
        });
        $('#simDebugButton').off('click touchend');
        $('#simDebugButton').onWrap('click touchend', function (event) {
            debug = true;
            // Workaround for IOS speech synthesis, speech must be triggered once by a button click explicitly before it can be used programmatically
            if (window.speechSynthesis && GUISTATE_C.getRobot().indexOf('ev3') !== -1) {
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
            }
            toggleSim();
            return false;
        });
        $('#simRobotModal').removeClass('modal-backdrop');
        $('#simStop').onWrap('click', function (event) {
            $('#simStop').addClass('disabled');
            $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-play');
            SIM.stopProgram();
        }, 'sim stop clicked');
        $('#simControl').onWrap('click', function (event) {
            event.stopPropagation();
            if (SIM.getNumRobots() <= 1) {
                if (SIM.getDebugMode()) {
                    toggleSimEvent(simulation_constants_1.default.DEBUG_BREAKPOINT);
                }
                else {
                    if ($('#simControl').hasClass('typcn-media-play-outline')) {
                        Blockly.hideChaff();
                        var xmlProgram = Blockly.Xml.workspaceToDom(blocklyWorkspace);
                        var xmlTextProgram = Blockly.Xml.domToText(xmlProgram);
                        var isNamedConfig = !GUISTATE_C.isConfigurationStandard() && !GUISTATE_C.isConfigurationAnonymous();
                        var configName = isNamedConfig ? GUISTATE_C.getConfigurationName() : undefined;
                        var xmlConfigText = GUISTATE_C.isConfigurationAnonymous() ? GUISTATE_C.getConfigurationXML() : undefined;
                        var language = GUISTATE_C.getLanguage();
                        PROGRAM.runInSim(GUISTATE_C.getProgramName(), configName, xmlTextProgram, xmlConfigText, language, function (result) {
                            if (result.rc == 'ok') {
                                MSG.displayMessage('MESSAGE_EDIT_START', 'TOAST', GUISTATE_C.getProgramName());
                                if (SIM.getDebugMode()) {
                                    $('#simControl').addClass('typcn-media-play').removeClass('typcn-media-play-outline');
                                }
                                else {
                                    $('#simControl').addClass('typcn-media-stop').removeClass('typcn-media-play-outline');
                                    $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_STOP_TOOLTIP);
                                }
                                if (GUISTATE_C.hasWebotsSim()) {
                                    NAOSIM.run(result.javaScriptProgram);
                                }
                                else {
                                    setTimeout(function () {
                                        SIM.setPause(false);
                                    }, 500);
                                    SIM.init([result], false, GUISTATE_C.getRobotGroup());
                                }
                            }
                            else {
                                MSG.displayInformation(result, '', result.message, '');
                            }
                            PROG_C.reloadProgram(result);
                        });
                    }
                    else {
                        $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-stop');
                        $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_START_TOOLTIP);
                        if (GUISTATE_C.hasWebotsSim()) {
                            NAOSIM.stopProgram();
                        }
                        else {
                            SIM.stopProgram();
                        }
                    }
                }
            }
            else {
                if ($('#simControl').hasClass('typcn-media-play-outline')) {
                    MSG.displayMessage('MESSAGE_EDIT_START', 'TOAST', 'multiple simulation');
                    $('#simControl').addClass('typcn-media-stop').removeClass('typcn-media-play-outline');
                    $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_STOP_TOOLTIP);
                    SIM.run(false, GUISTATE_C.getRobotGroup());
                    setTimeout(function () {
                        SIM.setPause(false);
                    }, 500);
                }
                else {
                    $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-stop');
                    $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_START_TOOLTIP);
                    SIM.stopProgram();
                }
            }
        }, 'sim start clicked');
        $('#simImport').onWrap('click', function (event) {
            SIM.importImage();
        }, 'simImport clicked');
        $('#simRobotModal').removeClass('modal-backdrop');
        $('.simInfo').onWrap('click', function (event) {
            SIM.setInfo();
        }, 'sim info clicked');
        $('#simRobot').onWrap('click', function (event) {
            $('#simRobotModal').modal('toggle');
            var robot = GUISTATE_C.getRobot();
            var position = $('#simDiv').position();
            position.top += 12;
            if (robot == 'calliope' || robot == 'microbit') {
                position.left = $('#blocklyDiv').width() + 12;
                $('#simRobotModal').css({
                    top: position.top,
                    left: position.left,
                });
            }
            else {
                position.left += 48;
                $('#simRobotModal').css({
                    top: position.top,
                    left: position.left,
                });
            }
            $('#simRobotModal').draggable();
        }, 'sim show robot clicked');
        $('#simValues').onWrap('click', function (event) {
            $('#simValuesModal').modal('toggle');
            var position = $('#simDiv').position();
            position.top += 12;
            $('#simValuesModal').css({
                top: position.top,
                right: 12,
                left: 'initial',
                bottom: 'inherit',
            });
            $('#simValuesModal').draggable();
        }, 'sim show values clicked');
        $('#simResetPose').onWrap('click', function (event) {
            if (GUISTATE_C.hasWebotsSim()) {
                NAOSIM.resetPose();
                return;
            }
            SIM.resetPose();
        }, 'sim reset pose clicked');
        $('#simControlStepInto').onWrap('click', function (event) {
            toggleSimEvent(simulation_constants_1.default.DEBUG_STEP_INTO);
        }, 'sim step into clicked');
        $('#simControlStepOver').onWrap('click', function (event) {
            toggleSimEvent(simulation_constants_1.default.DEBUG_STEP_OVER);
        }, 'sim step over clicked');
        $('#simAddObstacleRectangle').onWrap('click', function (event) {
            SIM.addObstacle('rectangle');
            event.stopPropagation();
        }, 'sim add rectangle obstacle clicked');
        $('#simAddObstacleTriangle').onWrap('click', function (event) {
            SIM.addObstacle('triangle');
        }, 'sim add triangle obstacle clicked');
        $('#simAddObstacleCircle').onWrap('click', function (event) {
            SIM.addObstacle('circle');
            event.stopPropagation();
        }, 'sim add circle obstacle clicked');
        $('#simAddAreaRectangle').onWrap('click', function (event) {
            SIM.addColorArea('rectangle');
            event.stopPropagation();
        }, 'sim add rectangle area clicked');
        $('#simAddAreaTriangle').onWrap('click', function (event) {
            SIM.addColorArea('triangle');
            event.stopPropagation();
        }, 'sim add triangle area clicked');
        $('#simAddAreaCircle').onWrap('click', function (event) {
            SIM.addColorArea('circle');
            event.stopPropagation();
        }, 'sim add circle area clicked');
        $('#simChangeObjectColor').onWrap('click', function (event) {
            if (!$('#simChangeObjectColor').hasClass('disabled')) {
                SIM.toggleColorPicker();
            }
        }, 'sim edit object clicked');
        $('#simDeleteObject').onWrap('click', function (event) {
            if (!$('#simDeleteObject').hasClass('disabled')) {
                SIM.deleteSelectedObject();
            }
        }, 'sim delete object clicked');
        $('#simDownloadConfig').onWrap('click', function (event) {
            var filename = GUISTATE_C.getProgramName() + '-sim_configuration.json';
            UTIL.download(filename, JSON.stringify(SIM.exportConfigData()));
            MSG.displayMessage('MENU_MESSAGE_DOWNLOAD', 'TOAST', filename);
        }, 'sim download config clicked');
        $('#simUploadConfig').onWrap('click', function (event) {
            SIM.importConfigData();
        }, 'sim upload config clicked');
        $('#simScene').onWrap('click', function (event) {
            SIM.setBackground(-1, SIM.setBackground);
        }, 'sim toggle background clicked');
    }
    function initSimulation(result) {
        SIM.init([result], true, GUISTATE_C.getRobotGroup());
        $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-play');
        if (SIM.getNumRobots() === 1 && debug) {
            $('#simStop, #simControlStepOver, #simControlStepInto').show();
            $('#simControl').attr('data-original-title', Blockly.Msg.MENU_DEBUG_STEP_BREAKPOINT_TOOLTIP);
            $('#simControl').addClass('blue');
            SIM.updateDebugMode(true);
        }
        else {
            $('#simStop, #simControlStepOver, #simControlStepInto').hide();
            $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_START_TOOLTIP);
            $('#simControl').removeClass('blue');
            SIM.endDebugging();
        }
        if (TOUR_C.getInstance() && TOUR_C.getInstance().trigger) {
            TOUR_C.getInstance().trigger('startSim');
        }
        var name = debug ? 'simDebug' : 'sim';
        $('#blockly').openRightView('sim', INITIAL_WIDTH, name);
    }
    function initNaoSimulation(result) {
        NAOSIM.init(result.javaScriptProgram);
        $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-play');
        $('#simStop, #simControlStepOver, #simControlStepInto').hide();
        $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_START_TOOLTIP);
        $('#simControl').removeClass('blue');
        $('#blockly').openRightView('sim', INITIAL_WIDTH, 'sim');
    }
    function toggleSim() {
        if ($('.fromRight.rightActive').hasClass('shifting')) {
            return;
        }
        if (($('#simButton').hasClass('rightActive') && !debug) || ($('#simDebugButton').hasClass('rightActive') && debug)) {
            if (GUISTATE_C.hasWebotsSim()) {
                NAOSIM.disconnect();
            }
            else {
                SIM.cancel();
            }
            $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-play').removeClass('typcn-media-stop');
            $('#blockly').closeRightView(function () {
                $('.nav > li > ul > .robotType').removeClass('disabled');
                $('.' + GUISTATE_C.getRobot()).addClass('disabled');
            });
            $('#simStop, #simControlStepOver,#simControlStepInto').hide();
            SIM.endDebugging();
        }
        else {
            var xmlProgram = Blockly.Xml.workspaceToDom(blocklyWorkspace);
            var xmlTextProgram = Blockly.Xml.domToText(xmlProgram);
            var isNamedConfig = !GUISTATE_C.isConfigurationStandard() && !GUISTATE_C.isConfigurationAnonymous();
            var configName = isNamedConfig ? GUISTATE_C.getConfigurationName() : undefined;
            var xmlConfigText = GUISTATE_C.isConfigurationAnonymous() ? GUISTATE_C.getConfigurationXML() : undefined;
            var language = GUISTATE_C.getLanguage();
            PROGRAM.runInSim(GUISTATE_C.getProgramName(), configName, xmlTextProgram, xmlConfigText, language, function (result) {
                if (result.rc == 'ok') {
                    if (GUISTATE_C.hasWebotsSim()) {
                        initNaoSimulation(result);
                    }
                    else {
                        initSimulation(result);
                    }
                }
                else {
                    MSG.displayInformation(result, '', result.message, '');
                }
                PROG_C.reloadProgram(result);
            });
        }
    }
    function toggleSimEvent(event) {
        if ($('#simControl').hasClass('typcn-media-play-outline')) {
            var xmlProgram = Blockly.Xml.workspaceToDom(blocklyWorkspace);
            var xmlTextProgram = Blockly.Xml.domToText(xmlProgram);
            var isNamedConfig = !GUISTATE_C.isConfigurationStandard() && !GUISTATE_C.isConfigurationAnonymous();
            var configName = isNamedConfig ? GUISTATE_C.getConfigurationName() : undefined;
            var xmlConfigText = GUISTATE_C.isConfigurationAnonymous() ? GUISTATE_C.getConfigurationXML() : undefined;
            var language = GUISTATE_C.getLanguage();
            PROGRAM.runInSim(GUISTATE_C.getProgramName(), configName, xmlTextProgram, xmlConfigText, language, function (result) {
                if (result.rc == 'ok') {
                    setTimeout(function () {
                        SIM.setPause(false);
                        SIM.interpreterAddEvent(event);
                    }, 500);
                    SIM.init([result], false, GUISTATE_C.getRobotGroup());
                }
                $('#simControl').removeClass('typcn-media-play-outline').addClass('typcn-media-play');
                $('#simStop').removeClass('disabled');
            });
        }
        else if ($('#simControl').hasClass('typcn-media-play')) {
            SIM.setPause(false);
            SIM.interpreterAddEvent(event);
        }
        else {
            if ($('#simControl').hasClass('typcn-media-stop')) {
                $('#simControl').addClass('blue').removeClass('typcn-media-stop');
                $('#simControl').attr('data-original-title', Blockly.Msg.MENU_DEBUG_STEP_BREAKPOINT_TOOLTIP);
                $('#simStop').show();
            }
            $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-play');
            SIM.stopProgram();
        }
    }
    function callbackOnTermination() {
        GUISTATE_C.setConnectionState('wait');
        blocklyWorkspace.robControls.switchToStart();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ1NpbS5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9yb2JlcnRhL2NvbnRyb2xsZXIvcHJvZ1NpbS5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWVBLElBQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQztJQUMxQixJQUFJLGdCQUFnQixDQUFDO0lBQ3JCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztJQUVsQixTQUFTLElBQUk7UUFDVCxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUNwRCxVQUFVLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBQ1Esb0JBQUk7SUFFYixTQUFTLFVBQVU7UUFDZixDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDdEMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLEtBQUs7WUFDcEQsS0FBSyxHQUFHLEtBQUssQ0FBQztZQUNkLHlJQUF5STtZQUN6SSxJQUFJLE1BQU0sQ0FBQyxlQUFlLElBQUksVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtnQkFDdkUsTUFBTSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSx3QkFBd0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2FBQ2xFO1lBQ0QsU0FBUyxFQUFFLENBQUM7WUFDWixPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztRQUVILENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzNDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxVQUFVLEtB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