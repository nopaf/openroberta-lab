define(["require", "exports", "guiState.controller", "interpreter.interpreter", "interpreter.robotWeDoBehaviour", "log", "blockly", "jquery"], function (require, exports, GUISTATE_C, INTERPRETER, WEDO_B, LOG, Blockly, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.jsToDisplay = exports.jsToAppInterface = exports.setRobotBehaviour = exports.isRobotConnected = exports.getInterpreter = exports.appToJsInterface = exports.init = void 0;
    var ready;
    var aLanguage;
    var webViewType;
    var interpreter;
    var theRobotBehaviour;
    /**
     * Init webview
     */
    function init(language) {
        aLanguage = language;
        ready = $.Deferred();
        var a = {};
        a.target = 'internal';
        a.type = 'identify';
        if (tryAndroid(a)) {
            webViewType = 'Android';
        }
        else if (tryIOS(a)) {
            webViewType = 'IOS';
        }
        else {
            // Obviously not in an Open Roberta webview
            ready.resolve(language);
        }
        return ready.promise();
    }
    exports.init = init;
    function appToJsInterface(jsonData) {
        try {
            var data = JSON.parse(jsonData);
            if (!data.target || !data.type) {
                throw 'invalid arguments';
            }
            if (data.target == 'internal') {
                if (data.type == 'identify') {
                    ready.resolve(aLanguage, data.name);
                }
                else {
                    throw 'invalid arguments';
                }
            }
            else if (data.target === GUISTATE_C.getRobot()) {
                if (data.type == 'scan' && data.state == 'appeared') {
                    $('#show-available-connections').trigger('add', data);
                }
                else if (data.type == 'scan' && data.state == 'error') {
                    $('#show-available-connections').modal('hide');
                }
                else if (data.type == 'scan' && data.state == 'disappeared') {
                    console.log(data);
                }
                else if (data.type == 'connect' && data.state == 'connected') {
                    $('#show-available-connections').trigger('connect', data);
                    theRobotBehaviour.update(data);
                    GUISTATE_C.setConnectionState('wait');
                    var bricklyWorkspace = GUISTATE_C.getBricklyWorkspace();
                    var blocks = bricklyWorkspace.getAllBlocks();
                    for (var i = 0; i < blocks.length; i++) {
                        if (blocks[i].type === 'robBrick_WeDo-Brick') {
                            var field = blocks[i].getField('VAR');
                            field.setValue(data.brickname.replace(/\s/g, ''));
                            blocks[i].render();
                            var dom = Blockly.Xml.workspaceToDom(bricklyWorkspace);
                            var xml = Blockly.Xml.domToText(dom);
                            GUISTATE_C.setConfigurationXML(xml);
                            break;
                        }
                    }
                }
                else if (data.type === 'connect' && data.state === 'disconnected') {
                    theRobotBehaviour.update(data);
                    if (interpreter != undefined) {
                        interpreter.terminate();
                    }
                    var bricklyWorkspace = GUISTATE_C.getBricklyWorkspace();
                    var blocks = bricklyWorkspace.getAllBlocks();
                    for (var i = 0; i < blocks.length; i++) {
                        if (blocks[i].type === 'robBrick_WeDo-Brick') {
                            var field = blocks[i].getField('VAR');
                            field.setValue(Blockly.Msg.ROBOT_DEFAULT_NAME_WEDO || Blockly.Msg.ROBOT_DEFAULT_NAME || 'Brick1');
                            blocks[i].render();
                            var dom = Blockly.Xml.workspaceToDom(bricklyWorkspace);
                            var xml = Blockly.Xml.domToText(dom);
                            GUISTATE_C.setConfigurationXML(xml);
                            break;
                        }
                    }
                    GUISTATE_C.setConnectionState('error');
                }
                else {
                    theRobotBehaviour.update(data);
                }
            }
            else {
                throw 'invalid arguments';
            }
        }
        catch (error) {
            LOG.error('appToJsInterface >' + error + ' caused by: ' + jsonData);
        }
    }
    exports.appToJsInterface = appToJsInterface;
    function callbackOnTermination() {
        GUISTATE_C.setConnectionState('wait');
        GUISTATE_C.getBlocklyWorkspace().robControls.switchToStart();
    }
    function getInterpreter(program) {
        interpreter = new INTERPRETER.Interpreter(program, theRobotBehaviour, callbackOnTermination, []);
        return interpreter;
    }
    exports.getInterpreter = getInterpreter;
    function isRobotConnected() {
        return theRobotBehaviour && theRobotBehaviour.getConnectedBricks().length > 0;
    }
    exports.isRobotConnected = isRobotConnected;
    function setRobotBehaviour() {
        switch (GUISTATE_C.getRobot()) {
            case 'wedo':
                theRobotBehaviour = new WEDO_B.RobotWeDoBehaviour(jsToAppInterface, jsToDisplay);
            // TODO: introduce here new robots and behaviours and add them to the dependencies on top of the file
            default:
                LOG.error('Webview: no robot behaviour for ' + GUISTATE_C.getRobot() + ' available!');
        }
    }
    exports.setRobotBehaviour = setRobotBehaviour;
    function jsToAppInterface(jsonData) {
        try {
            if (webViewType === 'Android') {
                OpenRoberta.jsToAppInterface(JSON.stringify(jsonData));
            }
            else if (webViewType === 'IOS') {
                window.webkit.messageHandlers.OpenRoberta.postMessage(JSON.stringify(jsonData));
            }
            else {
                throw 'invalid webview type';
            }
        }
        catch (error) {
            LOG.error('jsToAppInterface >' + error + ' caused by: ' + jsonData);
        }
    }
    exports.jsToAppInterface = jsToAppInterface;
    function tryAndroid(data) {
        try {
            OpenRoberta.jsToAppInterface(JSON.stringify(data));
            return true;
        }
        catch (error) {
            return false;
        }
    }
    function tryIOS(data) {
        try {
            window.webkit.messageHandlers.OpenRoberta.postMessage(JSON.stringify(data));
            return true;
        }
        catch (error) {
            return false;
        }
    }
    function jsToDisplay(action) {
        if (action.show !== undefined) {
            $('#showDisplayText').append('<div>' + action.show + '</div>');
            if (!$('#showDisplayText').is(':visible')) {
                $('#showDisplay').oneWrap('hidden.bs.modal', function () {
                    $('#showDisplayText').empty();
                });
                $('#showDisplay').modal('show');
            }
            $('#showDisplayText').scrollTop($('#showDisplayText').prop('scrollHeight'));
        }
        else if (action.clear !== undefined) {
            $('#showDisplayText').empty();
        }
    }
    exports.jsToDisplay = jsToDisplay;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2Vidmlldy5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9yb2JlcnRhL2NvbnRyb2xsZXIvd2Vidmlldy5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQU9BLElBQUksS0FBSyxDQUFDO0lBQ1YsSUFBSSxTQUFTLENBQUM7SUFDZCxJQUFJLFdBQVcsQ0FBQztJQUNoQixJQUFJLFdBQVcsQ0FBQztJQUNoQixJQUFJLGlCQUFpQixDQUFDO0lBRXRCOztPQUVHO0lBQ0gsU0FBUyxJQUFJLENBQUMsUUFBUTtRQUNsQixTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQ3JCLEtBQUssR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDckIsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ1gsQ0FBQyxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUM7UUFDdEIsQ0FBQyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7UUFDcEIsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDZixXQUFXLEdBQUcsU0FBUyxDQUFDO1NBQzNCO2FBQU0sSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDbEIsV0FBVyxHQUFHLEtBQUssQ0FBQztTQUN2QjthQUFNO1lBQ0gsMkNBQTJDO1lBQzNDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDM0I7UUFDRCxPQUFPLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMzQixDQUFDO0lBMElRLG9CQUFJO0lBeEliLFNBQVMsZ0JBQWdCLENBQUMsUUFBUTtRQUM5QixJQUFJO1lBQ0EsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNoQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVB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