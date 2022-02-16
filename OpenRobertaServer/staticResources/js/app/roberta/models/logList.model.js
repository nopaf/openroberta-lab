/**
 * Rest calls to the server related to program operations (save, delete,
 * share...)
 *
 * @module rest/program
 */
define(["require", "exports", "comm"], function (require, exports, COMM) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadExampleList = exports.loadProgList = void 0;
    /**
     * Refresh program list
     */
    function loadProgList(successFn) {
        COMM.json('/program/listing/names', {}, successFn, 'load program list');
    }
    exports.loadProgList = loadProgList;
    /**
     * Refresh example list
     */
    function loadExampleList(successFn) {
        COMM.json('/program/examples/names', {}, successFn, 'load example list');
    }
    exports.loadExampleList = loadExampleList;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nTGlzdC5tb2RlbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvcm9iZXJ0YS9tb2RlbHMvbG9nTGlzdC5tb2RlbC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7R0FLRzs7OztJQUlIOztPQUVHO0lBQ0gsU0FBUyxZQUFZLENBQUMsU0FBUztRQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBUVEsb0NBQVk7SUFOckI7O09BRUc7SUFDSCxTQUFTLGVBQWUsQ0FBQyxTQUFTO1FBQzlCLElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFDc0IsMENBQWUifQ==