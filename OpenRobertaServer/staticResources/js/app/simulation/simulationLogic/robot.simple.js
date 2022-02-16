define(["require", "exports", "simulation.robot.ev3"], function (require, exports, simulation_robot_ev3_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Creates a new SimpleRobot for the simple scene.
     *
     * @class
     * @extends Robot
     */
    function SimpleRobot(type) {
        simulation_robot_ev3_1.default.call(this, {
            x: 240,
            y: 200,
            theta: 0,
            xOld: 240,
            yOld: 200,
            transX: 0,
            transY: 0,
        });
    }
    SimpleRobot.prototype = Object.create(simulation_robot_ev3_1.default.prototype);
    SimpleRobot.prototype.constructor = SimpleRobot;
    exports.default = SimpleRobot;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3Quc2ltcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9zaW11bGF0aW9uL3NpbXVsYXRpb25Mb2dpYy9yb2JvdC5zaW1wbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFFQTs7Ozs7T0FLRztJQUNILFNBQVMsV0FBVyxDQUFDLElBQUk7UUFDckIsOEJBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1gsQ0FBQyxFQUFFLEdBQUc7WUFDTixDQUFDLEVBQUUsR0FBRztZQUNOLEtBQUssRUFBRSxDQUFDO1lBQ1IsSUFBSSxFQUFFLEdBQUc7WUFDVCxJQUFJLEVBQUUsR0FBRztZQUNULE1BQU0sRUFBRSxDQUFDO1lBQ1QsTUFBTSxFQUFFLENBQUM7U0FDWixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsV0FBVyxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLDhCQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDckQsV0FBVyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO0lBRWhELGtCQUFlLFdBQVcsQ0FBQyJ9