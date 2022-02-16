define(["require", "exports", "simulation.simulation", "blockly"], function (require, exports, simulation_simulation_1, Blockly) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getJqueryObject = exports.setSimBreak = exports.getBlockById = void 0;
    //This file contains function which allow the interpreter to communicate with the simulation.
    function getBlockById(id) {
        return Blockly.getMainWorkspace().getBlockById(id);
    }
    exports.getBlockById = getBlockById;
    function setSimBreak() {
        simulation_simulation_1.setPause(true);
    }
    exports.setSimBreak = setSimBreak;
    function getJqueryObject(object) {
        return $(object);
    }
    exports.getJqueryObject = getJqueryObject;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJwcmV0ZXIuanNIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL25lcG9zdGFja21hY2hpbmUvaW50ZXJwcmV0ZXIuanNIZWxwZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBR0EsNkZBQTZGO0lBRTdGLFNBQVMsWUFBWSxDQUFDLEVBQUU7UUFDcEIsT0FBTyxPQUFPLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQVNRLG9DQUFZO0lBUHJCLFNBQVMsV0FBVztRQUNoQixnQ0FBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25CLENBQUM7SUFLc0Isa0NBQVc7SUFIbEMsU0FBUyxlQUFlLENBQUMsTUFBTTtRQUMzQixPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyQixDQUFDO0lBQ21DLDBDQUFlIn0=