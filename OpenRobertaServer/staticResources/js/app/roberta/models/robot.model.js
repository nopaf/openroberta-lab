/**
 * Rest calls to the server related to the robot.
 *
 * @module rest/program
 */
define(["require", "exports", "comm"], function (require, exports, COMM) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setRobot = exports.setToken = exports.updateFirmware = void 0;
    /**
     * Update firmware of the robot.
     *
     */
    function updateFirmware(successFn) {
        COMM.json('/admin/updateFirmware', {
            cmd: 'updateFirmware',
        }, successFn, 'update firmware');
    }
    exports.updateFirmware = updateFirmware;
    /**
     * Set token for paring with the robot.
     *
     * @param token
     *            {String} - token for paring
     */
    function setToken(token, successFn) {
        COMM.json('/admin/setToken', {
            cmd: 'setToken',
            token: token,
        }, successFn, "set token '" + token + "'");
    }
    exports.setToken = setToken;
    /**
     * Set robot type
     *
     * @param robot
     *            {String} - robot type
     */
    function setRobot(robot, successFn) {
        return COMM.json('/admin/setRobot', {
            cmd: 'setRobot',
            robot: robot,
        }, successFn, "set robot '" + robot + "'");
    }
    exports.setRobot = setRobot;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3QubW9kZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL3JvYmVydGEvbW9kZWxzL3JvYm90Lm1vZGVsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7Ozs7SUFJSDs7O09BR0c7SUFDSCxTQUFTLGNBQWMsQ0FBQyxTQUFTO1FBQzdCLElBQUksQ0FBQyxJQUFJLENBQ0wsdUJBQXVCLEVBQ3ZCO1lBQ0ksR0FBRyxFQUFFLGdCQUFnQjtTQUN4QixFQUNELFNBQVMsRUFDVCxpQkFBaUIsQ0FDcEIsQ0FBQztJQUNOLENBQUM7SUFzQ1Esd0NBQWM7SUFwQ3ZCOzs7OztPQUtHO0lBQ0gsU0FBUyxRQUFRLENBQUMsS0FBSyxFQUFFLFNBQVM7UUFDOUIsSUFBSSxDQUFDLElBQUksQ0FDTCxpQkFBaUIsRUFDakI7WUFDSSxHQUFHLEVBQUUsVUFBVTtZQUNmLEtBQUssRUFBRSxLQUFLO1NBQ2YsRUFDRCxTQUFTLEVBQ1QsYUFBYSxHQUFHLEtBQUssR0FBRyxHQUFHLENBQzlCLENBQUM7SUFDTixDQUFDO0lBb0J3Qiw0QkFBUTtJQWxCakM7Ozs7O09BS0c7SUFDSCxTQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUztRQUM5QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQ1osaUJBQWlCLEVBQ2pCO1lBQ0ksR0FBRyxFQUFFLFVBQVU7WUFDZixLQUFLLEVBQUUsS0FBSztTQUNmLEVBQ0QsU0FBUyxFQUNULGFBQWEsR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUM5QixDQUFDO0lBQ04sQ0FBQztJQUVrQyw0QkFBUSJ9