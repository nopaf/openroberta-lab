define(["require", "exports", "message", "util", "guiState.controller", "program.controller", "program.model", "blockly", "codeflask", "jquery"], function (require, exports, MSG, UTIL, GUISTATE_C, PROG_C, PROGRAM, Blockly, CodeFlask, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setCodeLanguage = exports.setCode = exports.init = void 0;
    var INITIAL_WIDTH = 0.5;
    var blocklyWorkspace;
    var flask;
    /**
     *
     */
    function init() {
        blocklyWorkspace = GUISTATE_C.getBlocklyWorkspace();
        flask = new CodeFlask('#codeContent', {
            language: 'java',
            lineNumbers: true,
            readonly: true,
        });
        initEvents();
    }
    exports.init = init;
    function setCode(sourceCode) {
        flask.updateCode(sourceCode);
    }
    exports.setCode = setCode;
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
    }
    exports.setCodeLanguage = setCodeLanguage;
    function initEvents() {
        $('#codeButton').off('click touchend');
        $('#codeButton').onWrap('click touchend', function (event) {
            toggleCode();
            return false;
        });
        $('#codeDownload').onWrap('click', function (event) {
            var filename = GUISTATE_C.getProgramName() + '.' + GUISTATE_C.getSourceCodeFileExtension();
            UTIL.download(filename, GUISTATE_C.getProgramSource());
            MSG.displayMessage('MENU_MESSAGE_DOWNLOAD', 'TOAST', filename);
        }, 'codeDownload clicked');
        $('#codeRefresh').onWrap('click', function (event) {
            event.stopPropagation();
            var dom = Blockly.Xml.workspaceToDom(blocklyWorkspace);
            var xmlProgram = Blockly.Xml.domToText(dom);
            var xmlConfiguration = GUISTATE_C.getConfigurationXML();
            var isNamedConfig = !GUISTATE_C.isConfigurationStandard() && !GUISTATE_C.isConfigurationAnonymous();
            var configName = isNamedConfig ? GUISTATE_C.getConfigurationName() : undefined;
            var xmlConfigText = GUISTATE_C.isConfigurationAnonymous() ? GUISTATE_C.getConfigurationXML() : undefined;
            var language = GUISTATE_C.getLanguage();
            PROGRAM.showSourceProgram(GUISTATE_C.getProgramName(), configName, xmlProgram, xmlConfigText, PROG_C.SSID, PROG_C.password, language, function (result) {
                PROG_C.reloadProgram(result, true);
                if (result.rc == 'ok') {
                    GUISTATE_C.setState(result);
                    flask.updateCode(result.sourceCode);
                    GUISTATE_C.setProgramSource(result.sourceCode);
                }
                else {
                    MSG.displayInformation(result, result.message, result.message, result.parameters);
                }
            });
        }, 'code refresh clicked');
    }
    function toggleCode() {
        Blockly.hideChaff();
        if ($('#codeButton').hasClass('rightActive')) {
            $('#blockly').closeRightView();
        }
        else {
            var dom = Blockly.Xml.workspaceToDom(blocklyWorkspace);
            var xmlProgram = Blockly.Xml.domToText(dom);
            var isNamedConfig = !GUISTATE_C.isConfigurationStandard() && !GUISTATE_C.isConfigurationAnonymous();
            var configName = isNamedConfig ? GUISTATE_C.getConfigurationName() : undefined;
            var xmlConfigText = GUISTATE_C.isConfigurationAnonymous() ? GUISTATE_C.getConfigurationXML() : undefined;
            var language = GUISTATE_C.getLanguage();
            PROGRAM.showSourceProgram(GUISTATE_C.getProgramName(), configName, xmlProgram, xmlConfigText, PROG_C.SSID, PROG_C.password, language, function (result) {
                PROG_C.reloadProgram(result);
                if (result.rc == 'ok') {
                    GUISTATE_C.setState(result);
                    flask.updateCode(result.sourceCode);
                    // TODO change javaSource to source on server
                    GUISTATE_C.setProgramSource(result.sourceCode);
                    $('#blockly').openRightView('code', INITIAL_WIDTH);
                }
                else {
                    MSG.displayInformation(result, result.message, result.message, result.parameters);
                }
            });
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ0NvZGUuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvcm9iZXJ0YS9jb250cm9sbGVyL3Byb2dDb2RlLmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBVUEsSUFBTSxhQUFhLEdBQUcsR0FBRyxDQUFDO0lBQzFCLElBQUksZ0JBQWdCLENBQUM7SUFDckIsSUFBSSxLQUFLLENBQUM7SUFDVjs7T0FFRztJQUNILFNBQVMsSUFBSTtRQUNULGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQ3BELEtBQUssR0FBRyxJQUFJLFNBQVMsQ0FBQyxjQUFjLEVBQUU7WUFDbEMsUUFBUSxFQUFFLE1BQU07WUFDaEIsV0FBVyxFQUFFLElBQUk7WUFDakIsUUFBUSxFQUFFLElBQUk7U0FDakIsQ0FBQyxDQUFDO1FBQ0gsVUFBVSxFQUFFLENBQUM7SUFDakIsQ0FBQztJQTRCUSxvQkFBSTtJQTFCYixTQUFTLE9BQU8sQ0FBQyxVQUFVO1FBQ3ZCLEtBQUssQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQXdCYywwQkFBTztJQXRCdEIsU0FBUyxlQUFlLENBQUMsUUFBUTtRQUM3QixJQUFJLFNBQVMsQ0FBQztRQUNkLFFBQVEsUUFBUSxFQUFFO1lBQ2QsS0FBSyxJQUFJO2dCQUNMLFNBQVMsR0FBRyxRQUFRLENBQUM7Z0JBQ3JCLE1BQU07WUFDVixLQUFLLE1BQU07Z0JBQ1AsU0FBUyxHQUFHLE1BQU0sQ0FBQztnQkFDbkIsTUFBTTtZQUNWLEtBQUssS0FBSyxDQUFDO1lBQ1gsS0FBSyxLQUFLLENBQUM7WUFDWCxLQUFLLEtBQUs7Z0JBQ04sU0FBUyxHQUFHLE9BQU8sQ0FBQztnQkFDcEIsTUFBTTtZQUNWLEtBQUssTUFBTTtnQkFDUCxTQUFTLEdBQUcsSUFBSSxDQUFDO2dCQUNqQixNQUFN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