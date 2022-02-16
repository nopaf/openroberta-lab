define(["require", "exports", "message", "util", "guiState.controller", "program.model", "program.controller", "progRun.controller", "import.controller", "blockly", "codeflask", "jquery"], function (require, exports, MSG, UTIL, GUISTATE_C, PROGRAM, PROG_C, PROGRUN_C, IMPORT_C, Blockly, CodeFlask, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.clickSourceCodeEditor = exports.resetScroll = exports.setCodeLanguage = exports.init = void 0;
    var flask;
    var currentLanguage;
    var wasEditedByUser;
    function init() {
        flask = new CodeFlask('#flaskEditor', {
            language: 'java',
            lineNumbers: true,
            tabSize: 4,
        });
        initEvents();
    }
    exports.init = init;
    function clickSourceCodeEditor() {
        getSourceCode(true);
    }
    exports.clickSourceCodeEditor = clickSourceCodeEditor;
    function setCodeLanguage(language) {
        var langToSet;
        switch (language) {
            case 'py':
                langToSet = 'python';
                break;
            case 'java':
                langToSet = 'java';
                break;
            case 'ino':
            case 'nxc':
            case 'cpp':
                langToSet = 'clike';
                break;
            case 'json':
                langToSet = 'js';
                break;
            default:
                langToSet = 'js';
        }
        flask.updateLanguage(langToSet);
        currentLanguage = langToSet;
    }
    exports.setCodeLanguage = setCodeLanguage;
    function resetScroll() {
        $('.codeflask__pre').attr('transform', 'translate3d(0px, 0px, 0px)');
        $('.codeflask__lines').attr('transform', 'translate3d(0px, 0px, 0px)');
    }
    exports.resetScroll = resetScroll;
    function initEvents() {
        flask.onUpdate(function (code) {
            if ($('#sourceCodeEditorPane').hasClass('active')) {
                wasEditedByUser = true;
            }
        });
        $('#backSourceCodeEditor').onWrap('click', function () {
            if (wasEditedByUser) {
                $('#show-message-confirm').oneWrap('shown.bs.modal', function (e) {
                    $('#confirm').off();
                    $('#confirm').on('click', function (e) {
                        e.preventDefault();
                        wasEditedByUser = false;
                        $('#tabProgram').clickWrap();
                    });
                    $('#confirmCancel').off();
                    $('#confirmCancel').on('click', function (e) {
                        e.preventDefault();
                        $('.modal').modal('hide');
                    });
                });
                MSG.displayMessage('SOURCE_CODE_EDITOR_CLOSE_CONFIRMATION', 'POPUP', '', true, false);
            }
            else {
                wasEditedByUser = false;
                $('#tabProgram').clickWrap();
            }
            return false;
        }, 'back to previous view');
        $('#runSourceCodeEditor').onWrap('click', function () {
            PROGRUN_C.runNative(flask.getCode());
            return false;
        }, 'run button clicked');
        $('#buildSourceCodeEditor').onWrap('click', function () {
            GUISTATE_C.setRunEnabled(false);
            $('#buildSourceCodeEditor').addClass('disabled');
            PROGRAM.compileN(GUISTATE_C.getProgramName(), flask.getCode(), GUISTATE_C.getLanguage(), function (result) {
                if (result.rc == 'ok') {
                    MSG.displayMessage(result.message, 'POPUP', '', false, false);
                }
                else {
                    MSG.displayInformation(result, result.message, result.message, GUISTATE_C.getProgramName());
                }
                GUISTATE_C.setRunEnabled(true);
                $('#buildSourceCodeEditor').removeClass('disabled');
            });
            return false;
        }, 'build button clicked');
        $('#downloadSourceCodeEditor').onWrap('click', function () {
            var filename = GUISTATE_C.getProgramName() + '.' + GUISTATE_C.getSourceCodeFileExtension();
            UTIL.download(filename, flask.getCode());
            MSG.displayMessage('MENU_MESSAGE_DOWNLOAD', 'TOAST', filename);
            return false;
        }, 'download source code button clicked');
        $('#uploadSourceCodeEditor').onWrap('click', function () {
            IMPORT_C.importSourceCode(function (name, source) {
                flask.updateCode(source);
            });
            return false;
        }, 'upload source code button clicked');
        $('#importSourceCodeEditor').onWrap('click', function () {
            getSourceCode(false);
            return false;
        }, 'import from blockly button clicked');
        $('#tabSourceCodeEditor').onWrap('show.bs.tab', function () {
            if (currentLanguage === 'python' || currentLanguage === 'json') {
                $('#buildSourceCodeEditor').addClass('disabled');
            }
            $('#main-section').css('background-color', '#EEE');
        }, 'in show source code editor');
        $('#tabSourceCodeEditor').onWrap('shown.bs.tab', function () {
            GUISTATE_C.setView('tabSourceCodeEditor');
        }, 'after show source code editor');
        $('#tabSourceCodeEditor').on('hide.bs.tab', function () {
            $('#buildSourceCodeEditor').removeClass('disabled');
            $('#main-section').css('background-color', '#FFF');
        });
        $('#sourceCodeEditorPane')
            .find('button[name="rightMostButton"]')
            .attr('title', '')
            .attr('rel', 'tooltip')
            .attr('data-placement', 'left')
            .attr('lkey', 'Blockly.Msg.SOURCE_CODE_EDITOR_IMPORT_TOOLTIP')
            .attr('data-original-title', Blockly.Msg.SOURCE_CODE_EDITOR_IMPORT_TOOLTIP)
            .tooltip('fixTitle');
    }
    function getSourceCode(reload) {
        var blocklyWorkspace = GUISTATE_C.getBlocklyWorkspace();
        var dom = Blockly.Xml.workspaceToDom(blocklyWorkspace);
        var xmlProgram = Blockly.Xml.domToText(dom);
        var isNamedConfig = !GUISTATE_C.isConfigurationStandard() && !GUISTATE_C.isConfigurationAnonymous();
        var configName = isNamedConfig ? GUISTATE_C.getConfigurationName() : undefined;
        var xmlConfigText = GUISTATE_C.isConfigurationAnonymous() ? GUISTATE_C.getConfigurationXML() : undefined;
        var language = GUISTATE_C.getLanguage();
        PROGRAM.showSourceProgram(GUISTATE_C.getProgramName(), configName, xmlProgram, xmlConfigText, PROG_C.SSID, PROG_C.password, language, function (result) {
            PROG_C.reloadProgram(result);
            if (result.rc == 'ok') {
                if (reload) {
                    $('#tabSourceCodeEditor').clickWrap();
                }
                GUISTATE_C.setState(result);
                flask.updateCode(result.sourceCode);
            }
            else {
                MSG.displayInformation(result, result.message, result.message, result.parameters);
            }
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlQ29kZUVkaXRvci5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9yb2JlcnRhL2NvbnRyb2xsZXIvc291cmNlQ29kZUVkaXRvci5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQWdCQSxJQUFJLEtBQUssQ0FBQztJQUNWLElBQUksZUFBZSxDQUFDO0lBQ3BCLElBQUksZUFBZSxDQUFDO0lBRXBCLFNBQVMsSUFBSTtRQUNULEtBQUssR0FBRyxJQUFJLFNBQVMsQ0FBQyxjQUFjLEVBQUU7WUFDbEMsUUFBUSxFQUFFLE1BQU07WUFDaEIsV0FBVyxFQUFFLElBQUk7WUFDakIsT0FBTyxFQUFFLENBQUM7U0FDYixDQUFDLENBQUM7UUFDSCxVQUFVLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBa0NRLG9CQUFJO0lBaENiLFNBQVMscUJBQXFCO1FBQzFCLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBOEI0QyxzREFBcUI7SUE1QmxFLFNBQVMsZUFBZSxDQUFDLFFBQVE7UUFDN0IsSUFBSSxTQUFTLENBQUM7UUFDZCxRQUFRLFFBQVEsRUFBRTtZQUNkLEtBQUssSUFBSTtnQkFDTCxTQUFTLEdBQUcsUUFBUSxDQUFDO2dCQUNyQixNQUFNO1lBQ1YsS0FBSyxNQUFNO2dCQUNQLFNBQVMsR0FBRyxNQUFNLENBQUM7Z0JBQ25CLE1BQU07WUFDVixLQUFLLEtBQUssQ0FBQztZQUNYLEtBQUssS0FBSyxDQUFDO1lBQ1gsS0FBSyxLQUFLO2dCQUNOLFNBQVMsR0FBRyxPQUFPLENBQUM7Z0JBQ3BCLE1BQU07WUFDVixLQUFLLE1BQU07Z0JBQ1AsU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDakIsTUFBTTtZQUNWO2dCQUNJLFNBQVMsR0FBRyxJQUFJLENBQUM7U0FDeEI7UUFDRCxLQUFLLENBQUMsY0FBYyxDQUFDLFNBQVMs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