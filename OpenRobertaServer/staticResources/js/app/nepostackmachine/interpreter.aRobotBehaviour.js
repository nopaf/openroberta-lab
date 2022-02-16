define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ARobotBehaviour = void 0;
    var ARobotBehaviour = /** @class */ (function () {
        function ARobotBehaviour() {
            this.hardwareState = {};
            this.hardwareState.timers = {};
            this.hardwareState.timers['start'] = Date.now();
            this.hardwareState.actions = {};
            this.hardwareState.sensors = {};
            this.blocking = false;
        }
        ARobotBehaviour.prototype.getActionState = function (actionType, resetState) {
            if (resetState === void 0) { resetState = false; }
            var v = this.hardwareState.actions[actionType];
            if (resetState) {
                delete this.hardwareState.actions[actionType];
            }
            return v;
        };
        ARobotBehaviour.prototype.setBlocking = function (value) {
            this.blocking = value;
        };
        ARobotBehaviour.prototype.getBlocking = function () {
            return this.blocking;
        };
        return ARobotBehaviour;
    }());
    exports.ARobotBehaviour = ARobotBehaviour;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJwcmV0ZXIuYVJvYm90QmVoYXZpb3VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9uZXBvc3RhY2ttYWNoaW5lL2ludGVycHJldGVyLmFSb2JvdEJlaGF2aW91ci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7SUFFQTtRQUlJO1lBQ0ksSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNoRCxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7WUFDaEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQzFCLENBQUM7UUFFTSx3Q0FBYyxHQUFyQixVQUFzQixVQUFrQixFQUFFLFVBQWtCO1lBQWxCLDJCQUFBLEVBQUEsa0JBQWtCO1lBQ3hELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQy9DLElBQUksVUFBVSxFQUFFO2dCQUNaLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7YUFDakQ7WUFDRCxPQUFPLENBQUMsQ0FBQztRQUNiLENBQUM7UUFFTSxxQ0FBVyxHQUFsQixVQUFtQixLQUFjO1lBQzdCLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQzFCLENBQUM7UUFFTSxxQ0FBVyxHQUFsQjtZQUNJLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN6QixDQUFDO1FBbUVMLHNCQUFDO0lBQUQsQ0FBQyxBQTlGRCxJQThGQztJQTlGcUIsMENBQWUifQ==