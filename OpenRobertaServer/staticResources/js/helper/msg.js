define(["require", "exports", "log", "jquery", "blockly"], function (require, exports, LOG, $, Blockly) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.displayInformation = exports.displayMessage = exports.displayToastMessages = exports.displayPopupMessage = void 0;
    var toastMessages = [];
    var toastDelay = 3000;
    /**
     * Display popup messages
     */
    function displayPopupMessage(lkey, value, confirmMsg, opt_denyMsg) {
        $('#confirm').attr('value', confirmMsg);
        if (opt_denyMsg) {
            $('#confirmCancel').attr('value', opt_denyMsg);
            $('#messageConfirm').attr('lkey', lkey);
            $('#messageConfirm').html(value);
            $('#show-message-confirm').modal('show');
        }
        else {
            $('#message').attr('lkey', lkey);
            $('#message').html(value);
            $('#show-message').modal('show');
        }
    }
    exports.displayPopupMessage = displayPopupMessage;
    /**
     * Display toast messages
     */
    function displayToastMessages() {
        $('#toastText').html(toastMessages[toastMessages.length - 1]);
        $('#toastContainer')
            .delay(100)
            .fadeIn('slow', function () {
            $(this)
                .delay(toastDelay)
                .fadeOut('slow', function () {
                toastMessages.pop();
                if (toastMessages.length > 0) {
                    displayToastMessages();
                }
            });
        });
    }
    exports.displayToastMessages = displayToastMessages;
    /**
     * Display message
     *
     * @param {messageId}
     *            ID of message to be displayed
     * @param {output}
     *            where to display the message, "TOAST" or "POPUP"
     * @param {replaceWith}
     *            Text to replace an optional '$' in the message-text
     */
    function displayMessage(messageId, output, replaceWith, opt_cancel, opt_robot) {
        var cancel = opt_cancel || false;
        var robot = '';
        if (opt_robot) {
            robot = '_' + opt_robot.toUpperCase();
        }
        if (messageId != undefined) {
            if (messageId.indexOf('.') >= 0 || messageId.toUpperCase() != messageId) {
                // Invalid Message-Key
                LOG.info('Invalid message-key received: ' + messageId);
            }
            var lkey = 'Blockly.Msg.' + messageId + robot;
            var value = Blockly.Msg[messageId + robot] || Blockly.Msg[messageId];
            if (value === undefined || value === '') {
                value = messageId;
            }
            if (typeof replaceWith === 'string') {
                if (value.indexOf('$') >= 0) {
                    value = value.replace('$', replaceWith);
                }
                else {
                    value = value.replace(/\{[^\}]+\}/g, replaceWith);
                }
            }
            else if (typeof replaceWith === 'object') {
                if (value.indexOf('$') >= 0) {
                    var keys = Object.keys(replaceWith);
                    value = value.replace('$', replaceWith[keys[0]]);
                }
                else {
                    Object.keys(replaceWith).forEach(function (key) {
                        if (replaceWith.hasOwnProperty(key)) {
                            value = value.replace('{' + key + '}', replaceWith[key]);
                        }
                    });
                }
            }
            if (output === 'POPUP') {
                if (cancel) {
                    displayPopupMessage(lkey, value + Blockly.Msg.POPUP_CONFIRM_CONTINUE, 'OK', Blockly.Msg.POPUP_CANCEL);
                }
                else {
                    displayPopupMessage(lkey, value, 'OK');
                }
            }
            else if (output === 'TOAST') {
                toastMessages.unshift(value);
                if (toastMessages.length === 1) {
                    displayToastMessages();
                }
            }
        }
    }
    exports.displayMessage = displayMessage;
    /**
     * Display information
     *
     * @param {result}
     *            Response of a REST-call.
     * @param {successMessage}
     *            Toast-message to be displayed if REST-call was ok.
     * @param {result}
     *            Popup-message to be displayed if REST-call failed.
     * @param {messageParam}
     *            Parameter to be used in the message text.
     */
    function displayInformation(result, successMessage, errorMessage, messageParam, opt_robot) {
        if (result.rc === 'ok') {
            $('.modal').modal('hide'); // close all opened popups
            displayMessage(successMessage, 'TOAST', messageParam, false, opt_robot);
        }
        else {
            if (result.parameters === undefined) {
                displayMessage(errorMessage, 'POPUP', messageParam, false, opt_robot);
            }
            else {
                displayMessage(errorMessage, 'POPUP', result.parameters, false, opt_robot);
            }
        }
    }
    exports.displayInformation = displayInformation;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXNnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2hlbHBlci9tc2cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBS0EsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO0lBQ3ZCLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQztJQUV0Qjs7T0FFRztJQUNILFNBQVMsbUJBQW1CLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsV0FBVztRQUM3RCxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN4QyxJQUFJLFdBQVcsRUFBRTtZQUNiLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDL0MsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4QyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDakMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzVDO2FBQU07WUFDSCxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNqQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzFCLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDcEM7SUFDTCxDQUFDO0lBMkdRLGtEQUFtQjtJQXpHNUI7O09BRUc7SUFDSCxTQUFTLG9CQUFvQjtRQUN6QixDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFh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