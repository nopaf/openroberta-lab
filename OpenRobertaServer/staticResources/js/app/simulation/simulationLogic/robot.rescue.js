define(["require", "exports", "simulation.robot.ev3"], function (require, exports, simulation_robot_ev3_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Creates a new RescueRobot for the rescue scene.
     *
     * @constructor
     * @extends Robot
     */
    function RescueRobot() {
        simulation_robot_ev3_1.default.call(this, {
            x: 400,
            y: 40,
            theta: 0,
            xOld: 400,
            yOld: 40,
            transX: 0,
            transY: 0,
        });
    }
    RescueRobot.prototype = Object.create(simulation_robot_ev3_1.default.prototype);
    RescueRobot.prototype.constructor = RescueRobot;
    exports.default = RescueRobot;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3QucmVzY3VlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9zaW11bGF0aW9uL3NpbXVsYXRpb25Mb2dpYy9yb2JvdC5yZXNjdWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFFQTs7Ozs7T0FLRztJQUNILFNBQVMsV0FBVztRQUNoQiw4QkFBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDWCxDQUFDLEVBQUUsR0FBRztZQUNOLENBQUMsRUFBRSxFQUFFO1lBQ0wsS0FBSyxFQUFFLENBQUM7WUFDUixJQUFJLEVBQUUsR0FBRztZQUNULElBQUksRUFBRSxFQUFFO1lBQ1IsTUFBTSxFQUFFLENBQUM7WUFDVCxNQUFNLEVBQUUsQ0FBQztTQUNaLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxXQUFXLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsOEJBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNyRCxXQUFXLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7SUFFaEQsa0JBQWUsV0FBVyxDQUFDIn0=