define(["require", "exports", "jquery", "bootstrap-table"], function (require, exports, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toggleVisibility = exports.reportToComm = exports.length = exports.enableComm = exports.enableHtml = exports.error = exports.info = exports.text = void 0;
    // switches for logging:
    var logToLog = true; // log to HTML-list with id #log
    var logToComm = true; // log to server along with the next ajax call
    var logToConsole = false; // log ERROR to console for DEBUGGING
    var markerINFO = '[[INFO]] ';
    var markerERROR = '[[ERR ]] ';
    /**
     * log text to a HTML-list with id #log or prepare it to be sent to the
     * server or do both or do nothing, depending on switches. A marker is
     * prepended to the message
     */
    function text(obj, marker) {
        if (marker === undefined) {
            marker = markerINFO;
        }
        /* jshint expr : true */
        logToLog && logLog(obj, marker);
        logToComm && logComm(obj, marker);
        logToConsole && marker === markerERROR && logConsole(obj, marker);
    }
    exports.text = text;
    /**
     * log info text to a HTML-list with id #log or prepare it to be sent to the
     * server or do both or do nothing, depending on switches
     */
    function info(obj) {
        text(obj, markerINFO);
    }
    exports.info = info;
    /**
     * log error text to a HTML-list with id #log or prepare it to be sent to
     * the server or do both or do nothing, depending on switches
     */
    function error(obj) {
        text(obj, markerERROR);
    }
    exports.error = error;
    /**
     * set switch for logging to a HTML-list to either true or false
     */
    function enableHtml(bool) {
        logToLog = bool;
    }
    exports.enableHtml = enableHtml;
    /**
     * set switch for logging to server along with the next ajax call to either
     * true or false
     */
    function enableComm(bool) {
        logToComm = bool;
    }
    exports.enableComm = enableComm;
    // IMPLEMENTATION OF logging to server along with the next ajax call
    var logQueue = [];
    /**
     * log to a queue
     */
    function logComm(obj, marker) {
        if (typeof obj === 'object') {
            obj = JSON.stringify(obj);
        }
        logQueue.push(marker + obj);
    }
    /**
     * to be used by COMM only: retrieve the number of entries in the log queue
     */
    function length() {
        return logQueue.length;
    }
    exports.length = length;
    /**
     * to be used by COMM only: retrieve logging data, because an ajax request
     * has to be prepared
     */
    function reportToComm() {
        var _logQueue = logQueue;
        logQueue = [];
        return _logQueue;
    }
    exports.reportToComm = reportToComm;
    var logToggle = 'log0'; // for alternating css-classes
    /**
     * IMPLEMENTATION OF logging to a HTML-list with id #log. expect: HTML-list
     * with id #log expect: css-classes 'log0' and 'log1' and 'lERR'
     */
    function logLog(obj, marker) {
        if (typeof obj === 'object') {
            obj = JSON.stringify(obj);
        }
        var data = $('#logTable').bootstrapTable('getData');
        $('#logTable').bootstrapTable('insertRow', {
            index: 0,
            row: {
                0: data.length + 1,
                1: marker,
                2: obj,
            },
        });
    }
    /**
     * IMPLEMENTATION OF logging to a HTML-list with id #log. expect: HTML-list
     * with id #log expect: css-classes 'log0' and 'log1' and 'lERR'
     */
    function logConsole(obj, marker) {
        if (typeof obj === 'object') {
            obj = JSON.stringify(obj);
        }
        console.log(markerERROR + obj);
    }
    /**
     * toggle the visibility of the HTML-list with id #log
     */
    function toggleVisibility() {
        var $log = $('#log');
        if ($log.is(':visible')) {
            $log.hide();
        }
        else {
            $log.show();
        }
    }
    exports.toggleVisibility = toggleVisibility;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2hlbHBlci9sb2cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBSUEsd0JBQXdCO0lBQ3hCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxDQUFDLGdDQUFnQztJQUNyRCxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyw4Q0FBOEM7SUFDcEUsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDLENBQUMscUNBQXFDO0lBRS9ELElBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQztJQUM3QixJQUFJLFdBQVcsR0FBRyxXQUFXLENBQUM7SUFFOUI7Ozs7T0FJRztJQUNILFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNO1FBQ3JCLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtZQUN0QixNQUFNLEdBQUcsVUFBVSxDQUFDO1NBQ3ZCO1FBQ0Qsd0JBQXdCO1FBQ3hCLFFBQVEsSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2hDLFNBQVMsSUFBSSxPQUFPLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2xDLFlBQVksSUFBSSxNQUFNLEtBQUssV0FBVyxJQUFJLFVBQVUsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQTBHUSxvQkFBSTtJQXhHYjs7O09BR0c7SUFDSCxTQUFTLElBQUksQ0FBQyxHQUFHO1FBQ2IsSUFBSSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBa0djLG9CQUFJO0lBaEduQjs7O09BR0c7SUFDSCxTQUFTLEtBQUssQ0FBQyxHQUFHO1FBQ2QsSUFBSSxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBMEZvQixzQkFBSztJQXhGMUI7O09BRUc7SUFDSCxTQUFTLFVBQVUsQ0FBQyxJQUFJO1FBQ3BCLFFBQVEsR0FBRyxJQUFJLENBQUM7SUFDcEIsQ0FBQztJQW1GMkIsZ0NBQVU7SUFqRnRDOzs7T0FHRztJQUNILFNBQVMsVUFBVSxDQUFDLElBQUk7UUFDcEIsU0FBUyxHQUFHLElBQUksQ0FBQztJQUNyQixDQUFDO0lBMkV1QyxnQ0FBVTtJQXpFbEQsb0VBQW9FO0lBQ3BFLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztJQUVsQjs7T0FFRztJQUNILFNBQVMsT0FBTyxDQUFDLEdBQUcsRUFBRSxNQUFNO1FBQ3hCLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO1lBQ3pCLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzdCO1FBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUyxNQUFNO1FBQ1gsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDO0lBQzNCLENBQUM7SUF1RG1ELHdCQUFNO0lBckQxRDs7O09BR0c7SUFDSCxTQUFTLFlBQVk7UUFDakIsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDZCxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0lBNkMyRCxvQ0FBWTtJQTNDeEUsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsOEJBQThCO0lBRXREOzs7T0FHRztJQUNILFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNO1FBQ3ZCLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO1lBQ3pCLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzdCO1FBQ0QsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUNwRCxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRTtZQUN2QyxLQUFLLEVBQUUsQ0FBQztZQUNSLEdBQUcsRUFBRTtnQkFDRCxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDO2dCQUNsQixDQUFDLEVBQUUsTUFBTTtnQkFDVCxDQUFDLEVBQUUsR0FBRzthQUNUO1NBQ0osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7T0FHRztJQUNILFNBQVMsVUFBVSxDQUFDLEdBQUcsRUFBRSxNQUFNO1FBQzNCLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxFQUFFO1lBQ3pCLEdBQUcsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzdCO1FBQ0QsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsU0FBUyxnQkFBZ0I7UUFDckIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JCLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUNyQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDZjthQUFNO1lBQ0gsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBQ3lFLDRDQUFnQiJ9