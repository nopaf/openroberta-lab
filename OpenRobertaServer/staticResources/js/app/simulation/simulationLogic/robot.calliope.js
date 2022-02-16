define(["require", "exports", "simulation.simulation", "simulation.robot.mbed", "blockly"], function (require, exports, SIM, simulation_robot_mbed_1, Blockly) {
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Creates a new Calliope device for a simulation.
     *
     * This Calliope is a simple electrical board with some basic actors and
     * sensors.
     *
     * @class
     */
    function Calliope(pose, configuration, num, robotBehaviour) {
        simulation_robot_mbed_1.default.call(this, pose, num, robotBehaviour);
        var that = this;
        this.led = {
            color: 'grey',
            x: 0,
            y: -90,
            r: 10,
            draw: function (canvas) {
                if (this.color != 'grey') {
                    canvas.arc(this.x, this.y, this.r - 5, 0, Math.PI * 2);
                    canvas.fill();
                    var rad = canvas.createRadialGradient(this.x, this.y, this.r - 5, this.x, this.y, this.r + 5);
                    rad.addColorStop(0, 'rgba(' + this.color[0] + ',' + this.color[1] + ',' + this.color[2] + ',1)');
                    rad.addColorStop(1, 'rgba(' + this.color[0] + ',' + this.color[1] + ',' + this.color[2] + ',0)');
                    canvas.fillStyle = rad;
                    canvas.beginPath();
                    canvas.arc(this.x, this.y, this.r + 5, 0, Math.PI * 2);
                    canvas.fill();
                }
            },
        };
        this.motorA = {
            // Copyright (C) Ken Fyrstenberg / Epistemex
            // MIT license (header required)
            cx: -45,
            cy: -130,
            theta: 0,
            color: 'grey',
            draw: function (canvas) {
                var notches = 7, // num. of notches
                radiusO = 20, // outer radius
                radiusI = 15, // inner radius
                radiusH = 10, // hole radius
                taperO = 50, // outer taper %
                taperI = 30, // inner taper %
                pi2 = 2 * Math.PI, // cache 2xPI (360deg)
                angle = pi2 / (notches * 2), // angle between notches
                taperAI = angle * taperI * 0.005, // inner taper offset
                taperAO = angle * taperO * 0.005, // outer taper offset
                a = angle, // iterator (angle)
                toggle = false; // notch radis (i/o)
                // starting point
                canvas.save();
                canvas.beginPath();
                canvas.translate(this.cx, this.cy);
                canvas.rotate(-this.theta);
                canvas.beginPath();
                canvas.moveTo(radiusO * Math.cos(taperAO), radiusO * Math.sin(taperAO));
                // loop
                toogle = false;
                a = angle;
                for (; a <= pi2; a += angle) {
                    // draw inner part
                    if (toggle) {
                        canvas.lineTo(radiusI * Math.cos(a - taperAI), radiusI * Math.sin(a - taperAI));
                        canvas.lineTo(radiusO * Math.cos(a + taperAO), radiusO * Math.sin(a + taperAO));
                    }
                    // draw outer part
                    else {
                        canvas.lineTo(radiusO * Math.cos(a - taperAO), radiusO * Math.sin(a - taperAO));
                        canvas.lineTo(radiusI * Math.cos(a + taperAI), radiusI * Math.sin(a + taperAI));
                    }
                    // switch
                    toggle = !toggle;
                }
                // close the final line
                canvas.closePath();
                canvas.fillStyle = this.color;
                canvas.fill();
                canvas.lineWidth = 2;
                canvas.strokeStyle = '#000';
                canvas.stroke();
                // Punch hole in gear
                canvas.beginPath();
                canvas.globalCompositeOperation = 'destination-out';
                canvas.moveTo(radiusH, 0);
                canvas.arc(0, 0, radiusH, 0, pi2);
                canvas.closePath();
                canvas.fill();
                canvas.globalCompositeOperation = 'source-over';
                canvas.stroke();
                canvas.restore();
            },
        };
        this.motorB = {
            cx: 45,
            cy: -130,
            theta: 0,
            color: 'grey',
            draw: that.motorA.draw,
        };
        this.endless = true;
        this.button = {
            xA: -130,
            yA: 55,
            rA: 15,
            colorA: 'blue',
            xB: 130,
            yB: 55,
            rB: 15,
            colorB: 'red',
            xReset: 0,
            yReset: 140,
            rReset: 10,
            colorReset: '#ffffff',
            rBoth: 15,
            xBothA: -191.7375,
            yBothA: 105.125,
            xBothB: -186.7625,
            yBothB: 113.625,
            xBothLabel: -198.0625,
            yBothLabel: 143.0625,
            draw: function (canvas) {
                canvas.beginPath();
                canvas.save();
                canvas.scale(1, -1);
                canvas.translate(this.xBothLabel, -this.yBothLabel);
                canvas.textAlign = 'center';
                canvas.font = 'bold 14px Roboto';
                canvas.textBaseline = 'middle';
                canvas.fillStyle = 'black';
                canvas.fillText('A + B', 0, 0);
                canvas.restore();
                canvas.globalAlpha = that.buttons.A && that.buttons.B ? 0.7 : 0.6;
                canvas.fillStyle = this.colorA;
                canvas.beginPath();
                canvas.arc(this.xBothA, this.yBothA, this.rBoth, 0, Math.PI * 2);
                canvas.fill();
                canvas.fillStyle = this.colorB;
                canvas.beginPath();
                canvas.arc(this.xBothB, this.yBothB, this.rBoth, 0, Math.PI * 2);
                canvas.fill();
                canvas.globalAlpha = 1;
            },
        };
        this.pin0 = {
            x: -196.5,
            y: -0.5,
            r: 26,
            touched: false,
            draw: function (canvas) {
                if (this.touched) {
                    canvas.fillStyle = 'green';
                    canvas.beginPath();
                    canvas.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                    canvas.fill();
                    // show "circuit"
                    canvas.fillStyle = 'red';
                    canvas.beginPath();
                    canvas.arc(-97, 169.5, 13, 0, Math.PI * 2);
                    canvas.fill();
                }
                if (this.digitalOut !== undefined) {
                    canvas.fillStyle = 'green';
                    canvas.beginPath();
                    canvas.save();
                    canvas.scale(1, -1);
                    canvas.save();
                    canvas.translate(this.x - 16, -this.y + 15);
                    canvas.rotate(Math.PI / 2);
                    canvas.font = 'bold 50px Roboto';
                    canvas.fillText('> ', 0, 0);
                    canvas.restore();
                    canvas.font = '10px Courier';
                    canvas.fillText('\u2293', this.x - 14, -this.y + 41);
                    canvas.fillText(this.digitalOut, this.x + 6, -this.y + 41);
                    canvas.restore();
                }
                else if (this.digitalIn !== undefined) {
                    canvas.fillStyle = 'red';
                    canvas.beginPath();
                    canvas.save();
                    canvas.scale(1, -1);
                    canvas.save();
                    canvas.translate(this.x - 16, -this.y + 15);
                    canvas.rotate(Math.PI / 2);
                    canvas.font = 'bold 50px Roboto';
                    canvas.fillText('< ', 0, 0);
                    canvas.restore();
                    canvas.font = '10px Courier';
                    canvas.fillText('\u2293', this.x - 22, -this.y + 41);
                    canvas.fillText(this.digitalIn, this.x + 15, -this.y + 41);
                    canvas.restore();
                }
                else if (this.analogOut !== undefined) {
                    canvas.fillStyle = 'green';
                    canvas.beginPath();
                    canvas.save();
                    canvas.scale(1, -1);
                    canvas.save();
                    canvas.translate(this.x - 16, -this.y + 15);
                    canvas.rotate(Math.PI / 2);
                    canvas.font = 'bold 50px Roboto';
                    canvas.fillText('> ', 0, 0);
                    canvas.restore();
                    canvas.font = '10px Courier';
                    canvas.fillText('\u223F', this.x - 14, -this.y + 41);
                    canvas.fillText(this.analogOut, this.x + 6, -this.y + 41);
                    canvas.restore();
                }
                else if (this.analogIn !== undefined) {
                    canvas.fillStyle = 'red';
                    canvas.beginPath();
                    canvas.save();
                    canvas.scale(1, -1);
                    canvas.save();
                    canvas.translate(this.x - 16, -this.y + 15);
                    canvas.rotate(Math.PI / 2);
                    canvas.font = 'bold 50px Roboto';
                    canvas.fillText('< ', 0, 0);
                    canvas.restore();
                    canvas.font = '10px Courier';
                    canvas.fillText('\u223F', this.x - 22, -this.y + 41);
                    canvas.fillText(this.analogIn, this.x + 15, -this.y + 41);
                    canvas.restore();
                }
            },
        };
        this.pin1 = {
            x: -97,
            y: -169.5,
            r: 26,
            touched: false,
            draw: that.pin0.draw,
        };
        this.pin2 = {
            x: 98.5,
            y: -168.5,
            r: 26,
            touched: false,
            draw: that.pin0.draw,
        };
        this.pin3 = {
            x: 196.5,
            y: -0.5,
            r: 26,
            touched: false,
            draw: that.pin0.draw,
        };
        SIM.initMicrophone(this);
    }
    Calliope.prototype = Object.create(simulation_robot_mbed_1.default.prototype);
    Calliope.prototype.constructor = Calliope;
    Calliope.prototype.reset = function () {
        simulation_robot_mbed_1.default.prototype.reset.apply(this);
        this.motorA.power = 0;
        this.motorB.power = 0;
        clearTimeout(this.motorB.timeout);
        clearTimeout(this.motorA.timeout);
        this.led.color = 'grey';
        this.webAudio.volume = 0.5;
    };
    /**
     * Update all actions of the Calliope.
     *
     * @param {actions}
     *            actions from the executing program: display, led ...
     *
     */
    Calliope.prototype.update = function () {
        simulation_robot_mbed_1.default.prototype.update.apply(this);
        // update debug
        var led = this.robotBehaviour.getActionState('led', true);
        if (led) {
            if (led.color) {
                this.led.color = led.color;
            }
            else {
                var mode = led.mode;
                if (mode !== undefined && mode == 'off')
                    this.led.color = 'grey';
            }
        }
        // update motors
        var motors = this.robotBehaviour.getActionState('motors', true);
        if (motors) {
            function rotate(speed, that) {
                that.theta += (Math.PI * speed) / 1000;
                that.theta = that.theta % (Math.PI * 2);
                that.timeout = setTimeout(rotate, 150, speed, that);
            }
            function setMotor(speed, motor) {
                motor.power = speed;
                clearTimeout(motor.timeout);
                speed = speed > 100 ? 100 : speed;
                if (speed > 0) {
                    rotate(speed, motor);
                }
            }
            if (motors.a !== undefined) {
                setMotor(motors.a, this.motorA);
            }
            if (motors.b !== undefined) {
                setMotor(motors.b, this.motorB);
            }
            if (motors.ab !== undefined) {
                setMotor(motors.ab, this.motorA);
                setMotor(motors.ab, this.motorB);
            }
        }
    };
    Calliope.prototype.handleMouse = function (e, offsetX, offsetY, scale, w, h) {
        if (e.type !== 'touchend') {
            w = w / scale;
            h = h / scale;
            var X = e.clientX || e.originalEvent.touches[0].pageX;
            var Y = e.clientY || e.originalEvent.touches[0].pageY;
            var top = $('#robotLayer').offset().top + $('#robotLayer').width() / 2;
            var left = $('#robotLayer').offset().left + $('#robotLayer').height() / 2;
            startX = parseInt(X - left, 10) / scale;
            startY = parseInt(Y - top, 10) / scale;
            var scsq = 1;
            if (scale < 1)
                scsq = scale * scale;
            var dxA = startX - this.button.xA;
            var dyA = startY + this.button.yA;
            var A = dxA * dxA + dyA * dyA < (this.button.rA * this.button.rA) / scsq;
            var dxB = startX - this.button.xB;
            var dyB = startY + this.button.yB;
            var B = dxB * dxB + dyB * dyB < (this.button.rB * this.button.rB) / scsq;
            var dxReset = startX - this.button.xReset;
            var dyReset = startY + this.button.yReset;
            var Reset = dxReset * dxReset + dyReset * dyReset < (this.button.rReset * this.button.rReset) / scsq;
            var dxBothA = startX - this.button.xBothA;
            var dyBothA = startY + this.button.yBothA;
            var dxBothB = startX - this.button.xBothB;
            var dyBothB = startY + this.button.yBothB;
            var bothA = Math.pow(dxBothA, 2) + Math.pow(dyBothA, 2) < Math.pow(this.button.rBoth, 2) / scsq;
            var bothB = Math.pow(dxBothB, 2) + Math.pow(dyBothB, 2) < Math.pow(this.button.rBoth, 2) / scsq;
            var bothButtons = bothA || bothB;
            var dxPin0 = startX - this.pin0.x;
            var dyPin0 = startY + this.pin0.y;
            var Pin0 = dxPin0 * dxPin0 + dyPin0 * dyPin0 < (this.pin0.r * this.pin0.r) / scsq;
            var dxPin1 = startX - this.pin1.x;
            var dyPin1 = startY + this.pin1.y;
            var Pin1 = dxPin1 * dxPin1 + dyPin1 * dyPin1 < (this.pin1.r * this.pin1.r) / scsq;
            var dxPin2 = startX - this.pin2.x;
            var dyPin2 = startY + this.pin2.y;
            var Pin2 = dxPin2 * dxPin2 + dyPin2 * dyPin2 < (this.pin2.r * this.pin2.r) / scsq;
            var dxPin3 = startX - this.pin3.x;
            var dyPin3 = startY + this.pin3.y;
            var Pin3 = dxPin3 * dxPin3 + dyPin3 * dyPin3 < (this.pin3.r * this.pin3.r) / scsq;
            // special case, display (center: 0,0) represents light level
            var dxDisplay = startX;
            var dyDisplay = startY + 20;
            var Display = dxDisplay * dxDisplay + dyDisplay * dyDisplay < this.display.rLight * this.display.rLight;
        }
        var lightSliderActive = $('#sliderLight').val() !== '100';
        if (!lightSliderActive) {
            this.display.lightLevel = 100;
        }
        if (A || B || Reset || bothButtons || Display || Pin0 || Pin1 || Pin2 || Pin3) {
            if (e.type === 'mousedown' || e.type === 'touchstart') {
                if (A) {
                    this.buttons.A = true;
                }
                else if (B) {
                    this.buttons.B = true;
                }
                else if (Display && !lightSliderActive) {
                    this.display.lightLevel = 150;
                }
                else if (Reset) {
                    this.buttons.Reset = true;
                }
                else if (bothButtons) {
                    this.buttons.A = true;
                    this.buttons.B = true;
                }
                else if (Pin0) {
                    this.pin0.touched = true;
                }
                else if (Pin1) {
                    this.pin1.touched = true;
                }
                else if (Pin2) {
                    this.pin2.touched = true;
                }
                else if (Pin3) {
                    this.pin3.touched = true;
                }
            }
            else if (e.type === 'mousemove' && Display && !lightSliderActive) {
                this.display.lightLevel = 50;
            }
            if (Display && !lightSliderActive) {
                $('#robotLayer').css('cursor', 'crosshair');
            }
            else {
                $('#robotLayer').css('cursor', 'pointer');
            }
        }
        else {
            $('#robotLayer').css('cursor', 'auto');
        }
        if (e.type === 'mouseup' || e.type === 'touchend') {
            this.pin0.touched = false;
            this.pin1.touched = false;
            this.pin2.touched = false;
            this.pin3.touched = false;
            this.buttons.A = false;
            this.buttons.B = false;
        }
    };
    Calliope.prototype.controle = function () {
        $('#simRobotContent').append('<div id="mbedContent"><div id="mbedButtons" class="btn-group btn-group-vertical" data-toggle="buttons">' + //
            '<label style="margin: 8px;margin-top: 12px; margin-left: 0">' +
            Blockly.Msg.SENSOR_GESTURE +
            '</label>' + //
            '<label class="btn simbtn active"><input type="radio" id="up" name="options" autocomplete="off">' +
            Blockly.Msg.SENSOR_GESTURE_UP +
            '</label>' + //
            '<label class="btn simbtn"><input type="radio" id="down" name="options" autocomplete="off" >' +
            Blockly.Msg.SENSOR_GESTURE_DOWN +
            '</label>' + //
            '<label class="btn simbtn"><input type="radio" id="face_down"name="options" autocomplete="off" >' +
            Blockly.Msg.SENSOR_GESTURE_FACE_DOWN +
            '</label>' + //
            '<label class="btn simbtn"><input type="radio" id="face_up" name="options" autocomplete="off" >' +
            Blockly.Msg.SENSOR_GESTURE_FACE_UP +
            '</label>' + //
            '<label class="btn simbtn"><input type="radio" id="shake" name="options" autocomplete="off" >' +
            Blockly.Msg.SENSOR_GESTURE_SHAKE +
            '</label>' + //
            '<label class="btn simbtn"><input type="radio" id="freefall" name="options" autocomplete="off" >' +
            Blockly.Msg.SENSOR_GESTURE_FREEFALL +
            '</label>' + //
            '<label style="margin: 8px;margin-top: 12px; margin-left: 0">' +
            Blockly.Msg.SENSOR_COMPASS +
            '</label><input type="text" value="0" style="margin-bottom: 8px;margin-top: 12px; min-width: 45px; width: 45px; display: inline-block; border: 1px solid #333; border-radius: 2px; text-align: right;" id="range" />' +
            '<div style="margin:8px 0; "><input id="slider" type="range" min="0" max="360" value="0" step="5" /></div>' + //
            '<label style="margin: 8px;margin-top: 12px; margin-left: 0">' +
            Blockly.Msg.SENSOR_LIGHT +
            '</label><input type="text" value="0" style="margin-bottom: 8px;margin-top: 12px; min-width: 45px; width: 45px; display: inline-block; border: 1px solid #333; border-radius: 2px; text-align: right; float: right;" id="rangeLight" />' +
            '<div style="margin:8px 0; "><input id="sliderLight" type="range" min="0" max="100" value="0" /></div>' + //
            '<label style="width:100%;margin: 8px;margin-top: 12px; margin-left: 0"><select class="customDropdown" id="pin"><option id="0">' +
            Blockly.Msg.SENSOR_PIN +
            ' 0</option><option id="1">' +
            Blockly.Msg.SENSOR_PIN +
            ' 1</option><option id="2">' +
            Blockly.Msg.SENSOR_PIN +
            ' 2</option><option id="3">' +
            Blockly.Msg.SENSOR_PIN +
            ' 3</option></select><select class="customDropdown" style="float: right;" id="state"><option value="off">' +
            Blockly.Msg.OFF +
            '</option><option value="analog">analog</option><option value="digital">digital</option></select></label>' + //
            '<div style="margin:8px 0; "><input id="slider1" type="range" min="0" max="1023" value="0" step="1" /></div></div>'); //
    };
    exports.default = Calliope;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3QuY2FsbGlvcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL3NpbXVsYXRpb24vc2ltdWxhdGlvbkxvZ2ljL3JvYm90LmNhbGxpb3BlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBSUE7Ozs7Ozs7T0FPRztJQUNILFNBQVMsUUFBUSxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsR0FBRyxFQUFFLGNBQWM7UUFDdEQsK0JBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsY0FBYyxDQUFDLENBQUM7UUFDM0MsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2hCLElBQUksQ0FBQyxHQUFHLEdBQUc7WUFDUCxLQUFLLEVBQUUsTUFBTTtZQUNiLENBQUMsRUFBRSxDQUFDO1lBQ0osQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNOLENBQUMsRUFBRSxFQUFFO1lBQ0wsSUFBSSxFQUFFLFVBQVUsTUFBTTtnQkFDbEIsSUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLE1BQU0sRUFBRTtvQkFDdEIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZELE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDZCxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUM5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Q0FBQztZQUNsQyxJQUFJLEdBQUcsR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDbEMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDekUsSUFBSSxPQUFPLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQzFDLElBQUksT0FBTyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUMxQyxJQUFJLEtBQUssR0FBRyxPQUFPLEdBQUcsT0FBTyxHQUFHLE9BQU8sR0FBRyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQztZQUVyRyxJQUFJLE9BQU8sR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDMUMsSUFBSSxPQUFPLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1lBQzFDLElBQUksT0FBTyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztZQUMxQyxJQUFJLE9BQU8sR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDMUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDaEcsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDaEcsSUFBSSxXQUFXLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQztZQUVqQyxJQUFJLE1BQU0sR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbEMsSUFBSSxNQUFNLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksSUFBSSxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDO1lBQ2xGLElBQUksTUFBTSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNsQyxJQUFJLE1BQU0sR0FBRyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbEMsSUFBSSxJQUFJLEdBQUcsTUFBTSxHQUFHLE1BQU0sR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDbEYsSUFBSSxNQUFNLEdBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLElBQUksTUFBTSxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNsQyxJQUFJLElBQUksR0FBRyxNQUFN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