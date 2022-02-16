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
    exports.RobotWeDoBehaviour = void 0;
    var RobotWeDoBehaviour = /** @class */ (function (_super) {
        __extends(RobotWeDoBehaviour, _super);
        function RobotWeDoBehaviour(btInterfaceFct, toDisplayFct) {
            var _this = _super.call(this) || this;
            _this.wedo = {};
            _this.tiltMode = {
                UP: '3.0',
                DOWN: '9.0',
                BACK: '5.0',
                FRONT: '7.0',
                NO: '0.0',
            };
            _this.btInterfaceFct = btInterfaceFct;
            _this.toDisplayFct = toDisplayFct;
            _this.timers = {};
            _this.timers['start'] = Date.now();
            U.loggingEnabled(true, true);
            return _this;
        }
        RobotWeDoBehaviour.prototype.update = function (data) {
            U.info('update type:' + data.type + ' state:' + data.state + ' sensor:' + data.sensor + ' actor:' + data.actuator);
            if (data.target !== 'wedo') {
                return;
            }
            switch (data.type) {
                case 'connect':
                    if (data.state == 'connected') {
                        this.wedo[data.brickid] = {};
                        this.wedo[data.brickid]['brickname'] = data.brickname.replace(/\s/g, '').toUpperCase();
                        // for some reason we do not get the inital state of the button, so here it is hardcoded
                        this.wedo[data.brickid]['button'] = 'false';
                    }
                    else if (data.state == 'disconnected') {
                        delete this.wedo[data.brickid];
                    }
                    break;
                case 'didAddService':
                    var theWedoA = this.wedo[data.brickid];
                    if (data.state == 'connected') {
                        if (data.id && data.sensor) {
                            theWedoA[data.id] = {};
                            theWedoA[data.id][this.finalName(data.sensor)] = '';
                        }
                        else if (data.id && data.actuator) {
                            theWedoA[data.id] = {};
                            theWedoA[data.id][this.finalName(data.actuator)] = '';
                        }
                        else if (data.sensor) {
                            theWedoA[this.finalName(data.sensor)] = '';
                        }
                        else {
                            theWedoA[this.finalName(data.actuator)] = '';
                        }
                    }
                    break;
                case 'didRemoveService':
                    if (data.id) {
                        delete this.wedo[data.brickid][data.id];
                    }
                    else if (data.sensor) {
                        delete this.wedo[data.brickid][this.finalName(data.sensor)];
                    }
                    else {
                        delete this.wedo[data.brickid][this.finalName(data.actuator)];
                    }
                    break;
                case 'update':
                    var theWedoU = this.wedo[data.brickid];
                    if (data.id) {
                        if (theWedoU[data.id] === undefined) {
                            theWedoU[data.id] = {};
                        }
                        theWedoU[data.id][this.finalName(data.sensor)] = data.state;
                    }
                    else {
                        theWedoU[this.finalName(data.sensor)] = data.state;
                    }
                    break;
                default:
                    // TODO think about what could happen here.
                    break;
            }
            U.info(this.wedo);
        };
        RobotWeDoBehaviour.prototype.getConnectedBricks = function () {
            var brickids = [];
            for (var brickid in this.wedo) {
                if (this.wedo.hasOwnProperty(brickid)) {
                    brickids.push(brickid);
                }
            }
            return brickids;
        };
        RobotWeDoBehaviour.prototype.getBrickIdByName = function (name) {
            for (var brickid in this.wedo) {
                if (this.wedo.hasOwnProperty(brickid)) {
                    if (this.wedo[brickid].brickname === name.toUpperCase()) {
                        return brickid;
                    }
                }
            }
            return null;
        };
        RobotWeDoBehaviour.prototype.getBrickById = function (id) {
            return this.wedo[id];
        };
        RobotWeDoBehaviour.prototype.clearDisplay = function () {
            U.debug('clear display');
            this.toDisplayFct({ clear: true });
        };
        RobotWeDoBehaviour.prototype.getSample = function (s, name, sensor, port, slot) {
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.info(robotText + ' getsample called for ' + sensor);
            var sensorName;
            switch (sensor) {
                case 'infrared':
                    sensorName = 'motionsensor';
                    break;
                case 'gyro':
                    sensorName = 'tiltsensor';
                    break;
                case 'buttons':
                    sensorName = 'button';
                    break;
                case C.TIMER:
                    s.push(this.timerGet(port));
                    return;
                default:
                    throw 'invalid get sample for ' + name + ' - ' + port + ' - ' + sensor + ' - ' + slot;
            }
            var wedoId = this.getBrickIdByName(name);
            s.push(this.getSensorValue(wedoId, port, sensorName, slot));
        };
        RobotWeDoBehaviour.prototype.getSensorValue = function (wedoId, port, sensor, slot) {
            var theWedo = this.wedo[wedoId];
            var thePort = theWedo[port];
            if (thePort === undefined) {
                thePort = theWedo['1'] !== undefined ? theWedo['1'] : theWedo['2'];
            }
            var theSensor = thePort === undefined ? 'undefined' : thePort[sensor];
            U.info('sensor object ' + (theSensor === undefined ? 'undefined' : theSensor.toString()));
            switch (sensor) {
                case 'tiltsensor':
                    if (slot === 'ANY') {
                        return parseInt(theSensor) !== parseInt(this.tiltMode.NO);
                    }
                    else {
                        return parseInt(theSensor) === parseInt(this.tiltMode[slot]);
                    }
                case 'motionsensor':
                    return parseInt(theSensor);
                case 'button':
                    return theWedo.button === 'true';
            }
        };
        RobotWeDoBehaviour.prototype.finalName = function (notNormalized) {
            if (notNormalized !== undefined) {
                return notNormalized.replace(/\s/g, '').toLowerCase();
            }
            else {
                U.info('sensor name undefined');
                return 'undefined';
            }
        };
        RobotWeDoBehaviour.prototype.timerReset = function (port) {
            this.timers[port] = Date.now();
            U.debug('timerReset for ' + port);
        };
        RobotWeDoBehaviour.prototype.timerGet = function (port) {
            var now = Date.now();
            var startTime = this.timers[port];
            if (startTime === undefined) {
                startTime = this.timers['start'];
            }
            var delta = now - startTime;
            U.debug('timerGet for ' + port + ' returned ' + delta);
            return delta;
        };
        RobotWeDoBehaviour.prototype.ledOnAction = function (name, port, color) {
            var brickid = this.getBrickIdByName(name);
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' led on color ' + color);
            var cmd = { target: 'wedo', type: 'command', actuator: 'light', brickid: brickid, color: color };
            this.btInterfaceFct(cmd);
        };
        RobotWeDoBehaviour.prototype.statusLightOffAction = function (name, port) {
            var brickid = this.getBrickIdByName(name);
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' led off');
            var cmd = { target: 'wedo', type: 'command', actuator: 'light', brickid: brickid, color: 0 };
            this.btInterfaceFct(cmd);
        };
        RobotWeDoBehaviour.prototype.toneAction = function (name, frequency, duration) {
            var brickid = this.getBrickIdByName(name); // TODO: better style
            var robotText = 'robot: ' + name;
            U.debug(robotText + ' piezo: ' + ', frequency: ' + frequency + ', duration: ' + duration);
            var cmd = { target: 'wedo', type: 'command', actuator: 'piezo', brickid: brickid, frequency: Math.floor(frequency), duration: Math.floor(duration) };
            this.btInterfaceFct(cmd);
            return duration;
        };
        RobotWeDoBehaviour.prototype.motorOnAction = function (name, port, duration, speed) {
            var brickid = this.getBrickIdByName(name); // TODO: better style
            var robotText = 'robot: ' + name + ', port: ' + port;
            var durText = duration === undefined ? ' w.o. duration' : ' for ' + duration + ' msec';
            U.debug(robotText + ' motor speed ' + speed + durText);
            var cmd = {
                target: 'wedo',
                type: 'command',
                actuator: 'motor',
                brickid: brickid,
                action: 'on',
                id: port,
                direction: speed < 0 ? 1 : 0,
                power: Math.abs(speed),
            };
            this.btInterfaceFct(cmd);
            return 0;
        };
        RobotWeDoBehaviour.prototype.motorStopAction = function (name, port) {
            var brickid = this.getBrickIdByName(name); // TODO: better style
            var robotText = 'robot: ' + name + ', port: ' + port;
            U.debug(robotText + ' motor stop');
            var cmd = { target: 'wedo', type: 'command', actuator: 'motor', brickid: brickid, action: 'stop', id: port };
            this.btInterfaceFct(cmd);
        };
        RobotWeDoBehaviour.prototype.showTextAction = function (text, _mode) {
            var showText = '' + text;
            U.debug('***** show "' + showText + '" *****');
            this.toDisplayFct({ show: showText });
            return 0;
        };
        RobotWeDoBehaviour.prototype.showImageAction = function (_text, _mode) {
            U.debug('***** show image not supported by WeDo *****');
            return 0;
        };
        RobotWeDoBehaviour.prototype.displaySetBrightnessAction = function (_value) {
            return 0;
        };
        RobotWeDoBehaviour.prototype.displaySetPixelAction = function (_x, _y, _brightness) {
            return 0;
        };
        RobotWeDoBehaviour.prototype.writePinAction = function (_pin, _mode, _value) { };
        RobotWeDoBehaviour.prototype.close = function () {
            var ids = this.getConnectedBricks();
            for (var id in ids) {
                if (ids.hasOwnProperty(id)) {
                    var name = this.getBrickById(ids[id]).brickname;
                    this.motorStopAction(name, 1);
                    this.motorStopAction(name, 2);
                    this.ledOnAction(name, 99, 3);
                }
            }
        };
        RobotWeDoBehaviour.prototype.encoderReset = function (_port) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype.gyroReset = function (_port) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype.lightAction = function (_mode, _color, _port) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype.playFileAction = function (_file) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype._setVolumeAction = function (_volume) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype._getVolumeAction = function (_s) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype.setLanguage = function (_language) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype.sayTextAction = function (_text, _speed, _pitch) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype.getMotorSpeed = function (_s, _name, _port) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype.setMotorSpeed = function (_name, _port, _speed) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype.driveStop = function (_name) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype.driveAction = function (_name, _direction, _speed, _distance) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype.curveAction = function (_name, _direction, _speedL, _speedR, _distance) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype.turnAction = function (_name, _direction, _speed, _angle) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype.showTextActionPosition = function (_text, _x, _y) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype.displaySetPixelBrightnessAction = function (_x, _y, _brightness) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype.displayGetPixelBrightnessAction = function (_s, _x, _y) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype.setVolumeAction = function (_volume) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype.getVolumeAction = function (_s) {
            throw new Error('Method not implemented.');
        };
        RobotWeDoBehaviour.prototype.debugAction = function (_value) {
            this.showTextAction('> ' + _value, undefined);
        };
        RobotWeDoBehaviour.prototype.assertAction = function (_msg, _left, _op, _right, _value) {
            if (!_value) {
                this.showTextAction('> Assertion failed: ' + _msg + ' ' + _left + ' ' + _op + ' ' + _right, undefined);
            }
        };
        return RobotWeDoBehaviour;
    }(interpreter_aRobotBehaviour_1.ARobotBehaviour));
    exports.RobotWeDoBehaviour = RobotWeDoBehaviour;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJwcmV0ZXIucm9ib3RXZURvQmVoYXZpb3VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vT3BlblJvYmVydGFXZWIvc3JjL2FwcC9uZXBvc3RhY2ttYWNoaW5lL2ludGVycHJldGVyLnJvYm90V2VEb0JlaGF2aW91ci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0lBS0E7UUFBd0Msc0NBQWU7UUFrQm5ELDRCQUFZLGNBQW1CLEVBQUUsWUFBaUI7WUFBbEQsWUFDSSxpQkFBTyxTQU9WO1lBakJPLFVBQUksR0FBRyxFQUFFLENBQUM7WUFDVixjQUFRLEdBQUc7Z0JBQ2YsRUFBRSxFQUFFLEtBQUs7Z0JBQ1QsSUFBSSxFQUFFLEtBQUs7Z0JBQ1gsSUFBSSxFQUFFLEtBQUs7Z0JBQ1gsS0FBSyxFQUFFLEtBQUs7Z0JBQ1osRUFBRSxFQUFFLEtBQUs7YUFDWixDQUFDO1lBSUUsS0FBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7WUFDckMsS0FBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7WUFDakMsS0FBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDakIsS0FBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFbEMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7O1FBQ2pDLENBQUM7UUFFTSxtQ0FBTSxHQUFiLFVBQWMsSUFBSTtZQUNkLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNuSCxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO2dCQUN4QixP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