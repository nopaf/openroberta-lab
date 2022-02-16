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
define(["require", "exports", "./interpreter.aRobotBehaviour", "./interpreter.constants", "./interpreter.util", "util"], function (require, exports, interpreter_aRobotBehaviour_1, C, U, UTIL) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RobotMbedBehaviour = void 0;
    var RobotMbedBehaviour = /** @class */ (function (_super) {
        __extends(RobotMbedBehaviour, _super);
        function RobotMbedBehaviour() {
            var _this = _super.call(this) || this;
            _this.hardwareState.motors = {};
            U.loggingEnabled(false, false);
            return _this;
        }
        RobotMbedBehaviour.prototype.getSample = function (s, name, sensor, port, mode) {
            var robotText = 'robot: ' + name + ', port: ' + port + ', mode: ' + mode;
            U.debug(robotText + ' getsample from ' + sensor);
            var sensorName = sensor;
            if (sensorName == C.TIMER) {
                s.push(this.timerGet(port));
            }
            else if (sensorName == C.ENCODER_SENSOR_SAMPLE) {
                s.push(this.getEncoderValue(mode, port));
            }
            else {
                //workaround due to mbots sensor names
                if (name == 'mbot') {
                    port = 'ORT_' + port;
                }
                s.push(this.getSensorValue(sensorName, port, mode));
            }
        };
        RobotMbedBehaviour.prototype.getEncoderValue = function (mode, port) {
            var sensor = this.hardwareState.sensors.encoder;
            port = port == C.MOTOR_LEFT ? C.LEFT : C.RIGHT;
            if (port != undefined) {
                var v = sensor[port];
                if (v === undefined) {
                    return 'undefined';
                }
                else {
                    return this.rotation2Unit(v, mode);
                }
            }
            return sensor;
        };
        RobotMbedBehaviour.prototype.rotation2Unit = function (value, unit) {
            switch (unit) {
                case C.DEGREE:
                    return value;
                case C.ROTATIONS:
                    return value / 360.0;
                case C.DISTANCE:
                    return (value * C.WHEEL_DIAMETER * Math.PI) / 360.0;
                default:
                    return 0;
            }
        };
        RobotMbedBehaviour.prototype.getSensorValue = function (sensorName, port, mode) {
            var sensor = this.hardwareState.sensors[sensorName];
            if (sensor === undefined) {
                return 'undefined';
            }
            var v;
            if (mode != undefined) {
                if (port != undefined) {
                    v = sensor[port][mode];
                    if (sensorName === 'gyro' && mode === 'angle') {
                        var reset = this.hardwareState['angleReset'];
                        if (reset != undefined) {
                            var resetValue = reset[port];
                            if (resetValue != undefined) {
                                var value = +v;
                                value = value - resetValue;
                                if (value < 0) {
                                    value = value + 360;
                                }
                                v = '' + value;
                            }
                        }
                    }
                }
                else {
                    v = sensor[mode];
                }
            }
            else if (port != undefined) {
                if (mode === undefined) {
                    v = sensor[port];
                }
            }
            else {
                return sensor;
            }
            if (v === undefined) {
                return false;
            }
            else {
                return v;
            }
        };
        RobotMbedBehaviour.prototype.encoderReset = function (port) {
            U.debug('encoderReset for ' + port);
            this.hardwareState.actions.encoder = {};
            if (port == C.MOTOR_LEFT) {
                this.hardwareState.actions.encoder.leftReset = true;
            }
            else {
                this.hardwareState.actions.encoder.rightReset = true;
            }
        };
        RobotMbedBehaviour.prototype.timerReset = function (port) {
            this.hardwareState.timers[port] = Date.now();
            U.debug('timerReset for ' + port);
        };
        RobotMbedBehaviour.prototype.timerGet = function (port) {
            var now = Date.now();
            var startTime = this.hardwareState.timers[port];
            if (startTime === undefined) {
                startTime = this.hardwareState.timers['start'];
            }
            var delta = now - startTime;
            U.debug('timerGet for ' + port + ' returned ' + delta);
            return delta;
        };
        RobotMbedBehaviour.prototype.ledOnAction = function (name, port, color) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' led on color ' + color);
            this.hardwareState.actions.led = {};
            this.hardwareState.actions.led.color = color;
        };
        RobotMbedBehaviour.prototype.statusLightOffAction = function (name, port) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' led off');
            if (name === 'mbot') {
                if (!this.hardwareState.actions.leds) {
                    this.hardwareState.actions.leds = {};
                }
                this.hardwareState.actions.leds[port] = {};
                this.hardwareState.actions.leds[port].mode = C.OFF;
            }
            else {
                this.hardwareState.actions.led = {};
                this.hardwareState.actions.led.mode = C.OFF;
            }
        };
        RobotMbedBehaviour.prototype.toneAction = function (name, frequency, duration) {
            U.debug(name + ' piezo: ' + ', frequency: ' + frequency + ', duration: ' + duration);
            this.hardwareState.actions.tone = {};
            this.hardwareState.actions.tone.frequency = frequency;
            this.hardwareState.actions.tone.duration = duration;
            this.setBlocking(true);
            return 0;
        };
        RobotMbedBehaviour.prototype.playFileAction = function (file) {
            U.debug('play file: ' + file);
            this.hardwareState.actions.tone = {};
            this.hardwareState.actions.tone.file = file;
            switch (file) {
                case '0':
                    return 1000;
                case '1':
                    return 350;
                case '2':
                    return 700;
                case '3':
                    return 700;
                case '4':
                    return 500;
            }
        };
        RobotMbedBehaviour.prototype.setVolumeAction = function (volume) {
            U.debug('set volume: ' + volume);
            this.hardwareState.actions.volume = Math.max(Math.min(100, volume), 0);
            this.hardwareState.volume = Math.max(Math.min(100, volume), 0);
        };
        RobotMbedBehaviour.prototype.getVolumeAction = function (s) {
            U.debug('get volume');
            s.push(this.hardwareState.volume);
        };
        RobotMbedBehaviour.prototype.setLanguage = function (language) {
            U.debug('set language ' + language);
            this.hardwareState.actions.language = language;
        };
        RobotMbedBehaviour.prototype.sayTextAction = function (text, speed, pitch) {
            if (this.hardwareState.actions.sayText == undefined) {
                this.hardwareState.actions.sayText = {};
            }
            this.hardwareState.actions.sayText.text = text;
            this.hardwareState.actions.sayText.speed = speed;
            this.hardwareState.actions.sayText.pitch = pitch;
            this.setBlocking(true);
            return 0;
        };
        RobotMbedBehaviour.prototype.motorOnAction = function (name, port, duration, speed) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            var durText = duration === undefined ? ' w.o. duration' : ' for ' + duration + ' msec';
            U.debug(robotText + ' motor speed ' + speed + durText);
            if (this.hardwareState.actions.motors == undefined) {
                this.hardwareState.actions.motors = {};
            }
            this.hardwareState.actions.motors[port] = speed;
            this.hardwareState.motors[port] = speed;
            return 0;
        };
        RobotMbedBehaviour.prototype.motorStopAction = function (name, port) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' motor stop');
            this.motorOnAction(name, port, 0, 0);
        };
        RobotMbedBehaviour.prototype.driveAction = function (name, direction, speed, distance, time) {
            var robotText = 'robot: ' + name + ', direction: ' + direction;
            var durText = distance === undefined ? ' w.o. duration' : ' for ' + distance + ' msec';
            U.debug(robotText + ' motor speed ' + speed + durText);
            if (this.hardwareState.actions.motors == undefined) {
                this.hardwareState.actions.motors = {};
            }
            // This is to handle negative values entered in the distance parameter in the drive block
            if ((direction != C.FOREWARD && distance > 0) || (direction == C.FOREWARD && distance < 0) || (direction != C.FOREWARD && !distance)) {
                speed *= -1;
            }
            // This is to handle 0 distance being passed in
            if (distance === 0) {
                speed = 0;
            }
            this.hardwareState.actions.motors[C.MOTOR_LEFT] = speed;
            this.hardwareState.actions.motors[C.MOTOR_RIGHT] = speed;
            this.hardwareState.motors[C.MOTOR_LEFT] = speed;
            this.hardwareState.motors[C.MOTOR_RIGHT] = speed;
            if (time !== undefined) {
                return time;
            }
            var rotationPerSecond = (C.MAX_ROTATION * Math.abs(speed)) / 100.0;
            if (rotationPerSecond == 0.0 || distance === undefined) {
                return 0;
            }
            else {
                var rotations = Math.abs(distance) / (C.WHEEL_DIAMETER * Math.PI);
                return (rotations / rotationPerSecond) * 1000;
            }
        };
        RobotMbedBehaviour.prototype.curveAction = function (name, direction, speedL, speedR, distance, time) {
            var robotText = 'robot: ' + name + ', direction: ' + direction;
            var durText = distance === undefined ? ' w.o. duration' : ' for ' + distance + ' msec';
            U.debug(robotText + ' left motor speed ' + speedL + ' right motor speed ' + speedR + durText);
            if (this.hardwareState.actions.motors == undefined) {
                this.hardwareState.actions.motors = {};
            }
            // This is to handle negative values entered in the distance parameter in the steer block
            if ((direction != C.FOREWARD && distance > 0) || (direction == C.FOREWARD && distance < 0) || (direction != C.FOREWARD && !distance)) {
                speedL *= -1;
                speedR *= -1;
            }
            // This is to handle 0 distance being passed in
            if (distance === 0) {
                speedR = 0;
                speedL = 0;
            }
            this.hardwareState.actions.motors[C.MOTOR_LEFT] = speedL;
            this.hardwareState.actions.motors[C.MOTOR_RIGHT] = speedR;
            this.hardwareState.motors[C.MOTOR_LEFT] = speedL;
            this.hardwareState.motors[C.MOTOR_RIGHT] = speedR;
            var avgSpeed = 0.5 * (Math.abs(speedL) + Math.abs(speedR));
            if (time !== undefined) {
                return time;
            }
            var rotationPerSecond = (C.MAX_ROTATION * avgSpeed) / 100.0;
            if (rotationPerSecond == 0.0 || distance === undefined) {
                return 0;
            }
            else {
                var rotations = Math.abs(distance) / (C.WHEEL_DIAMETER * Math.PI);
                return (rotations / rotationPerSecond) * 1000;
            }
        };
        RobotMbedBehaviour.prototype.turnAction = function (name, direction, speed, angle, time) {
            var robotText = 'robot: ' + name + ', direction: ' + direction;
            var durText = angle === undefined ? ' w.o. duration' : ' for ' + angle + ' msec';
            U.debug(robotText + ' motor speed ' + speed + durText);
            if (this.hardwareState.actions.motors == undefined) {
                this.hardwareState.actions.motors = {};
            }
            // This is to handle negative values entered in the degree parameter in the turn block
            if ((direction == C.LEFT && angle < 0) || (direction == C.RIGHT && angle < 0)) {
                speed *= -1;
            }
            // This is to handle an angle of 0 being passed in
            if (angle === 0) {
                speed = 0;
            }
            this.setTurnSpeed(speed, direction);
            if (time !== undefined) {
                return time;
            }
            var rotationPerSecond = (C.MAX_ROTATION * Math.abs(speed)) / 100.0;
            if (rotationPerSecond == 0.0 || angle === undefined) {
                return 0;
            }
            else {
                var rotations = C.TURN_RATIO * (Math.abs(angle) / 720);
                return (rotations / rotationPerSecond) * 1000;
            }
        };
        RobotMbedBehaviour.prototype.setTurnSpeed = function (speed, direction) {
            if (direction == C.LEFT) {
                this.hardwareState.actions.motors[C.MOTOR_LEFT] = -speed;
                this.hardwareState.actions.motors[C.MOTOR_RIGHT] = speed;
            }
            else {
                this.hardwareState.actions.motors[C.MOTOR_LEFT] = speed;
                this.hardwareState.actions.motors[C.MOTOR_RIGHT] = -speed;
            }
        };
        RobotMbedBehaviour.prototype.driveStop = function (name) {
            U.debug('robot: ' + name + ' stop motors');
            if (this.hardwareState.actions.motors == undefined) {
                this.hardwareState.actions.motors = {};
            }
            this.hardwareState.actions.motors[C.MOTOR_LEFT] = 0;
            this.hardwareState.actions.motors[C.MOTOR_RIGHT] = 0;
        };
        RobotMbedBehaviour.prototype.getMotorSpeed = function (s, name, port) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' motor get speed');
            var speed = this.hardwareState.motors[port];
            s.push(speed);
        };
        RobotMbedBehaviour.prototype.setMotorSpeed = function (name, port, speed) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' motor speed ' + speed);
            if (this.hardwareState.actions.motors == undefined) {
                this.hardwareState.actions.motors = {};
            }
            this.hardwareState.actions.motors[port] = speed;
            this.hardwareState.motors[port] = speed;
        };
        RobotMbedBehaviour.prototype.showTextAction = function (text, mode) {
            var showText = '' + text;
            U.debug('***** show "' + showText + '" *****');
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display[mode.toLowerCase()] = showText;
            this.setBlocking(true);
            return 0;
        };
        RobotMbedBehaviour.prototype.showTextActionPosition = function (text, x, y) {
            var showText = '' + text;
            U.debug('***** show "' + showText + '" *****');
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display.text = showText;
            this.hardwareState.actions.display.x = x;
            this.hardwareState.actions.display.y = y;
        };
        RobotMbedBehaviour.prototype.showImageAction = function (image, mode) {
            var showImage = '' + image;
            U.debug('***** show "' + showImage + '" *****');
            var imageLen = image.length;
            var duration = 0;
            if (mode == C.ANIMATION) {
                duration = imageLen * 200;
            }
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display.picture = UTIL.clone(image);
            if (mode) {
                this.hardwareState.actions.display.mode = mode.toLowerCase();
            }
            return duration;
        };
        RobotMbedBehaviour.prototype.displaySetBrightnessAction = function (value) {
            U.debug('***** set brightness "' + value + '" *****');
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display[C.BRIGHTNESS] = value;
            return 0;
        };
        RobotMbedBehaviour.prototype.lightAction = function (mode, color, port) {
            U.debug('***** light action mode= "' + mode + ' color=' + color + '" *****');
            if (port !== undefined) {
                if (!this.hardwareState.actions.leds) {
                    this.hardwareState.actions.leds = {};
                }
                this.hardwareState.actions.leds[port] = {};
                this.hardwareState.actions.leds[port][C.MODE] = mode;
                this.hardwareState.actions.leds[port][C.COLOR] = color;
            }
            else {
                this.hardwareState.actions.led = {};
                this.hardwareState.actions.led[C.MODE] = mode;
                this.hardwareState.actions.led[C.COLOR] = color;
            }
        };
        RobotMbedBehaviour.prototype.displaySetPixelBrightnessAction = function (x, y, brightness) {
            U.debug('***** set pixel x="' + x + ', y=' + y + ', brightness=' + brightness + '" *****');
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display[C.PIXEL] = {};
            this.hardwareState.actions.display[C.PIXEL][C.X] = x;
            this.hardwareState.actions.display[C.PIXEL][C.Y] = y;
            this.hardwareState.actions.display[C.PIXEL][C.BRIGHTNESS] = brightness;
            return 0;
        };
        RobotMbedBehaviour.prototype.displayGetPixelBrightnessAction = function (s, x, y) {
            U.debug('***** get pixel x="' + x + ', y=' + y + '" *****');
            var sensor = this.hardwareState.sensors[C.DISPLAY][C.PIXEL];
            s.push(sensor[y][x]);
        };
        RobotMbedBehaviour.prototype.clearDisplay = function () {
            U.debug('clear display');
            this.hardwareState.actions.display = {};
            this.hardwareState.actions.display.clear = true;
        };
        RobotMbedBehaviour.prototype.writePinAction = function (pin, mode, value) {
            this.hardwareState.actions['pin' + pin] = {};
            this.hardwareState.actions['pin' + pin][mode] = {};
            this.hardwareState.actions['pin' + pin][mode] = value;
        };
        RobotMbedBehaviour.prototype.gyroReset = function (_port) {
            var gyro = this.hardwareState.sensors['gyro'];
            if (gyro !== undefined) {
                var port = gyro[_port];
                if (port !== undefined) {
                    var angle = port['angle'];
                    if (angle !== undefined) {
                        if (this.hardwareState['angleReset'] == undefined) {
                            this.hardwareState['angleReset'] = {};
                        }
                        this.hardwareState['angleReset'][_port] = angle;
                    }
                }
            }
        };
        RobotMbedBehaviour.prototype.getState = function () {
            return this.hardwareState;
        };
        RobotMbedBehaviour.prototype.debugAction = function (value) {
            U.debug('***** debug action "' + value + '" *****');
            console.log(value);
        };
        RobotMbedBehaviour.prototype.assertAction = function (_msg, _left, _op, _right, value) {
            U.debug('***** assert action "' + value + ' ' + _msg + ' ' + _left + ' ' + _op + ' ' + _right + '" *****');
            console.assert(value, _msg + ' ' + _left + ' ' + _op + ' ' + _right);
        };
        RobotMbedBehaviour.prototype.close = function () { };
        return RobotMbedBehaviour;
    }(interpreter_aRobotBehaviour_1.ARobotBehaviour));
    exports.RobotMbedBehaviour = RobotMbedBehaviour;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJwcmV0ZXIucm9ib3RTaW1CZWhhdmlvdXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL25lcG9zdGFja21hY2hpbmUvaW50ZXJwcmV0ZXIucm9ib3RTaW1CZWhhdmlvdXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztJQU1BO1FBQXdDLHNDQUFlO1FBQ25EO1lBQUEsWUFDSSxpQkFBTyxTQUdWO1lBRkcsS0FBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQy9CLENBQUMsQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDOztRQUNuQyxDQUFDO1FBRU0sc0NBQVMsR0FBaEIsVUFBaUIsQ0FBUSxFQUFFLElBQVksRUFBRSxNQUFjLEVBQUUsSUFBUyxFQUFFLElBQVk7WUFDNUUsSUFBSSxTQUFTLEdBQUcsU0FBUyxHQUFHLElBQUksR0FBRyxVQUFVLEdBQUcsSUFBSSxHQUFHLFVBQVUsR0FBRyxJQUFJLENBQUM7WUFDekUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLEdBQUcsa0JBQWtCLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDakQsSUFBSSxVQUFVLEdBQUcsTUFBTSxDQUFDO1lBRXhCLElBQUksVUFBVSxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUU7Z0JBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQy9CO2lCQUFNLElBQUksVUFBVSxJQUFJLENBQUMsQ0FBQyxxQkFBcUIsRUFBRTtnQkFDOUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQzVDO2lCQUFNO2dCQUNILHNDQUFzQztnQkFDdEMsSUFBSSxJQUFJLElBQUksTUFBTSxFQUFFO29C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