define(["require", "exports", "simulation.robot.ev3"], function (require, exports, simulation_robot_ev3_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    function MathRobot() {
        simulation_robot_ev3_1.default.call(this, {
            x: 400,
            y: 250,
            theta: 0,
            xOld: 400,
            yOld: 250,
            transX: -400,
            transY: -250,
        });
        this.canDraw = true;
        this.drawColor = '#ffffff';
        this.drawWidth = 1;
    }
    MathRobot.prototype = Object.create(simulation_robot_ev3_1.default.prototype);
    MathRobot.prototype.constructor = MathRobot;
    exports.default = MathRobot;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3QubWF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvc2ltdWxhdGlvbi9zaW11bGF0aW9uTG9naWMvcm9ib3QubWF0aC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUVBLFNBQVMsU0FBUztRQUNkLDhCQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNYLENBQUMsRUFBRSxHQUFHO1lBQ04sQ0FBQyxFQUFFLEdBQUc7WUFDTixLQUFLLEVBQUUsQ0FBQztZQUNSLElBQUksRUFBRSxHQUFHO1lBQ1QsSUFBSSxFQUFFLEdBQUc7WUFDVCxNQUFNLEVBQUUsQ0FBQyxHQUFHO1lBQ1osTUFBTSxFQUFFLENBQUMsR0FBRztTQUNmLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQzNCLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxTQUFTLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsOEJBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNuRCxTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUM7SUFFNUMsa0JBQWUsU0FBUyxDQUFDIn0=