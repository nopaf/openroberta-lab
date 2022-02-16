define(["require", "exports", "./interpreter.constants"], function (require, exports, C) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getInfoResult = exports.info = exports.debug = exports.opLog = exports.loggingEnabled = exports.expectExc = exports.dbcException = exports.dbc = void 0;
    function dbc(expected, actual) {
        if (expected !== actual) {
            var msg = 'DBC. Expected: ' + expected + ' but got: ' + actual;
            console.trace(msg);
            throw msg;
        }
    }
    exports.dbc = dbc;
    function dbcException(s) {
        console.trace(s);
        throw s;
    }
    exports.dbcException = dbcException;
    function expectExc(fct, cause) {
        try {
            fct();
            var msg = 'DBC. Expected exception was not thrown';
            console.trace(msg);
            throw msg;
        }
        catch (e) {
            if (cause === undefined) {
                console.log('expected exception suppressed');
            }
            else {
                dbc(cause, e);
            }
        }
    }
    exports.expectExc = expectExc;
    var opLogEnabled = true;
    var debugEnabled = true;
    var infoResult = '';
    function loggingEnabled(_opLogEnabled, _debugEnabled) {
        opLogEnabled = _opLogEnabled;
        debugEnabled = _debugEnabled;
        infoResult = '';
    }
    exports.loggingEnabled = loggingEnabled;
    /**
     * FOR DEBUGGING: write the actual array of operations to the 'console.log'. The actual operation is prefixed by '*'
     *
     * . @param msg the prefix of the message (for easy reading of the logs)
     * . @param operations the array of all operations to be executed
     * . @param pc the program counter
     */
    function opLog(msg, operations, pc) {
        if (!opLogEnabled) {
            return;
        }
        var opl = '';
        var counter = 0;
        for (var _i = 0, operations_1 = operations; _i < operations_1.length; _i++) {
            var op = operations_1[_i];
            var opc = op[C.OPCODE];
            if (op[C.OPCODE] === C.EXPR) {
                opc = opc + '[' + op[C.EXPR];
                if (op[C.EXPR] === C.BINARY) {
                    opc = opc + '-' + op[C.OP];
                }
                opc = opc + ']';
            }
            opl = opl + (counter++ == pc ? '*' : '') + opc + ' ';
        }
        debug(msg + ' pc:' + pc + ' ' + opl);
    }
    exports.opLog = opLog;
    function debug(s) {
        if (!debugEnabled) {
            return;
        }
        console.log(s);
    }
    exports.debug = debug;
    function info(s) {
        console.log(s);
        infoResult = infoResult + s + '\n';
    }
    exports.info = info;
    function getInfoResult() {
        return infoResult;
    }
    exports.getInfoResult = getInfoResult;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJwcmV0ZXIudXRpbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvbmVwb3N0YWNrbWFjaGluZS9pbnRlcnByZXRlci51dGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUVBLFNBQWdCLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTTtRQUNoQyxJQUFJLFFBQVEsS0FBSyxNQUFNLEVBQUU7WUFDckIsSUFBSSxHQUFHLEdBQUcsaUJBQWlCLEdBQUcsUUFBUSxHQUFHLFlBQVksR0FBRyxNQUFNLENBQUM7WUFDL0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuQixNQUFNLEdBQUcsQ0FBQztTQUNiO0lBQ0wsQ0FBQztJQU5ELGtCQU1DO0lBRUQsU0FBZ0IsWUFBWSxDQUFDLENBQVM7UUFDbEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNqQixNQUFNLENBQUMsQ0FBQztJQUNaLENBQUM7SUFIRCxvQ0FHQztJQUVELFNBQWdCLFNBQVMsQ0FBQyxHQUFHLEVBQUUsS0FBYztRQUN6QyxJQUFJO1lBQ0EsR0FBRyxFQUFFLENBQUM7WUFDTixJQUFJLEdBQUcsR0FBRyx3Q0FBd0MsQ0FBQztZQUNuRCxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLE1BQU0sR0FBRyxDQUFDO1NBQ2I7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLElBQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtnQkFDckIsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO2FBQ2hEO2lCQUFNO2dCQUNILEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7YUFDakI7U0FDSjtJQUNMLENBQUM7SUFiRCw4QkFhQztJQUVELElBQUksWUFBWSxHQUFHLElBQUksQ0FBQztJQUN4QixJQUFJLFlBQVksR0FBRyxJQUFJLENBQUM7SUFFeEIsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBRXBCLFNBQWdCLGNBQWMsQ0FBQyxhQUFzQixFQUFFLGFBQXNCO1FBQ3pFLFlBQVksR0FBRyxhQUFhLENBQUM7UUFDN0IsWUFBWSxHQUFHLGFBQWEsQ0FBQztRQUM3QixVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUFKRCx3Q0FJQztJQUNEOzs7Ozs7T0FNRztJQUNILFNBQWdCLEtBQUssQ0FBQyxHQUFXLEVBQUUsVUFBaUIsRUFBRSxFQUFVO1FBQzVELElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDZixPQUFPO1NBQ1Y7UUFDRCxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDaEIsS0FBZSxVQUFVLEVBQVYseUJBQVUsRUFBVix3QkFBVSxFQUFWLElBQVUsRUFBRTtZQUF0QixJQUFJLEVBQUUsbUJBQUE7WUFDUCxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZCLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFO2dCQUN6QixHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUM3QixJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sRUFBRTtvQkFDekIsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDOUI7Z0JBQ0QsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7YUFDbkI7WUFDRCxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7U0FDeEQ7UUFDRCxLQUFLLENBQUMsR0FBRyxHQUFHLE1BQU0sR0FBRyxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFsQkQsc0JBa0JDO0lBRUQsU0FBZ0IsS0FBSyxDQUFDLENBQU07UUFDeEIsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNmLE9BQU87U0FDVjtRQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbkIsQ0FBQztJQUxELHNCQUtDO0lBRUQsU0FBZ0IsSUFBSSxDQUFDLENBQU07UUFDdkIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNmLFVBQVUsR0FBRyxVQUFVLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUN2QyxDQUFDO0lBSEQsb0JBR0M7SUFFRCxTQUFnQixhQUFhO1FBQ3pCLE9BQU8sVUFBVSxDQUFDO0lBQ3RCLENBQUM7SUFGRCxzQ0FFQyJ9