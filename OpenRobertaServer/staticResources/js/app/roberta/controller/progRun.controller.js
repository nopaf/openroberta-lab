define(["require", "exports", "util", "log", "message", "program.controller", "program.model", "socket.controller", "guiState.controller", "webview.controller", "jquery", "blockly"], function (require, exports, UTIL, LOG, MSG, PROG_C, PROGRAM, SOCKET_C, GUISTATE_C, WEBVIEW_C, $, Blockly) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.reset2DefaultFirmware = exports.runOnBrick = exports.runNative = exports.init = void 0;
    var blocklyWorkspace;
    var interpreter;
    var reset;
    function init(workspace) {
        blocklyWorkspace = GUISTATE_C.getBlocklyWorkspace();
        reset = false;
        //initView();
        initEvents();
    }
    exports.init = init;
    function initEvents() {
        Blockly.bindEvent_(blocklyWorkspace.robControls.runOnBrick, 'mousedown', null, function (e) {
            LOG.info('runOnBrick from blockly button');
            runOnBrick();
            return false;
        });
        Blockly.bindEvent_(blocklyWorkspace.robControls.stopBrick, 'mousedown', null, function (e) {
            LOG.info('stopBrick from blockly button');
            stopBrick();
            return false;
        });
        if (GUISTATE_C.getConnection() !== 'autoConnection' && GUISTATE_C.getConnection() !== 'jsPlay') {
            GUISTATE_C.setRunEnabled(false);
        }
    }
    /**
     * Start the program on brick from the source code editor
     */
    function runNative(sourceCode) {
        GUISTATE_C.setPing(false);
        GUISTATE_C.setConnectionState('busy');
        LOG.info('run ' + GUISTATE_C.getProgramName() + 'on brick from source code editor');
        var callback = getConnectionTypeCallbackForEditor();
        PROGRAM.runNative(GUISTATE_C.getProgramName(), sourceCode, GUISTATE_C.getLanguage(), function (result) {
            callback(result);
            GUISTATE_C.setPing(true);
        });
    }
    exports.runNative = runNative;
    /**
     * Start the program on the brick
     */
    function runOnBrick() {
        GUISTATE_C.setPing(false);
        GUISTATE_C.setConnectionState('busy');
        LOG.info('run ' + GUISTATE_C.getProgramName() + 'on brick');
        var xmlProgram = Blockly.Xml.workspaceToDom(blocklyWorkspace);
        var xmlTextProgram = Blockly.Xml.domToText(xmlProgram);
        var isNamedConfig = !GUISTATE_C.isConfigurationStandard() && !GUISTATE_C.isConfigurationAnonymous();
        var configName = isNamedConfig ? GUISTATE_C.getConfigurationName() : undefined;
        var xmlConfigText = GUISTATE_C.isConfigurationAnonymous() ? GUISTATE_C.getConfigurationXML() : undefined;
        var callback = getConnectionTypeCallback();
        PROGRAM.runOnBrick(GUISTATE_C.getProgramName(), configName, xmlTextProgram, xmlConfigText, PROG_C.SSID, PROG_C.password, GUISTATE_C.getLanguage(), callback);
    }
    exports.runOnBrick = runOnBrick;
    function getConnectionTypeCallbackForEditor() {
        var connectionType = GUISTATE_C.getConnectionTypeEnum();
        if (GUISTATE_C.getConnection() === connectionType.AUTO || GUISTATE_C.getConnection() === connectionType.LOCAL) {
            return function (result) {
                runForAutoConnection(result);
            };
        }
        if (GUISTATE_C.getConnection() === connectionType.AGENT || (GUISTATE_C.getConnection() === connectionType.AGENTORTOKEN && GUISTATE_C.getIsAgent())) {
            return function (result) {
                runForAgentConnection(result);
            };
        }
        if (GUISTATE_C.getConnection() === connectionType.WEBVIEW) {
            return function (result) {
                runForWebviewConnection(result);
            };
        }
        if (GUISTATE_C.getConnection() === connectionType.JSPLAY) {
            return function (result) {
                runForJSPlayConnection(result);
            };
        }
        return function (result) {
            runForToken(result);
        };
    }
    function getConnectionTypeCallback() {
        var connectionType = GUISTATE_C.getConnectionTypeEnum();
        if (GUISTATE_C.getConnection() === connectionType.AUTO || GUISTATE_C.getConnection() === connectionType.LOCAL) {
            return function (result) {
                runForAutoConnection(result);
                PROG_C.reloadProgram(result);
                GUISTATE_C.setPing(true);
            };
        }
        if (GUISTATE_C.getConnection() === connectionType.AGENT || (GUISTATE_C.getConnection() === connectionType.AGENTORTOKEN && GUISTATE_C.getIsAgent())) {
            return function (result) {
                runForAgentConnection(result);
                PROG_C.reloadProgram(result);
                GUISTATE_C.setPing(true);
            };
        }
        if (GUISTATE_C.getConnection() === connectionType.WEBVIEW) {
            return function (result) {
                runForWebviewConnection(result);
                PROG_C.reloadProgram(result);
                GUISTATE_C.setPing(true);
            };
        }
        if (GUISTATE_C.getConnection() === connectionType.JSPLAY) {
            return function (result) {
                runForJSPlayConnection(result);
                PROG_C.reloadProgram(result);
                GUISTATE_C.setPing(true);
            };
        }
        return function (result) {
            runForToken(result);
            PROG_C.reloadProgram(result);
            GUISTATE_C.setPing(true);
        };
    }
    function runForAutoConnection(result) {
        GUISTATE_C.setState(result);
        if (result.rc == 'ok') {
            var filename = (result.programName || GUISTATE_C.getProgramName()) + '.' + GUISTATE_C.getBinaryFileExtension();
            if (GUISTATE_C.getBinaryFileExtension() === 'bin' || GUISTATE_C.getBinaryFileExtension() === 'uf2') {
                result.compiledCode = UTIL.base64decode(result.compiledCode);
            }
            if (GUISTATE_C.isProgramToDownload() || navigator.userAgent.toLowerCase().match(/iPad|iPhone|android/i) !== null) {
                // either the user doesn't want to see the modal anymore or he uses a smartphone / tablet, where you cannot choose the download folder.
                UTIL.download(filename, result.compiledCode);
                setTimeout(function () {
                    GUISTATE_C.setConnectionState('wait');
                }, 5000);
                MSG.displayInformation(result, result.message, result.message, GUISTATE_C.getProgramName(), GUISTATE_C.getRobot());
            }
            else if (GUISTATE_C.getConnection() == GUISTATE_C.getConnectionTypeEnum().LOCAL) {
                setTimeout(function () {
                    GUISTATE_C.setConnectionState('wait');
                }, 5000);
                MSG.displayInformation(result, result.message, result.message, GUISTATE_C.getProgramName(), GUISTATE_C.getRobot());
            }
            else {
                createDownloadLink(filename, result.compiledCode);
                var textH = $('#popupDownloadHeader').text();
                $('#popupDownloadHeader').text(textH.replace('$', $.trim(GUISTATE_C.getRobotRealName())));
                for (var i = 1; Blockly.Msg['POPUP_DOWNLOAD_STEP_' + i]; i++) {
                    var step = $('<li class="typcn typcn-roberta">');
                    var a = Blockly.Msg['POPUP_DOWNLOAD_STEP_' + i + '_' + GUISTATE_C.getRobotGroup().toUpperCase()] ||
                        Blockly.Msg['POPUP_DOWNLOAD_STEP_' + i] ||
                        'POPUP_DOWNLOAD_STEP_' + i;
                    step.html('<span class="download-message">' + a + '</span>');
                    step.css('opacity', '0');
                    $('#download-instructions').append(step);
                }
                var substituteName = GUISTATE_C.getRobotGroup().toUpperCase();
                $('#download-instructions li').each(function (index) {
                    if (GUISTATE_C.getRobotGroup() === 'calliope') {
                        substituteName = 'MINI';
                    }
                    $(this).html($(this).html().replace('$', substituteName));
                });
                $('#save-client-compiled-program').oneWrap('shown.bs.modal', function (e) {
                    $('#download-instructions li').each(function (index) {
                        $(this)
                            .delay(750 * index)
                            .animate({
                            opacity: 1,
                        }, 1000);
                    });
                });
                $('#save-client-compiled-program').oneWrap('hidden.bs.modal', function (e) {
                    var textH = $('#popupDownloadHeader').text();
                    $('#popupDownloadHeader').text(textH.replace($.trim(GUISTATE_C.getRobotRealName()), '$'));
                    if ($('#label-checkbox').is(':checked')) {
                        GUISTATE_C.setProgramToDownload();
                    }
                    $('#programLink').remove();
                    $('#download-instructions').empty();
                    GUISTATE_C.setConnectionState('wait');
                    MSG.displayInformation(result, result.message, result.message, GUISTATE_C.getProgramName(), GUISTATE_C.getRobot());
                });
                $('#save-client-compiled-program').modal('show');
            }
        }
        else {
            GUISTATE_C.setConnectionState('wait');
            MSG.displayInformation(result, result.message, result.message, GUISTATE_C.getProgramName(), GUISTATE_C.getRobot());
        }
    }
    /**
     * Creates the pop-up for robots that play sound inside the browser instead
     * of downloading a file (f.e. Edison) This function is very similar to
     * runForAutoConnection, but instead of a download link a Play button is
     * created. Also, some parts of the autoConnection pop-up are hidden: - the
     * "I've changed my download folder" checkbox - the "OK" button in the
     * footer
     *
     * @param result
     *            the result that is received from the server after sending the
     *            program to it
     */
    function runForJSPlayConnection(result) {
        if (result.rc !== 'ok') {
            GUISTATE_C.setConnectionState('wait');
            MSG.displayInformation(result, result.message, result.message, GUISTATE_C.getProgramName(), GUISTATE_C.getRobot());
        }
        else {
            var wavFileContent = UTIL.base64decode(result.compiledCode);
            var audio;
            $('#changedDownloadFolder').addClass('hidden');
            //This detects IE11 (and IE11 only), see: https://developer.mozilla.org/en-US/docs/Web/API/Window/crypto
            if (window.msCrypto) {
                //Internet Explorer (all ver.) does not support playing WAV files in the browser
                //If the user uses IE11 the file will not be played, but downloaded instead
                //See: https://caniuse.com/#feat=wav, https://www.w3schools.com/html/html5_audio.asp
                createDownloadLink(GUISTATE_C.getProgramName() + '.wav', wavFileContent);
            }
            else {
                //All non-IE browsers can play WAV files in the browser, see: https://www.w3schools.com/html/html5_audio.asp
                $('#OKButtonModalFooter').addClass('hidden');
                var contentAsBlob = new Blob([wavFileContent], {
                    type: 'audio/wav',
                });
                audio = new Audio(window.URL.createObjectURL(contentAsBlob));
                createPlayButton(audio);
            }
            var textH = $('#popupDownloadHeader').text();
            $('#popupDownloadHeader').text(textH.replace('$', $.trim(GUISTATE_C.getRobotRealName())));
            for (var i = 1; Blockly.Msg['POPUP_DOWNLOAD_STEP_' + i]; i++) {
                var step = $('<li class="typcn typcn-roberta">');
                var a = Blockly.Msg['POPUP_DOWNLOAD_STEP_' + i + '_' + GUISTATE_C.getRobotGroup().toUpperCase()] ||
                    Blockly.Msg['POPUP_DOWNLOAD_STEP_' + i] ||
                    'POPUP_DOWNLOAD_STEP_' + i;
                step.html('<span class="download-message">' + a + '</span>');
                step.css('opacity', '0');
                $('#download-instructions').append(step);
            }
            $('#save-client-compiled-program').oneWrap('shown.bs.modal', function (e) {
                $('#download-instructions li').each(function (index) {
                    $(this)
                        .delay(750 * index)
                        .animate({
                        opacity: 1,
                    }, 1000);
                });
            });
            $('#save-client-compiled-program').oneWrap('hidden.bs.modal', function (e) {
                if (!window.msCrypto) {
                    audio.pause();
                    audio.load();
                }
                var textH = $('#popupDownloadHeader').text();
                $('#popupDownloadHeader').text(textH.replace($.trim(GUISTATE_C.getRobotRealName()), '$'));
                $('#programLink').remove();
                $('#download-instructions').empty();
                GUISTATE_C.setConnectionState('wait');
                MSG.displayInformation(result, result.message, result.message, GUISTATE_C.getProgramName(), GUISTATE_C.getRobot());
                //Un-hide the div if it was hidden before
                $('#changedDownloadFolder').removeClass('hidden');
                $('#OKButtonModalFooter').removeClass('hidden');
            });
            $('#save-client-compiled-program').modal('show');
        }
    }
    function runForAgentConnection(result) {
        $('#menuRunProg').parent().addClass('disabled');
        $('#head-navi-icon-robot').addClass('busy');
        GUISTATE_C.setState(result);
        if (result.rc == 'ok') {
            SOCKET_C.uploadProgram(result.compiledCode, GUISTATE_C.getRobotPort());
            setTimeout(function () {
                GUISTATE_C.setConnectionState('error');
            }, 5000);
        }
        else {
            GUISTATE_C.setConnectionState('error');
        }
        MSG.displayInformation(result, result.message, result.message, GUISTATE_C.getProgramName());
    }
    function runForToken(result) {
        GUISTATE_C.setState(result);
        MSG.displayInformation(result, result.message, result.message, result.programName || GUISTATE_C.getProgramName(), GUISTATE_C.getRobot());
        if (result.rc == 'ok') {
            if (Blockly.Msg['MENU_ROBOT_STOP_HINT_' + GUISTATE_C.getRobotGroup().toUpperCase()]) {
                MSG.displayMessage('MENU_ROBOT_STOP_HINT_' + GUISTATE_C.getRobotGroup().toUpperCase(), 'TOAST');
            }
        }
        else {
            GUISTATE_C.setConnectionState('error');
        }
    }
    function stopBrick() {
        if (interpreter !== null) {
            interpreter.terminate();
        }
    }
    function runForWebviewConnection(result) {
        MSG.displayInformation(result, result.message, result.message, GUISTATE_C.getProgramName());
        if (result.rc === 'ok') {
            var programSrc = result.compiledCode;
            var program = JSON.parse(programSrc);
            interpreter = WEBVIEW_C.getInterpreter(program);
            if (interpreter !== null) {
                GUISTATE_C.setConnectionState('busy');
                blocklyWorkspace.robControls.switchToStop();
                try {
                    runStepInterpreter();
                }
                catch (error) {
                    interpreter.terminate();
                    interpreter = null;
                    alert(error);
                }
            }
            // TODO
        }
    }
    function runStepInterpreter() {
        if (!interpreter.isTerminated() && !reset) {
            var maxRunTime = new Date().getTime() + 100;
            var waitTime = Math.max(100, interpreter.run(maxRunTime));
            timeout(runStepInterpreter, waitTime);
        }
    }
    /**
     * after the duration specified, call the callback function given. The
     * duration is partitioned into 100 millisec intervals to allow termination
     * of the running interpreter during a timeout. Be careful: the termination
     * is NOT effected here, but by the callback function (this should be *
     *
     * @see evalOperation() in ALMOST ALL cases).
     *
     * @param callback
     *            called when the time has elapsed .
     * @param durationInMilliSec
     *            time that should elapse before the callback is called
     */
    function timeout(callback, durationInMilliSec) {
        if (durationInMilliSec > 100) {
            // U.p( 'waiting for 100 msec from ' + durationInMilliSec + ' msec' );
            durationInMilliSec -= 100;
            setTimeout(timeout, 100, callback, durationInMilliSec);
        }
        else {
            // U.p( 'waiting for ' + durationInMilliSec + ' msec' );
            setTimeout(callback, durationInMilliSec);
        }
    }
    /**
     * Creates a blob from the program content for file download and a
     * click-able html download link for the blob: <a download="PROGRAM_NAME"
     * href="CONTENT_AS_BLOB" style="font-size:36px">PROGRAM_NAME</a>
     *
     * This is needed f.e. for Calliope where the file has to be downloaded and
     * copied onto the brick manually
     *
     * @param fileName
     *            the file name (for PROGRAM_NAME)
     * @param content
     *            for the blob (for CONTENT_AS_BLOB)
     */
    function createDownloadLink(fileName, content) {
        if (!('msSaveOrOpenBlob' in navigator)) {
            $('#trA').removeClass('hidden');
        }
        else {
            $('#trA').addClass('hidden');
            UTIL.download(fileName, content);
            GUISTATE_C.setConnectionState('error');
        }
        var downloadLink;
        if ('Blob' in window) {
            var contentAsBlob = new Blob([content], {
                type: 'application/octet-stream',
            });
            if ('msSaveOrOpenBlob' in navigator) {
                navigator.msSaveOrOpenBlob(contentAsBlob, fileName);
            }
            else {
                downloadLink = document.createElement('a');
                downloadLink.download = fileName;
                downloadLink.innerHTML = fileName;
                downloadLink.href = window.URL.createObjectURL(contentAsBlob);
            }
        }
        else {
            downloadLink = document.createElement('a');
            downloadLink.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
            downloadLink.setAttribute('download', fileName);
            downloadLink.style.display = 'none';
        }
        //create link with content
        if (downloadLink && !('msSaveOrOpenBlob' in navigator)) {
            var programLinkDiv = document.createElement('div');
            programLinkDiv.setAttribute('id', 'programLink');
            var linebreak = document.createElement('br');
            programLinkDiv.setAttribute('style', 'text-align: center;');
            programLinkDiv.appendChild(linebreak);
            programLinkDiv.appendChild(downloadLink);
            downloadLink.setAttribute('style', 'font-size:36px');
            $('#downloadLink').append(programLinkDiv);
        }
    }
    /**
     * Creates a Play button for an Audio object so that the sound can be played
     * and paused/restarted inside the browser:
     *
     * <button type="button" class="btn btn-primary" style="font-size:36px">
     * <span class="typcn typcn-media-play" style="color : black"></span>
     * </button>
     *
     *
     * @param fileName
     *            the name of the program
     * @param content
     *            the content of the WAV file as a Base64 encoded String
     */
    function createPlayButton(audio) {
        $('#trA').removeClass('hidden');
        var playButton;
        if ('Blob' in window) {
            //Create a bootstrap button
            playButton = document.createElement('button');
            playButton.setAttribute('type', 'button');
            playButton.setAttribute('class', 'btn btn-primary');
            var playing = false;
            playButton.onclick = function () {
                if (playing == false) {
                    audio.play();
                    playIcon.setAttribute('class', 'typcn typcn-media-stop');
                    playing = true;
                    audio.addEventListener('ended', function () {
                        $('#save-client-compiled-program').modal('hide');
                    });
                }
                else {
                    playIcon.setAttribute('class', 'typcn typcn-media-play');
                    audio.pause();
                    audio.load();
                    playing = false;
                }
            };
            //Create the play icon inside the button
            var playIcon = document.createElement('span');
            playIcon.setAttribute('class', 'typcn typcn-media-play');
            playIcon.setAttribute('style', 'color : black');
            playButton.appendChild(playIcon);
        }
        if (playButton) {
            var programLinkDiv = document.createElement('div');
            programLinkDiv.setAttribute('id', 'programLink');
            programLinkDiv.setAttribute('style', 'text-align: center;');
            programLinkDiv.appendChild(document.createElement('br'));
            programLinkDiv.appendChild(playButton);
            playButton.setAttribute('style', 'font-size:36px');
            $('#downloadLink').append(programLinkDiv);
        }
    }
    function reset2DefaultFirmware() {
        if (GUISTATE_C.hasRobotDefaultFirmware()) {
            var connectionType = GUISTATE_C.getConnectionTypeEnum();
            if (GUISTATE_C.getConnection() == connectionType.AUTO || GUISTATE_C.getConnection() == connectionType.LOCAL) {
                PROGRAM.resetProgram(function (result) {
                    runForAutoConnection(result);
                });
            }
            else {
                PROGRAM.resetProgram(function (result) {
                    runForToken(result);
                });
            }
        }
        else {
            MSG.displayInformation({
                rc: 'error',
            }, '', 'should not happen!');
        }
    }
    exports.reset2DefaultFirmware = reset2DefaultFirmware;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ1J1bi5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9yb2JlcnRhL2NvbnRyb2xsZXIvcHJvZ1J1bi5jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQVdBLElBQUksZ0JBQWdCLENBQUM7SUFDckIsSUFBSSxXQUFXLENBQUM7SUFDaEIsSUFBSSxLQUFLLENBQUM7SUFFVixTQUFTLElBQUksQ0FBQyxTQUFTO1FBQ25CLGdCQUFnQixHQUFHLFVBQVUsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQ3BELEtBQUssR0FBRyxLQUFLLENBQUM7UUFDZCxhQUFhO1FBQ2IsVUFBVSxFQUFFLENBQUM7SUFDakIsQ0FBQztJQXVmUSxvQkFBSTtJQXJmYixTQUFTLFVBQVU7UUFDZixPQUFPLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUM7WUFDdEYsR0FBRyxDQUFDLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO1lBQzNDLFVBQVUsRUFBRSxDQUFDO1lBQ2IsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxVQUFVLENBQUM7WUFDckYsR0FBRyxDQUFDLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1lBQzFDLFNBQVMsRUFBRSxDQUFDO1lBQ1osT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLFVBQVUsQ0FBQyxhQUFhLEVBQUUsS0FBSyxnQkFBZ0IsSUFBSSxVQUFVLENBQUMsYUFBYSxFQUFFLEtBQUssUUFBUSxFQUFFO1lBQzVGLFVBQVUsQ0FBQyxhQUFhLENB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