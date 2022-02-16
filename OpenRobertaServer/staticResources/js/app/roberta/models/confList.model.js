/**
 * Rest calls to the server related to program operations (save, delete,
 * share...)
 *
 * @module rest/program
 */
define(["require", "exports", "comm"], function (require, exports, COMM) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.loadConfList = void 0;
    /**
     * Refresh program list
     */
    function loadConfList(successFn) {
        COMM.json('/conf/loadCN', {
            cmd: 'loadCN',
        }, successFn, 'refresh configuration list');
    }
    exports.loadConfList = loadConfList;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZkxpc3QubW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL3JvYmVydGEvbW9kZWxzL2NvbmZMaXN0Lm1vZGVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztHQUtHOzs7O0lBSUg7O09BRUc7SUFDSCxTQUFTLFlBQVksQ0FBQyxTQUFTO1FBQzNCLElBQUksQ0FBQyxJQUFJLENBQ0wsY0FBYyxFQUNkO1lBQ0ksR0FBRyxFQUFFLFFBQVE7U0FDaEIsRUFDRCxTQUFTLEVBQ1QsNEJBQTRCLENBQy9CLENBQUM7SUFDTixDQUFDO0lBQ1Esb0NBQVkifQ==