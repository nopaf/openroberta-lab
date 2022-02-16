define(["require", "exports", "message", "log", "util", "guiState.controller", "program.controller", "configuration.controller", "program.model", "robot.controller", "blockly", "jquery", "jquery-validate"], function (require, exports, MSG, LOG, UTIL, GUISTATE_C, PROGRAM_C, CONFIGURATION_C, PROGRAM, ROBOT_C, Blockly, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.importNepoCodeToCompile = exports.importSourceCodeToCompile = exports.loadProgramFromXML = exports.openProgramFromXML = exports.importSourceCode = exports.importXml = exports.init = void 0;
    function init(callback) {
        $('#fileSelector').val(null);
        $('#fileSelector').off();
        $('#fileSelector').onWrap('change', function (event) {
            var file = event.target.files[0];
            var reader = new FileReader();
            reader.onload = function (event) {
                var name = UTIL.getBasename(file.name);
                if ($.isFunction(callback)) {
                    callback(name, event.target.result);
                }
            };
            reader.readAsText(file);
            return false;
        }, 'import clicked');
    }
    exports.init = init;
    function importXml() {
        init(loadProgramFromXML);
        $('#fileSelector').attr('accept', '.xml');
        $('#fileSelector').clickWrap(); // opening dialog
    }
    exports.importXml = importXml;
    function importSourceCode(callback) {
        init(callback);
        $('#fileSelector').attr('accept', '.' + GUISTATE_C.getSourceCodeFileExtension());
        $('#fileSelector').clickWrap(); // opening dialog
    }
    exports.importSourceCode = importSourceCode;
    function openProgramFromXML(target) {
        var robotType = target[1];
        var programName = target[2];
        var programXml = target[3];
        ROBOT_C.switchRobot(robotType, true, function () {
            loadProgramFromXML(programName, programXml);
        });
    }
    exports.openProgramFromXML = openProgramFromXML;
    function loadProgramFromXML(name, xml) {
        if (xml.search('<export') === -1) {
            xml =
                '<export xmlns="http://de.fhg.iais.roberta.blockly"><program>' +
                    xml +
                    '</program><config>' +
                    GUISTATE_C.getConfigurationXML() +
                    '</config></export>';
        }
        PROGRAM.loadProgramFromXML(name, xml, function (result) {
            if (result.rc == 'ok') {
                // save the old program and configuration that it can be restored
                var dom = Blockly.Xml.workspaceToDom(GUISTATE_C.getBlocklyWorkspace());
                var xmlProgOld = Blockly.Xml.domToText(dom);
                GUISTATE_C.setProgramXML(xmlProgOld);
                dom = Blockly.Xml.workspaceToDom(GUISTATE_C.getBricklyWorkspace());
                var xmlConfOld = Blockly.Xml.domToText(dom);
                GUISTATE_C.setConfigurationXML(xmlConfOld);
                // on server side we only test case insensitive block names, displaying xml can still fail:
                result.programSaved = false;
                result.name = 'NEPOprog';
                result.programShared = false;
                result.programTimestamp = '';
                var nameConfOld = GUISTATE_C.getConfigurationName();
                try {
                    CONFIGURATION_C.configurationToBricklyWorkspace(result.confXML);
                    GUISTATE_C.setConfigurationXML(result.confXML);
                    PROGRAM_C.programToBlocklyWorkspace(result.progXML);
                    GUISTATE_C.setProgram(result);
                    GUISTATE_C.setProgramXML(result.progXML);
                    GUISTATE_C.setConfigurationName('');
                    LOG.info('show program ' + GUISTATE_C.getProgramName());
                }
                catch (e) {
                    // restore old Program
                    LOG.error(e.message);
                    GUISTATE_C.setProgramXML(xmlProgOld);
                    GUISTATE_C.setConfigurationXML(xmlConfOld);
                    GUISTATE_C.setConfigurationName(nameConfOld);
                    CONFIGURATION_C.reloadConf();
                    PROGRAM_C.reloadProgram();
                    result.rc = 'error';
                    MSG.displayInformation(result, '', Blockly.Msg.ORA_PROGRAM_IMPORT_ERROR, name);
                }
            }
            else {
                if (result.message === 'ORA_PROGRAM_IMPORT_ERROR_WRONG_ROBOT_TYPE') {
                    MSG.displayInformation(result, '', result.message, result.robotTypes);
                }
                else {
                    MSG.displayInformation(result, '', result.message, name);
                }
            }
        });
    }
    exports.loadProgramFromXML = loadProgramFromXML;
    /**
     * Open a file select dialog to load source code from local disk and send it
     * to the cross compiler
     */
    function importSourceCodeToCompile() {
        init(compileFromSource);
        $('#fileSelector').attr('accept', '.' + GUISTATE_C.getSourceCodeFileExtension());
        $('#fileSelector').clickWrap(); // opening dialog
    }
    exports.importSourceCodeToCompile = importSourceCodeToCompile;
    function compileFromSource(name, source) {
        PROGRAM.compileN(name, source, GUISTATE_C.getLanguage(), function (result) {
            var alertMsg = result.rc;
            if (result.parameters !== undefined) {
                alertMsg += '\nMessage is:\n' + result.parameters.MESSAGE;
            }
            alert(alertMsg);
        });
    }
    /**
     * Open a file select dialog to load source code from local disk and send it
     * to the cross compiler
     */
    function importNepoCodeToCompile() {
        init(compileFromNepoCode);
        $('#fileSelector').attr('accept', '.xml');
        $('#fileSelector').clickWrap(); // opening dialog
    }
    exports.importNepoCodeToCompile = importNepoCodeToCompile;
    function compileFromNepoCode(name, source) {
        PROGRAM.compileP(name, source, GUISTATE_C.getLanguage(), function (result) {
            alert(result.rc);
        });
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wb3J0LmNvbnRyb2xsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL3JvYmVydGEvY29udHJvbGxlci9pbXBvcnQuY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFhQSxTQUFTLElBQUksQ0FBQyxRQUFRO1FBQ2xCLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0IsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxNQUFNLENBQ3JCLFFBQVEsRUFDUixVQUFVLEtBQUs7WUFDWCxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNqQyxJQUFJLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQzlCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsVUFBVSxLQUFLO2dCQUMzQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFO29CQUN4QixRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ3ZDO1lBQ0wsQ0FBQyxDQUFDO1lBQ0YsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QixPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDLEVBQ0QsZ0JBQWdCLENBQ25CLENBQUM7SUFDTixDQUFDO0lBMkdRLG9CQUFJO0lBekdiLFNBQVMsU0FBUztRQUNkLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxlQUFlLENBQUMs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