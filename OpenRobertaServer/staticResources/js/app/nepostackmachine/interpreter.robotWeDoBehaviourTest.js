var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./interpreter.aRobotBehaviour", "./interpreter.constants", "./interpreter.util"], function (require, exports, interpreter_aRobotBehaviour_1, C, U) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RobotWeDoBehaviourTest = void 0;
    var RobotWeDoBehaviourTest = /** @class */ (function (_super) {
        __extends(RobotWeDoBehaviourTest, _super);
        function RobotWeDoBehaviourTest(opLog, debug) {
            var _this = _super.call(this) || this;
            _this.timers = {};
            _this.timers['start'] = Date.now();
            U.loggingEnabled(opLog, debug);
            return _this;
        }
        RobotWeDoBehaviourTest.prototype.clearDisplay = function () {
            U.debug('clear display');
        };
        RobotWeDoBehaviourTest.prototype.getSample = function (s, name, sensor, port, mode) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' getsample from ' + sensor);
            switch (sensor) {
                case 'infrared':
                    s.push(5);
                    break;
                case 'gyro':
                    s.push(3);
                    break;
                case 'buttons':
                    s.push(true);
                    break;
                case C.TIMER:
                    s.push(this.timerGet(port));
                    break;
                default:
                    throw 'invalid get sample for ' + name + ' - ' + port + ' - ' + sensor + ' - ' + mode;
            }
        };
        RobotWeDoBehaviourTest.prototype.timerReset = function (port) {
            this.timers[port] = Date.now();
            U.debug('timerReset for ' + port);
        };
        RobotWeDoBehaviourTest.prototype.timerGet = function (port) {
            var now = Date.now();
            var startTime = this.timers[port];
            if (startTime === undefined) {
                startTime = this.timers['start'];
            }
            var delta = now - startTime;
            U.debug('timerGet for ' + port + ' returned ' + delta);
            return delta;
        };
        RobotWeDoBehaviourTest.prototype.ledOnAction = function (name, port, color) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.info(robotText + ' led on color ' + color);
        };
        RobotWeDoBehaviourTest.prototype.statusLightOffAction = function (name, port) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.info(robotText + ' led off');
        };
        RobotWeDoBehaviourTest.prototype.toneAction = function (name, frequency, duration) {
            var robotText = 'robot: ' + name;
            U.info(robotText + ' piezo: ' + ', frequency: ' + frequency + ', duration: ' + duration);
            return duration;
        };
        RobotWeDoBehaviourTest.prototype.motorOnAction = function (name, port, duration, speed) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            var durText = duration === undefined ? ' w.o. duration' : ' for ' + duration + ' msec';
            U.info(robotText + ' motor speed ' + speed + durText);
            return 0;
        };
        RobotWeDoBehaviourTest.prototype.motorStopAction = function (name, port) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.info(robotText + ' motor stop');
        };
        RobotWeDoBehaviourTest.prototype.showTextAction = function (text) {
            var showText = '' + text;
            U.info('show "' + showText + '"');
            return 0;
        };
        RobotWeDoBehaviourTest.prototype.writePinAction = function (_pin, _mode, _value) { };
        RobotWeDoBehaviourTest.prototype.showImageAction = function (_1, _2) {
            U.info('show image NYI');
            return 0;
        };
        RobotWeDoBehaviourTest.prototype.displaySetBrightnessAction = function (_value) {
            return 0;
        };
        RobotWeDoBehaviourTest.prototype.displaySetPixelAction = function (_x, _y, _brightness) {
            return 0;
        };
        RobotWeDoBehaviourTest.prototype.close = function () {
            // CI implementation. No real robot. No motor off, etc.
        };
        RobotWeDoBehaviourTest.prototype.encoderReset = function (_port) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype.gyroReset = function (_port) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype.lightAction = function (_mode, _color, _port) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype.playFileAction = function (_file) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype._setVolumeAction = function (_volume) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype._getVolumeAction = function (_s) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype.setLanguage = function (_language) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype.sayTextAction = function (_text, _speed, _pitch) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype.getMotorSpeed = function (_s, _name, _port) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype.setMotorSpeed = function (_name, _port, _speed) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype.driveStop = function (_name) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype.driveAction = function (_name, _direction, _speed, _distance) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype.curveAction = function (_name, _direction, _speedL, _speedR, _distance) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype.turnAction = function (_name, _direction, _speed, _angle) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype.showTextActionPosition = function (_text, _x, _y) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype.displaySetPixelBrightnessAction = function (_x, _y, _brightness) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype.displayGetPixelBrightnessAction = function (_s, _x, _y) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype.setVolumeAction = function (_volume) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype.getVolumeAction = function (_s) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviourTest.prototype.debugAction = function (_value) {
            var robotText = '> ' + _value;
            U.info(' debug action ' + robotText);
        };
        RobotWeDoBehaviourTest.prototype.assertAction = function (_msg, _left, _op, _right, _value) {
            var robotText = '> Assertion failed: ' + _msg + ' ' + _left + ' ' + _op + ' ' + _right;
            U.info(' assert action ' + robotText);
        };
        return RobotWeDoBehaviourTest;
    }(interpreter_aRobotBehaviour_1.ARobotBehaviour));
    exports.RobotWeDoBehaviourTest = RobotWeDoBehaviourTest;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJwcmV0ZXIucm9ib3RXZURvQmVoYXZpb3VyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvbmVwb3N0YWNrbWFjaGluZS9pbnRlcnByZXRlci5yb2JvdFdlRG9CZWhhdmlvdXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7SUFLQTtRQUE0QywwQ0FBZTtRQUd2RCxnQ0FBWSxLQUFLLEVBQUUsS0FBSztZQUF4QixZQUNJLGlCQUFPLFNBS1Y7WUFKRyxLQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNqQixLQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUVsQyxDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQzs7UUFDbkMsQ0FBQztRQUVNLDZDQUFZLEdBQW5CO1lBQ0ksQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBRU0sMENBQVMsR0FBaEIsVUFBaUIsQ0FBUSxFQUFFLElBQVksRUFBRSxNQUFjLEVBQUUsSUFBWSxFQUFFLElBQVk7WUFDL0UsSUFBSSxTQUFTLEdBQUcsU0FBUyxHQUFHLElBQUksR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3JELENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxDQUFDO1lBQ2pELFFBQVEsTUFBTSxFQUFFO2dCQUNaLEtBQUssVUFBVTtvQkFDWCxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNWLE1BQU07Z0JBQ1YsS0FBSyxNQUFNO29CQUNQLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ1YsTUFBTTtnQkFDVixLQUFLLFNBQVM7b0JBQ1YsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDYixNQUFNO2dCQUNWLEtBQUssQ0FBQyxDQUFDLEtBQUs7b0JBQ1IsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7b0JBQzVCLE1BQU07Z0JBQ1Y7b0JBQ0ksTUFBTSx5QkFBeUIsR0FBRyxJQUFJLEdBQUcsS0FBSyxHQUFHLElBQUksR0FBRyxLQUFLLEdBQUcsTUFBTSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUM7YUFDN0Y7UUFDTCxDQUFDO1FBRU0sMkNBQVUsR0FBakIsVUFBa0IsSUFBWTtZQUMxQixJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUMvQixDQUFDLENBQUMsS0FBSyxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3RDLENBQUM7UUFFTSx5Q0FBUSxHQUFmLFVBQWdCLElBQVk7WUFDeEIsSUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3ZCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEMsSUFBSSxTQUFTLEtBQUssU0FBUyxFQUFFO2dCQUN6QixTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUNwQztZQUNELElBQU0sS0FBSyxHQUFHLEdBQUcsR0FBRyxTQUFTLENBQUM7WUFDOUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsSUFBSSxHQUFHLFlBQVksR0FBRyxLQUFLLENBQUMsQ0FBQztZQUN2RCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDO1FBRU0sNENBQVcsR0FBbEIsVUFBbUIsSUFBWSxFQUFFLElBQVksRUFBRSxLQUFhO1lBQ3hELElBQU0sU0FBUyxHQUFHLFNBQVMsR0FBRyxJQUFJLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN2RCxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBRU0scURBQW9CLEdBQTNCLFVBQTRCLElBQVksRUFBRSxJQUFZO1lBQ2xELElBQU0sU0FBUyxHQUFHLFNBQVMsR0FBRyxJQUFJLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN2RCxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLENBQUMsQ0FBQztRQUNuQyxDQUFDO1FBRU0sMkNBQVUsR0FBakIsVUFBa0IsSUFBWSxFQUFFLFNBQWlCLEVBQUUsUUFBZ0I7WUFDL0QsSUFBTSxTQUFTLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQztZQUNuQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLEdBQUcsZUFBZSxHQUFHLFNBQVMsR0FBRyxjQUFjLEdBQUcsUUFBUSxDQUFDLENBQUM7WUFDekYsT0FBTyxRQUFRLENBQUM7UUFDcEIsQ0FBQztRQUVNLDhDQUFhLEdBQXBCLFVBQXFCLElBQVksRUFBRSxJQUFZLEVBQUUsUUFBZ0IsRUFBRSxLQUFhO1lBQzVFLElBQU0sU0FBUyxHQUFHLFNBQVMsR0FBRyxJQUFJLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQztZQUN2RCxJQUFNLE9BQU8sR0FBRyxRQUFRLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLFFBQVEsR0FBRyxPQUFPLENBQUM7WUFDekYsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsZUFBZSxHQUFHLEtBQUssR0FBRyxPQUFPLENBQUMsQ0FBQztZQUN0RCxPQUFPLENBQUMsQ0FBQztRQUNiLENBQUM7UUFFTSxnREFBZSxHQUF0QixVQUF1QixJQUFZLEVBQUUsSUFBWTtZQUM3QyxJQUFNLFNBQVMsR0FBRyxTQUFTLEdBQUcsSUFBSSxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDdkQsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsYUFBYSxDQUFDLENBQUM7UUFDdEMsQ0FBQztRQUVNLCtDQUFjLEdBQXJCLFVBQXNCLElBQVM7WUFDM0IsSUFBTSxRQUFRLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztZQUMzQixDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLEdBQUcsR0FBRyxDQUFDLENBQUM7WUFDbEMsT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDO1FBRU0sK0NBQWMsR0FBckIsVUFBc0IsSUFBUyxFQUFFLEtBQWEsRUFBRSxNQUFjLElBQVMsQ0FBQztRQUVqRSxnREFBZSxHQUF0QixVQUF1QixFQUFPLEVBQUUsRUFBVTtZQUN0QyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDekIsT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDO1FBRU0sMkRBQTBCLEdBQWpDLFVBQWtDLE1BQWM7WUFDNUMsT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDO1FBRU0sc0RBQXFCLEdBQTVCLFVBQTZCLEVBQVUsRUFBRSxFQUFVLEVBQUUsV0FBbUI7WUFDcEUsT0FBTyxDQUFDLENBQUM7UUFDYixDQUFDO1FBRU0sc0NBQUssR0FBWjtZQUNJLHVEQUF1RDtRQUMzRCxDQUFDO1FBRU0sNkNBQVksR0FBbkIsVUFBb0IsS0FBYTtZQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVNLDBDQUFTLEdBQWhCLFVBQWlCLEtBQWE7WUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFTSw0Q0FBVyxHQUFsQixVQUFtQixLQUFhLEVBQUUsTUFBYyxFQUFFLEtBQWE7WUFDM0QsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFTSwrQ0FBYyxHQUFyQixVQUFzQixLQUFhO1lBQy9CLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRU0saURBQWdCLEdBQXZCLFVBQXdCLE9BQWU7WUFDbkMsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFTSxpREFBZ0IsR0FBdkIsVUFBd0IsRUFBUztZQUM3QixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVNLDRDQUFXLEdBQWxCLFVBQW1CLFNBQWlCO1lBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRU0sOENBQWEsR0FBcEIsVUFBcUIsS0FBYSxFQUFFLE1BQWMsRUFBRSxNQUFjO1lBQzlELE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRU0sOENBQWEsR0FBcEIsVUFBcUIsRUFBUyxFQUFFLEtBQWEsRUFBRSxLQUFVO1lBQ3JELE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRU0sOENBQWEsR0FBcEIsVUFBcUIsS0FBYSxFQUFFLEtBQVUsRUFBRSxNQUFjO1lBQzFELE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRU0sMENBQVMsR0FBaEIsVUFBaUIsS0FBYTtZQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVNLDRDQUFXLEdBQWxCLFVBQW1CLEtBQWEsRUFBRSxVQUFrQixFQUFFLE1BQWMsRUFBRSxTQUFpQjtZQUNuRixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVNLDRDQUFXLEdBQWxCLFVBQW1CLEtBQWEsRUFBRSxVQUFrQixFQUFFLE9BQWUsRUFBRSxPQUFlLEVBQUUsU0FBaUI7WUFDckcsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFTSwyQ0FBVSxHQUFqQixVQUFrQixLQUFhLEVBQUUsVUFBa0IsRUFBRSxNQUFjLEVBQUUsTUFBYztZQUMvRSxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVNLHVEQUFzQixHQUE3QixVQUE4QixLQUFVLEVBQUUsRUFBVSxFQUFFLEVBQVU7WUFDNUQsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFTSxnRUFBK0IsR0FBdEMsVUFBdUMsRUFBVSxFQUFFLEVBQVUsRUFBRSxXQUFtQjtZQUM5RSxNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVNLGdFQUErQixHQUF0QyxVQUF1QyxFQUFTLEVBQUUsRUFBVSxFQUFFLEVBQVU7WUFDcEUsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQy9DLENBQUM7UUFFTSxnREFBZSxHQUF0QixVQUF1QixPQUFlO1lBQ2xDLE1BQU0sSUFBSSxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztRQUMvQyxDQUFDO1FBRU0sZ0RBQWUsR0FBdEIsVUFBdUIsRUFBUztZQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFDL0MsQ0FBQztRQUVNLDRDQUFXLEdBQWxCLFVBQW1CLE1BQVc7WUFDMUIsSUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLE1BQU0sQ0FBQztZQUNoQyxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFNBQVMsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFFTSw2Q0FBWSxHQUFuQixVQUFvQixJQUFZLEVBQUUsS0FBVSxFQUFFLEdBQVcsRUFBRSxNQUFXLEVBQUUsTUFBVztZQUMvRSxJQUFNLFNBQVMsR0FBRyxzQkFBc0IsR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUM7WUFDekYsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENBQUMsQ0FBQztRQUMxQyxDQUFDO1FBQ0wsNkJBQUM7SUFBRCxDQUFDLEFBOUxELENBQTRDLDZDQUFlLEdBOEwxRDtJQTlMWSx3REFBc0IifQ==