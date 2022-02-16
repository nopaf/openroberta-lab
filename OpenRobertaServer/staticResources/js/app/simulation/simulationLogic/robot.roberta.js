define(["require", "exports", "simulation.robot.ev3"], function (require, exports, simulation_robot_ev3_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Creates a new RobertaRobot for the Roberta scene.
     *
     * @class
     * @extends Robot
     */
    function RobertaRobot() {
        simulation_robot_ev3_1.default.call(this, {
            x: 70,
            y: 90,
            theta: 0,
            xOld: 70,
            yOld: 90,
            transX: 0,
            transY: 0,
        });
    }
    RobertaRobot.prototype = Object.create(simulation_robot_ev3_1.default.prototype);
    RobertaRobot.prototype.constructor = RobertaRobot;
    exports.default = RobertaRobot;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3Qucm9iZXJ0YS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvc2ltdWxhdGlvbi9zaW11bGF0aW9uTG9naWMvcm9ib3Qucm9iZXJ0YS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUVBOzs7OztPQUtHO0lBQ0gsU0FBUyxZQUFZO1FBQ2pCLDhCQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNYLENBQUMsRUFBRSxFQUFFO1lBQ0wsQ0FBQyxFQUFFLEVBQUU7WUFDTCxLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksRUFBRSxFQUFFO1lBQ1IsSUFBSSxFQUFFLEVBQUU7WUFDUixNQUFNLEVBQUUsQ0FBQztZQUNULE1BQU0sRUFBRSxDQUFDO1NBQ1osQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUNELFlBQVksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyw4QkFBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3RELFlBQVksQ0FBQyxTQUFTLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQztJQUVsRCxrQkFBZSxZQUFZLENBQUMifQ==