define(["require", "exports", "simulation.simulation"], function (require, exports, SIM) {
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Creates a new robot for a simulation.
     *
     * This robot is a differential drive robot. It has two wheels directly
     * connected to motors and several sensors. Each component of the robot has
     * a position in the robots coordinate system. The robot itself has a pose
     * in the global coordinate system (x, y, theta).
     *
     * @class
     */
    function Robot(pose, robotBehaviour) {
        this.pose = pose;
        this.robotBehaviour = robotBehaviour;
        this.initialPose = {
            x: pose.x,
            y: pose.y,
            theta: pose.theta,
            transX: pose.transX,
            transY: pose.transY,
        };
        this.mouse = {
            x: 0,
            y: 5,
            rx: 0,
            ry: 0,
            r: 30,
        };
        this.time = 0;
        this.timer = {};
        this.debug = false;
        var webAudio = SIM.getWebAudio();
        this.webAudio = {
            context: webAudio.context,
            oscillator: webAudio.oscillator,
            gainNode: webAudio.gainNode,
            volume: 0.5,
        };
    }
    Robot.prototype.replaceState = function (robotBehaviour) {
        this.robotBehaviour = robotBehaviour;
    };
    Robot.prototype.resetPose = function () {
        this.pose.x = this.initialPose.x;
        this.pose.y = this.initialPose.y;
        this.pose.theta = this.initialPose.theta;
        this.pose.xOld = this.initialPose.x;
        this.pose.yOld = this.initialPose.y;
        this.pose.thetaOld = this.initialPose.theta;
        this.pose.transX = this.initialPose.transX;
        this.pose.transY = this.initialPose.transY;
        this.debug = false;
    };
    Robot.prototype.reset = null;
    Robot.prototype.update = null;
    exports.default = Robot;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL3NpbXVsYXRpb24vc2ltdWxhdGlvbkxvZ2ljL3JvYm90LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBR0E7Ozs7Ozs7OztPQVNHO0lBQ0gsU0FBUyxLQUFLLENBQUMsSUFBSSxFQUFFLGNBQWM7UUFDL0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7UUFDckMsSUFBSSxDQUFDLFdBQVcsR0FBRztZQUNmLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNULENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNULEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07WUFDbkIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1NBQ3RCLENBQUM7UUFDRixJQUFJLENBQUMsS0FBSyxHQUFHO1lBQ1QsQ0FBQyxFQUFFLENBQUM7WUFDSixDQUFDLEVBQUUsQ0FBQztZQUNKLEVBQUUsRUFBRSxDQUFDO1lBQ0wsRUFBRSxFQUFFLENBQUM7WUFDTCxDQUFDLEVBQUUsRUFBRTtTQUNSLENBQUM7UUFDRixJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNkLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBRW5CLElBQUksUUFBUSxHQUFHLEdBQUcsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVqQyxJQUFJLENBQUMsUUFBUSxHQUFHO1lBQ1osT0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPO1lBQ3pCLFVBQVUsRUFBRSxRQUFRLENBQUMsVUFBVTtZQUMvQixRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7WUFDM0IsTUFBTSxFQUFFLEdBQUc7U0FDZCxDQUFDO0lBQ04sQ0FBQztJQUVELEtBQUssQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFVBQVUsY0FBYztRQUNuRCxJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztJQUN6QyxDQUFDLENBQUM7SUFDRixLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsR0FBRztRQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUM1QyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUMzQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUMzQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUN2QixDQUFDLENBQUM7SUFDRixLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDN0IsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0lBRTlCLGtCQUFlLEtBQUssQ0FBQyJ9