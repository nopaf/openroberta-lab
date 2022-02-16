define(["require", "exports", "jquery", "wrap", "log"], function (require, exports, $, WRAP, LOG) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.showServerError = exports.sendProgramHexToAgent = exports.listRobotsFromAgent = exports.ping = exports.xml = exports.download = exports.json = exports.get = exports.setErrorFn = exports.setInitToken = exports.errorNum = exports.onNotificationsAvailableCallback = void 0;
    /**
     * prefix to be prepended to each URL used in ajax calls.
     */
    var urlPrefix = '/rest';
    var initToken = undefined;
    var frontendSessionValid = true;
    /**
     * Callback function, gets called when new notifications are available
     */
    var onNotificationsAvailable;
    exports.onNotificationsAvailableCallback = function (callback) {
        onNotificationsAvailable = callback;
    };
    /**
     * counts the number of communication errors (server down, ...). If the number hits a warning level,
     * the user is informed.
     */
    exports.errorNum = 0;
    /**
     * the error fn.
     */
    function errorFn(response) {
        alert('The COMM (default) errorfn is called.'); // This is an annoying behavior ...
        LOG.info('The COMM (default) errorfn is called. Data follows');
        LOG.error(response);
        ping();
    }
    /**
     * remember the init token. It is added to each request to identify THIS
     * front end process. May be resetted to 'undefined'
     */
    function setInitToken(newInitToken) {
        if (initToken === undefined || newInitToken === undefined) {
            initToken = newInitToken;
        }
        else {
            window.close();
        }
    }
    exports.setInitToken = setInitToken;
    /**
     * set a error fn. A error function must accept one parameter: the response.
     */
    function setErrorFn(newErrorFn) {
        errorFn = newErrorFn;
    }
    exports.setErrorFn = setErrorFn;
    /**
     * URL-encode a JSON object, issue a GET and expect a JSON object as
     * response. No init token! DEPRECATED. Only used in a test.
     */
    function get(url, data, successFn, message) {
        return $.ajax({
            url: urlPrefix + url,
            type: 'GET',
            dataType: 'json',
            data: data,
            success: WRAP.wrapREST(successFn, message),
            error: WRAP.wrapErrorFn(errorFn),
        });
    }
    exports.get = get;
    /**
     * POST a JSON object as ENTITY and expect a JSON object as response.
     */
    function json(url, data, successFn, message) {
        var log = LOG.reportToComm();
        var load = {
            log: log,
            data: data,
            initToken: initToken,
        };
        function successFnWrapper(response) {
            if (response !== undefined && response.message !== undefined && response.message === 'ORA_INIT_FAIL_INVALID_INIT_TOKEN') {
                frontendSessionValid = false;
                showServerError('INIT_TOKEN');
            }
            else {
                successFn(response);
            }
        }
        return $.ajax({
            url: urlPrefix + url,
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(load),
            success: WRAP.wrapREST(successFnWrapper, message),
            error: WRAP.wrapErrorFn(errorFn),
        });
    }
    exports.json = json;
    /**
     * downloads the object in response
     */
    function download(url) {
        var fullUrl = urlPrefix + url + '?initToken=' + initToken;
        window.open(fullUrl, '_blank');
    }
    exports.download = download;
    /**
     * POST a XML DOM object as ENTITY and expect a JSON object as response.
     */
    function xml(url, xml, successFn, message) {
        return $.ajax({
            url: urlPrefix + url,
            type: 'POST',
            contentType: 'text/plain; charset=utf-8',
            dataType: 'json',
            data: xml,
            success: WRAP.wrapREST(successFn, message),
            error: WRAP.wrapErrorFn(errorFn),
        });
    }
    exports.xml = xml;
    /**
     * check whether a server is available (... and send logging data!).<br>
     * SuccessFn is optional.
     */
    function ping(successFn) {
        if (!frontendSessionValid) {
            return;
        }
        else {
            var successFnWrapper = function (result) {
                if (result !== undefined && result.rc === 'error' && result.cause === 'ORA_INIT_FAIL_PING_ERROR' && result.initToken === 'invalid-token') {
                    frontendSessionValid = false;
                }
                if (successFn !== undefined) {
                    successFn(result);
                    if (onNotificationsAvailable && result['notifications.available']) {
                        onNotificationsAvailable();
                    }
                }
            };
            return json('/ping', {}, successFnWrapper); // no message to reduce amount of logging data
        }
    }
    exports.ping = ping;
    function listRobotsFromAgent(successFn, completeFn, onError) {
        var URL = 'http://127.0.0.1:8991/listrobots';
        var response = '';
        return $.ajax({
            type: 'GET',
            url: URL,
            //success : WRAP.wrapREST(successFn, "list success"),
            error: onError,
            complete: completeFn,
        });
    }
    exports.listRobotsFromAgent = listRobotsFromAgent;
    function sendProgramHexToAgent(programHex, robotPort, programName, signature, commandLine, successFn) {
        var URL = 'http://127.0.0.1:8991/upload';
        var board = 'arduino:avr:uno';
        var request = {
            board: board,
            port: robotPort,
            commandline: commandLine,
            signature: signature,
            hex: programHex,
            filename: programName + '.hex',
            extra: {
                auth: {
                    password: null,
                },
            },
            wait_for_upload_port: true,
            use_1200bps_touch: true,
            network: false,
            params_verbose: '-v',
            params_quiet: '-q -q',
            verbose: true,
        };
        var JSONrequest = JSON.stringify(request);
        return $.ajax({
            type: 'POST',
            url: URL,
            data: JSONrequest,
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            dataType: 'json',
            statusCode: {
                200: function () {
                    WRAP.wrapREST(successFn, 'Upload success');
                },
                202: function () {
                    WRAP.wrapREST(successFn, 'Upload success');
                },
                400: WRAP.wrapErrorFn(errorFn),
                403: WRAP.wrapErrorFn(errorFn),
                404: WRAP.wrapErrorFn(errorFn),
            },
            error: function (jqXHR) { },
        });
    }
    exports.sendProgramHexToAgent = sendProgramHexToAgent;
    function showServerError(type) {
        type += navigator.language.indexOf('de') > -1 ? '_DE' : '_EN';
        var message;
        switch (type) {
            case 'INIT_TOKEN_DE':
                message =
                    'Dieser Browsertab ist nicht mehr gültig, weil Deine Browser-Session abgelaufen ist oder der Openroberta-Server neu gestartet wurde.\n\nDu kannst dein Programm zwar noch verändern oder exportieren, aber nicht mehr übersetzen oder auf dein Gerät übertragen. Bitte lade diese Seite neu indem du auf »Aktualisieren« ↻ klickst!';
                break;
            case 'INIT_TOKEN_EN':
                message =
                    'This browser tab is not valid anymore, because your browser session expired or the openroberta server was restarted.\n\nYou may edit or export your program, but it is impossible to compile or send it to your device. Please click on the »Refresh« ↻ button!';
                break;
            case 'CONNECTION_DE':
                message = 'Deine Verbindung zum Open Roberta Server ist langsam oder unterbrochen. Du kannst dein Programm exportieren, um es zu sichern.';
                break;
            case 'CONNECTION_EN':
                message = 'Your connection to the Open Roberta Server is slow or broken. To avoid data loss you may export your program.';
                break;
            case 'FRONTEND_DE':
                message =
                    'Dein Browser hat ein ungültiges Kommando geschickt. Eventuell ist auch der Openroberta-Server neu gestartet worden. \n\nDu kannst dein Programm zwar noch verändern oder exportieren, aber nicht mehr übersetzen oder auf dein Gerät übertragen.\n\nBitte lösche vorsichtshalber den Browser-Cache!';
                break;
            case 'FRONTEND_EN':
                message =
                    'Your browser has sent an invalid command. Maybe that the openroberta server was restarted.\n\nYou may edit or export your program, but it is impossible to compile or send it to your device.\n\nAs a precaution please clear your browser cache!';
                break;
            default:
                message = 'Connection error! Please clear your browser cache!';
        }
        alert(message);
    }
    exports.showServerError = showServerError;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9oZWxwZXIvY29tbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFLQTs7T0FFRztJQUNILElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQztJQUN4QixJQUFJLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDMUIsSUFBSSxvQkFBb0IsR0FBRyxJQUFJLENBQUM7SUFFaEM7O09BRUc7SUFDSCxJQUFJLHdCQUF3QixDQUFDO0lBRWhCLFFBQUEsZ0NBQWdDLEdBQUcsVUFBVSxRQUFRO1FBQzlELHdCQUF3QixHQUFHLFFBQVEsQ0FBQztJQUN4QyxDQUFDLENBQUM7SUFFRjs7O09BR0c7SUFDVSxRQUFBLFFBQVEsR0FBRyxDQUFDLENBQUM7SUFFMUI7O09BRUc7SUFDSCxTQUFTLE9BQU8sQ0FBQyxRQUFRO1FBQ3JCLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDLENBQUMsbUNBQW1DO1FBQ25GLEdBQUcsQ0FBQyxJQUFJLENBQUMsb0RBQW9ELENBQUMsQ0FBQztRQUMvRCxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BCLElBQUksRUFBRSxDQUFDO0lBQ1gsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQVMsWUFBWSxDQUFDLFlBQVk7UUFDOUIsSUFBSSxTQUFTLEtBQUssU0FBUyxJQUFJLFlBQVksS0FBSyxTQUFTLEVBQUU7WUFDdkQsU0FBUyxHQUFHLFlBQVksQ0FBQztTQUM1QjthQUFNO1lBQ0gsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ2xCO0lBQ0wsQ0FBQztJQTJMUSxvQ0FBWTtJQXpMckI7O09BRUc7SUFDSCxTQUFTLFVBQVUsQ0FBQyxVQUFVO1FBQzFCLE9BQU8sR0FBRyxVQUFVLENBQUM7SUFDekIsQ0FBQztJQW9Mc0IsZ0NBQVU7SUFsTGpDOzs7T0FHRztJQUNILFNBQVMsR0FBRyxDQUFDLEdBQUcsRUFB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