define(["require", "exports", "comm", "log", "jquery"], function (require, exports, COMM, LOG, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.wrapErrorFn = exports.wrapREST = exports.wrapUI = exports.wrapTotal = void 0;
    /**
     * we want to guarantee, that only ONE thread of work is active. A thread of work is usually started by a UI-callback attached to
     * the DOM, may call the REST-server and continues with the REST-callback associated with the response of the REST-call.
     *
     * The idea is:
     * - when an UI-callback is attached to a DOM-item using $.onWrap(...), the UI-callback is wrapped with function wrapUI.
     * - if the user triggers the action, wrapUI is called first.
     * - if `numberOfActiveActions > 0`, the request is rejected by wrapUI
     * - otherwise numberOfActiveActions++. The UI-callback is called and if it terminates, numberOfActiveActions--
     * - if the UI-callback calls a REST-service using COMM.json, it supplies a REST-callback, which is called with the result later.
     * - COMM.json does numberOfActiveActions++ and wraps the REST-callback with wrapREST
     * - when the wrapREST functions is called, it does numberOfActiveActions-- and calls the REST-callback.
     * - the net effect is, that after the completion of the whole chain of actions, numberOfActiveActions is 0.
     */
    numberOfActiveActions = 0;
    /**
     * wrap a function to catch and display errors. Calling wrapTotal with an arbitrary function with NEVER terminate with an exception.
     * An not undefined 2nd parameter is a messages that activates logging with time measuring
     *
     * @memberof WRAP
     */
    function wrapTotal(fnToBeWrapped, message) {
        var wrap = function () {
            var start = new Date();
            try {
                var that = this;
                var result = fnToBeWrapped.apply(that, arguments);
                if (message !== undefined) {
                    var elapsed = new Date() - start;
                    LOG.text(elapsed + ' msec: ' + message, '[[TIME]] ');
                }
                return result;
            }
            catch (e) {
                var err = new Error();
                var elapsed = new Date() - start;
                if (message !== undefined) {
                    LOG.error('[[ERR ]] ' + elapsed + ' msec: ' + message + ', then EXCEPTION: ' + e + ' with stacktrace: ' + err.stack);
                }
                else {
                    LOG.error('[[ERR ]] ' + elapsed + ' msec: wrapTotal caught an EXCEPTION: ' + e + ' with stacktrace: ' + err.stack);
                }
            }
        };
        return wrap;
    }
    exports.wrapTotal = wrapTotal;
    /**
     * wrap a UI-callback to sequentialize user actions
     *
     * @memberof WRAP
     */
    function wrapUI(fnToBeWrapped, message) {
        var wrap = function () {
            if (numberOfActiveActions > 0) {
                if (message !== undefined) {
                    LOG.text('SUPPRESSED ACTION: ' + message);
                }
                else {
                    LOG.text('SUPPRESSED ACTION without message');
                }
                return;
            }
            try {
                numberOfActiveActions++;
                var fn = wrapTotal(fnToBeWrapped, message);
                var that = this;
                var result = fn.apply(that, arguments);
                numberOfActiveActions--;
                return result;
            }
            catch (e) {
                numberOfActiveActions--;
                var err = new Error();
                LOG.error('wrapUI/wrapTotal CRASHED UNEXPECTED AND SEVERELY with EXCEPTION: ' + e + ' and stacktrace: ' + err.stack);
                COMM.ping(); // transfer data to the server
            }
        };
        return wrap;
    }
    exports.wrapUI = wrapUI;
    /**
     * wrap a REST-callback to sequentialize user actions
     *
     * @memberof WRAP
     */
    function wrapREST(fnToBeWrapped, message) {
        var rest = function () {
            COMM.errorNum = 0;
            numberOfActiveActions++;
            try {
                var fn = wrapTotal(fnToBeWrapped, message);
                var that = this;
                fn.apply(that, arguments);
                numberOfActiveActions--;
            }
            catch (e) {
                numberOfActiveActions--;
                var err = new Error();
                LOG.error('wrapREST/wrapTotal CRASHED UNEXPECTED AND SEVERELY with EXCEPTION: ' + e + ' and stacktrace: ' + err.stack);
                COMM.ping(); // transfer data to the server
            }
        };
        return rest;
    }
    exports.wrapREST = wrapREST;
    function wrapErrorFn(errorFnToBeWrapped) {
        var wrap = function () {
            try {
                var fn = wrapTotal(errorFnToBeWrapped, message);
                var that = this;
                fn.apply(that, arguments);
                numberOfActiveActions--;
            }
            catch (e) {
                numberOfActiveActions--;
                var err = new Error();
                LOG.error('wrapErrorFn/wrapTotal CRASHED UNEXPECTED AND SEVERELY with EXCEPTION: ' + e + ' and stacktrace: ' + err.stack);
                COMM.ping(); // transfer data to the server
            }
        };
        return wrap;
    }
    exports.wrapErrorFn = wrapErrorFn;
    $.fn.onWrap = function (event, callbackOrFilter, callbackOrMessage, optMessage) {
        if (typeof callbackOrFilter === 'string') {
            if (typeof callbackOrMessage === 'function') {
                return this.on(event, callbackOrFilter, WRAP.wrapUI(callbackOrMessage, optMessage));
            }
            else {
                LOG.error('illegal wrapping. Parameter: ' + event + ' ::: ' + callbackOrFilter + ' ::: ' + callbackOrMessage + ' ::: ' + optMessage);
            }
        }
        else if (typeof callbackOrFilter === 'function') {
            if (typeof callbackOrMessage === 'string' || callbackOrMessage === undefined) {
                return this.on(event, WRAP.wrapUI(callbackOrFilter, callbackOrMessage));
            }
            else {
                LOG.error('illegal wrapping. Parameter: ' + event + ' ::: ' + callbackOrFilter + ' ::: ' + callbackOrMessage + ' ::: ' + optMessage);
            }
        }
    };
    $.fn.clickWrap = function (callback) {
        numberOfActiveActions--;
        try {
            if (callback === undefined) {
                this.click();
            }
            else {
                this.click(callback);
            }
            numberOfActiveActions++;
        }
        catch (e) {
            numberOfActiveActions++;
            var err = new Error();
            LOG.error('clickWrap CRASHED UNEXPECTED AND SEVERELY with EXCEPTION: ' + e + ' and stacktrace: ' + err.stack);
            COMM.ping(); // transfer data to the server
        }
    };
    $.fn.tabWrapShow = function () {
        numberOfActiveActions--;
        try {
            this.tab('show');
            numberOfActiveActions++;
        }
        catch (e) {
            numberOfActiveActions++;
            var err = new Error();
            LOG.error('tabWrap CRASHED UNEXPECTED AND SEVERELY with EXCEPTION: ' + e + ' and stacktrace: ' + err.stack);
            COMM.ping(); // transfer data to the server
        }
    };
    $.fn.oneWrap = function (event, callback) {
        numberOfActiveActions--;
        try {
            this.one(event, callback);
            numberOfActiveActions++;
        }
        catch (e) {
            numberOfActiveActions++;
            var err = new Error();
            LOG.error('oneWrap CRASHED UNEXPECTED AND SEVERELY with EXCEPTION: ' + e + ' and stacktrace: ' + err.stack);
            COMM.ping(); // transfer data to the server
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JhcC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9oZWxwZXIvd3JhcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFLQTs7Ozs7Ozs7Ozs7OztPQWFHO0lBQ0gscUJBQXFCLEdBQUcsQ0FBQyxDQUFDO0lBRTFCOzs7OztPQUtHO0lBQ0gsU0FBUyxTQUFTLENBQUMsYUFBYSxFQUFFLE9BQU87UUFDckMsSUFBSSxJQUFJLEdBQUc7WUFDUCxJQUFJLEtBQUssR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO1lBQ3ZCLElBQUk7Z0JBQ0EsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO2dCQUNoQixJQUFJLE1BQU0sR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDbEQsSUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFO29CQUN2QixJQUFJLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQztvQkFDakMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxHQUFHLE9BQU8sRUFBRSxXQUFXLENBQUMsQ0FBQztpQkFDeEQ7Z0JBQ0QsT0FBTyxNQUFNLENBQUM7YUFDakI7WUFBQyxPQUFPLENBQUMsRUFBRTtnQkFDUixJQUFJLEdBQUcsR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO2dCQUN0QixJQUFJLE9BQU8sR0FBRyxJQUFJLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQztnQkFDakMsSUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFO29CQUN2QixHQUFHLENBQUMsS0FBSyxDQUFDLFdBQVcsR0FBRyxPQUFPLEdBQUcsU0FBUyxHQUFHLE9BQU8sR0FBRyxvQkFBb0IsR0FBRyxDQUFDLEdBQUcsb0JBQW9CLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUN4SDtxQkFBTTtvQkFDSCxHQUFHLENBQUMsS0FBSyxDQUFD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