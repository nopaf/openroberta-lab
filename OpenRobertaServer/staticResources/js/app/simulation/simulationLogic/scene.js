define(["require", "exports", "simulation.simulation", "simulation.math", "util", "interpreter.constants", "simulation.constants", "jquery"], function (require, exports, SIM, SIMATH, UTIL, IC, simulation_constants_1, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Creates a new Scene.
     *
     * @constructor
     */
    function Scene(backgroundImg, robots, pattern, ruler) {
        this.backgroundImg = backgroundImg;
        this.robots = robots;
        this.numprogs = robots.length;
        this.ruler = ruler;
        this.pattern = pattern;
        this.uCtx = $('#unitBackgroundLayer')[0].getContext('2d'); // unit context
        this.udCtx = $('#unitDrawBackgroundLayer')[0].getContext('2d'); // unit draw context
        this.bCtx = $('#backgroundLayer')[0].getContext('2d'); // background context
        this.dCtx = $('#drawLayer')[0].getContext('2d'); // background context
        this.mCtx = $('#rulerLayer')[0].getContext('2d'); // ruler == *m*easurement context
        this.oCtx = $('#objectLayer')[0].getContext('2d'); // object context
        this.rCtx = $('#robotLayer')[0].getContext('2d'); // robot context
        this.playground = {
            x: 0,
            y: 0,
            w: 0,
            h: 0,
        };
        this.wave = 0.0;
        this.waves = [];
        for (var i = 0; i < this.numprogs; i++) {
            this.waves.push(0.0);
        }
        if (this.numprogs > 1) {
            $('#constantValue').html('');
            var robotIndexColour = '';
            robotIndexColour += '<select id="robotIndex" style="background-color:' + this.robots[SIM.getRobotIndex()].geom.color + '">';
            for (var i = 0; i < this.numprogs; i++) {
                robotIndexColour += '<option style="background-color:' + this.robots[i].geom.color + '" value="' + SIM.getRobotIndex() + '">&nbsp' + '</option>';
            }
            robotIndexColour += '</select>';
            $('#constantValue').append('<div><label id="robotLabel">Robot</label><span style="width:auto">' + robotIndexColour + '</span></div>');
        }
        else {
            //remove if there is only one robot
            $('#robotLabel').remove();
            $('#robotIndex').remove();
        }
        this.resetAllCanvas(this.backgroundImg);
    }
    Scene.prototype.resetAllCanvas = function (opt_img) {
        this.backgroundImg = opt_img || this.backgroundImg;
        var resetUnified = opt_img || false;
        var sc = SIM.getScale();
        var left = (this.playground.w - (this.backgroundImg.width + 20) * sc) / 2.0;
        var top = (this.playground.h - (this.backgroundImg.height + 20) * sc) / 2.0;
        var w = (this.backgroundImg.width + 20) * sc;
        var h = (this.backgroundImg.height + 20) * sc;
        $('#canvasDiv').css({
            top: top + 'px',
            left: left + 'px',
        });
        $('.canvasSim').each(function () {
            if ($(this).hasClass('unified')) {
                if (resetUnified) {
                    this.width = w / sc;
                    this.height = h / sc;
                }
            }
            else {
                this.width = w;
                this.height = h;
            }
        });
        if (resetUnified) {
            this.uCtx.drawImage(this.backgroundImg, 10, 10, this.backgroundImg.width, this.backgroundImg.height);
            this.drawPattern(this.uCtx, this.pattern);
        }
        this.bCtx.drawImage($('#unitBackgroundLayer')[0], 0, 0, this.backgroundImg.width + 20, this.backgroundImg.height + 20, 0, 0, w, h);
    };
    Scene.prototype.resizeBackgrounds = function (sc) {
        var w = $('#unitDrawBackgroundLayer').width();
        var h = $('#unitDrawBackgroundLayer').height();
        this.resetAllCanvas();
        // redraw drawings
        this.dCtx.drawImage($('#unitDrawBackgroundLayer')[0], 0, 0, w, h, 0, 0, w * sc, h * sc);
    };
    Scene.prototype.drawBackground = function (option_scale, option_context) {
        var ctx = option_context || this.bCtx;
        var sc = option_scale || SIM.getScale();
        var left = (this.playground.w - (this.backgroundImg.width + 20) * sc) / 2.0;
        var top = (this.playground.h - (this.backgroundImg.height + 20) * sc) / 2.0;
        var w = (this.backgroundImg.width + 20) * sc;
        var h = (this.backgroundImg.height + 20) * sc;
        if (option_context) {
            //unified background
            $('#unitBackgroundLayer').get(0).width = w;
            $('#unitBackgroundLayer').get(0).height = h;
            $('#unitDrawBackgroundLayer').get(0).width = w;
            $('#unitDrawBackgroundLayer').get(0).height = h;
        }
        else {
            ctx.clearRect(SIM.getGround().x - 20, SIM.getGround().y - 20, SIM.getGround().w + 40, SIM.getGround().h + 40);
        }
        $('.canvasSim').each(function () {
            $(this).get(0).width = w;
            $(this).get(0).height = h;
        });
        $('#canvasDiv').css({
            top: top + 'px',
            left: left + 'px',
        });
        ctx.restore();
        ctx.save();
        ctx.scale(sc, sc);
        if (this.backgroundImg) {
            this.drawPattern(ctx, this.pattern);
            ctx.drawImage(this.backgroundImg, 10, 10, this.backgroundImg.width, this.backgroundImg.height);
        }
    };
    Scene.prototype.drawRuler = function () {
        this.mCtx.clearRect(this.ruler.xOld - 20, this.ruler.yOld - 20, this.ruler.wOld + 40, this.ruler.hOld + 40);
        this.mCtx.restore();
        this.mCtx.save();
        if (this.ruler.img) {
            this.ruler.xOld = this.ruler.x;
            this.ruler.yOld = this.ruler.y;
            this.ruler.wOld = this.ruler.w;
            this.ruler.hOld = this.ruler.h;
            this.mCtx.scale(SIM.getScale(), SIM.getScale());
            this.mCtx.drawImage(this.ruler.img, this.ruler.x, this.ruler.y, this.ruler.w, this.ruler.h);
        }
    };
    Scene.prototype.drawObstacles = function (highLight) {
        this.oCtx.clearRect(SIM.getGround().x - 20, SIM.getGround().y - 20, SIM.getGround().w + 40, SIM.getGround().h + 40);
        this.drawObjects(this.oCtx, SIM.getObstacleList(), highLight, true);
    };
    Scene.prototype.drawColorAreas = function (highLight) {
        var w = this.backgroundImg.width + 20;
        var h = this.backgroundImg.height + 20;
        this.uCtx.clearRect(0, 0, w, h);
        this.uCtx.beginPath();
        this.drawPattern(this.uCtx, this.pattern);
        this.uCtx.drawImage(this.backgroundImg, 10, 10, this.backgroundImg.width, this.backgroundImg.height);
        var wb = w * SIM.getScale();
        var hb = h * SIM.getScale();
        this.bCtx.save();
        this.bCtx.setTransform(1, 0, 0, 1, 0, 0);
        this.bCtx.clearRect(0, 0, wb, hb);
        this.bCtx.drawImage($('#unitBackgroundLayer')[0], 0, 0, w, h, 0, 0, wb, hb);
        this.bCtx.restore();
        this.drawObjects(this.bCtx, SIM.getColorAreaList(), highLight, false, this.uCtx);
    };
    Scene.prototype.drawObjects = function (ctx, objectList, opt_highLight, shadow, optCtx) {
        var highLight = opt_highLight.length > 0 ? opt_highLight : false;
        for (var key in objectList) {
            var obj = objectList[key];
            ctx.restore();
            ctx.save();
            ctx.scale(SIM.getScale(), SIM.getScale());
            ctx.fillStyle = obj.color;
            if (shadow) {
                ctx.shadowColor = '#3e3e3e';
                ctx.shadowOffsetY = 5;
                ctx.shadowOffsetX = 5;
                ctx.shadowBlur = 5;
            }
            if (optCtx) {
                optCtx.fillStyle = obj.color;
            }
            if (obj.img) {
                if (optCtx) {
                    optCtx.drawImage(obj.img, obj.x, obj.y, obj.w, obj.h);
                }
                else {
                    ctx.drawImage(obj.img, obj.x, obj.y, obj.w, obj.h);
                }
            }
            else if (obj.color) {
                if (obj.form === 'rectangle') {
                    ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
                    if (optCtx) {
                        optCtx.fillRect(obj.x, obj.y, obj.w, obj.h);
                    }
                }
                else if (obj.form === 'triangle') {
                    ctx.beginPath();
                    ctx.moveTo(obj.ax, obj.ay);
                    ctx.lineTo(obj.bx, obj.by);
                    ctx.lineTo(obj.cx, obj.cy);
                    ctx.fill();
                    if (optCtx) {
                        optCtx.beginPath();
                        optCtx.moveTo(obj.ax, obj.ay);
                        optCtx.lineTo(obj.bx, obj.by);
                        optCtx.lineTo(obj.cx, obj.cy);
                        optCtx.fill();
                    }
                }
                else if (obj.form === 'circle') {
                    ctx.beginPath();
                    ctx.arc(obj.x, obj.y, obj.r, obj.startAngle, obj.endAngle, Math.PI * 2, true);
                    ctx.fill();
                    if (optCtx) {
                        optCtx.beginPath();
                        optCtx.arc(obj.x, obj.y, obj.r, obj.startAngle, obj.endAngle, Math.PI * 2, true);
                        optCtx.fill();
                    }
                }
            }
        }
        if (highLight) {
            for (var c in highLight) {
                ctx.restore();
                ctx.save();
                ctx.scale(SIM.getScale(), SIM.getScale());
                ctx.beginPath();
                ctx.lineWidth = 2;
                ctx.shadowBlur = 0;
                ctx.strokeStyle = 'gray';
                ctx.arc(highLight[c].x, highLight[c].y, simulation_constants_1.default.CORNER_RADIUS, 0, 2 * Math.PI);
                ctx.fillStyle = 'black';
                ctx.stroke();
                ctx.fill();
            }
        }
    };
    Scene.prototype.drawMbed = function () {
        this.rCtx.clearRect(0, 0, simulation_constants_1.default.MAX_WIDTH, simulation_constants_1.default.MAX_HEIGHT);
        this.rCtx.restore();
        this.rCtx.save();
        // provide new user information
        $('#notConstantValue').html('');
        $('#notConstantValue').append('<div><label>FPS</label><span>' + UTIL.round(1 / SIM.getDt(), 0) + '</span></div>');
        $('#notConstantValue').append('<div><label>Time</label><span>' + UTIL.round(this.robots[0].time, 3) + 's</span></div>');
        $('#notConstantValue').append('<div><label>Compass</label><span>' + UTIL.round(this.robots[0].compass.degree, 0) + '°</span></div>');
        $('#notConstantValue').append('<div><label>Light Sensor</label><span>' + UTIL.round(this.robots[0].display.lightLevel, 0) + '%</span></div>');
        $('#notConstantValue').append('<div><label>Temperature</label><span>' + UTIL.round(this.robots[0].temperature.degree, 2) + '°</span></div>');
        var gesture;
        for (var i in this.robots[0].gesture) {
            gesture = i;
            break;
        }
        $('#notConstantValue').append('<div><label>Gesture</label><span>' + gesture + '</span></div>');
        for (var i = 0; i < 4; i++) {
            if (this.robots[0]['pin' + i]) {
                if (this.robots[0]['pin' + i].touched) {
                    $('#notConstantValue').append('<div><label>Pin ' + i + '</label><span>' + this.robots[0]['pin' + i].touched + '</span></div>');
                }
                else if (this.robots[0]['pin' + i].digitalIn !== undefined) {
                    $('#notConstantValue').append('<div><label>Pin ' + i + '</label><span>' + this.robots[0]['pin' + i].digitalIn + ' \u2293</span></div>');
                }
                else if (this.robots[0]['pin' + i].analogIn !== undefined) {
                    $('#notConstantValue').append('<div><label>Pin ' + i + '</label><span>' + this.robots[0]['pin' + i].analogIn + ' \u223F</span></div>');
                }
            }
        }
        if (SIM.getDebugMode()) {
            drawVariables();
        }
        this.rCtx.scale(SIM.getScale(), SIM.getScale());
        this.rCtx.save();
        this.rCtx.translate(this.backgroundImg.width / 2.0 + 10, this.backgroundImg.height / 2.0 + 10);
        this.rCtx.scale(1, -1);
        for (var prop in this.robots[0]) {
            if (this.robots[0][prop]) {
                if (this.robots[0][prop].draw !== undefined && this.rCtx) {
                    this.robots[0][prop].draw(this.rCtx);
                }
            }
        }
        this.rCtx.restore();
    };
    Scene.prototype.drawRobots = function () {
        if (this.robots[0].idle) {
            this.drawMbed();
            return;
        }
        this.rCtx.clearRect(SIM.getGround().x - 20, SIM.getGround().y - 20, SIM.getGround().w + 40, SIM.getGround().h + 40);
        this.dCtx.restore();
        this.dCtx.save();
        for (var r = 0; r < this.numprogs; r++) {
            this.rCtx.restore();
            this.rCtx.save();
            var x;
            var y;
            if (SIM.getBackground() === 7) {
                x = UTIL.round((this.robots[r].pose.x + this.robots[r].pose.transX) / 3, 1);
                y = UTIL.round((-this.robots[r].pose.y - this.robots[r].pose.transY) / 3, 1);
                this.rCtx.fillStyle = '#ffffff';
            }
            else {
                x = this.robots[r].pose.x + this.robots[r].pose.transX;
                y = this.robots[r].pose.y + this.robots[r].pose.transY;
                this.rCtx.fillStyle = '#333333';
            }
            if (SIM.getRobotIndex() === r) {
                $('#notConstantValue').html('');
                if (this.numprogs > 1) {
                    $('#robotIndex').css('background-color', this.robots[SIM.getRobotIndex()].geom.color);
                    $('#notConstantValue').append('<div><label>Program Name</label><span>' + this.robots[r].savedName + '</span></div>');
                }
                $('#notConstantValue').append('<div><label>FPS</label><span>' + UTIL.round(1 / SIM.getDt(), 0) + '</span></div>');
                $('#notConstantValue').append('<div><label>Time</label><span>' + UTIL.round(this.robots[r].time, 3) + 's</span></div>');
                $('#notConstantValue').append('<div><label>Robot X</label><span>' + UTIL.round(x, 0) + '</span></div>');
                $('#notConstantValue').append('<div><label>Robot Y</label><span>' + UTIL.round(y, 0) + '</span></div>');
                $('#notConstantValue').append('<div><label>Robot θ</label><span>' + UTIL.round(SIMATH.toDegree(this.robots[r].pose.theta), 0) + '°</span></div>');
                $('#notConstantValue').append('<div><label>Motor left</label><span>' + UTIL.round(this.robots[r].encoder.left * simulation_constants_1.default.ENC, 0) + '°</span></div>');
                $('#notConstantValue').append('<div><label>Motor right</label><span>' + UTIL.round(this.robots[r].encoder.right * simulation_constants_1.default.ENC, 0) + '°</span></div>');
                if (Array.isArray(this.robots[r].touchSensor)) {
                    for (var s in this.robots[r].touchSensor) {
                        $('#notConstantValue').append('<div><label>Touch Sensor ' +
                            s.replace('ORT_', '') +
                            '</label><span>' +
                            UTIL.round(this.robots[r].touchSensor[s].value, 0) +
                            '</span></div>');
                        break;
                    }
                }
                for (var s in this.robots[r].colorSensor) {
                    $('#notConstantValue').append('<div><label>Light Sensor ' +
                        s.replace('ORT_', '') +
                        '</label><span>' +
                        UTIL.round(this.robots[r].colorSensor[s].lightValue, 0) +
                        '%</span></div>');
                }
                for (var s in this.robots[r].ultraSensor) {
                    $('#notConstantValue').append('<div><label>Ultra Sensor ' +
                        s.replace('ORT_', '') +
                        '</label><span>' +
                        UTIL.roundUltraSound(this.robots[r].ultraSensor[s].distance / 3.0, 0) +
                        'cm</span></div>');
                }
                if (this.robots[r].sound) {
                    $('#notConstantValue').append('<div><label>Sound Sensor </label><span>' + UTIL.round(this.robots[r].sound.volume * 100, 0) + '%</span></div>');
                }
                for (var s in this.robots[r].colorSensor) {
                    $('#notConstantValue').append('<div><label>Color Sensor ' +
                        s.replace('ORT_', '') +
                        '</label><span style="margin-left:6px; width: 20px; background-color:' +
                        this.robots[r].colorSensor[s].color +
                        '">&nbsp;</span></div>');
                }
                for (var s in this.robots[r].infraredSensors) {
                    for (var side in this.robots[r].infraredSensors[s]) {
                        $('#notConstantValue').append('<div><label>Infrared Sensor ' +
                            s.replace('ORT_', '') +
                            ' ' +
                            side +
                            '</label><span>' +
                            this.robots[r].infraredSensors[s][side].value +
                            '</span></div>');
                    }
                }
                if (SIM.getDebugMode()) {
                    drawVariables();
                }
            }
            this.rCtx.scale(SIM.getScale(), SIM.getScale());
            this.rCtx.save();
            this.rCtx.translate(this.robots[r].pose.x, this.robots[r].pose.y);
            this.rCtx.rotate(this.robots[r].pose.theta - Math.PI / 2);
            this.rCtx.scale(1, -1);
            //axis
            this.rCtx.lineWidth = '2.5';
            this.rCtx.strokeStyle = this.robots[r].wheelLeft.color;
            this.rCtx.beginPath();
            this.rCtx.moveTo(this.robots[r].geom.x - 5, 0);
            this.rCtx.lineTo(this.robots[r].geom.x + this.robots[r].geom.w + 5, 0);
            this.rCtx.stroke();
            //back wheel
            if (this.robots[r].wheelBack) {
                this.rCtx.fillStyle = this.robots[r].wheelBack.color;
                this.rCtx.fillRect(this.robots[r].wheelBack.x, this.robots[r].wheelBack.y, this.robots[r].wheelBack.w, this.robots[r].wheelBack.h);
                this.rCtx.shadowBlur = 0;
                this.rCtx.shadowOffsetX = 0;
                //this.rCtx.fillStyle = "black";
                //this.rCtx.fillRect(this.robots[r].frontRight.x + 12.5, this.robots[r].frontRight.y, 20, 10);
            }
            //bumper
            if (this.robots[r].touchSensor) {
                this.rCtx.shadowBlur = 0;
                this.rCtx.shadowOffsetX = 0;
                this.rCtx.fillStyle = this.robots[r].geom.color;
                this.rCtx.fillRect(this.robots[r].frontRight.x + 12.5, this.robots[r].frontRight.y, 20, 10);
                if (this.robots[r].led && !this.robots[r].leds) {
                    this.rCtx.fillStyle = this.robots[r].led.color;
                    var grd = this.rCtx.createRadialGradient(this.robots[r].led.x, this.robots[r].led.y, 1, this.robots[r].led.x, this.robots[r].led.y, 15);
                    grd.addColorStop(0, this.robots[r].led.color);
                    grd.addColorStop(0.5, this.robots[r].geom.color);
                    this.rCtx.fillStyle = grd;
                }
                else {
                    this.rCtx.fillStyle = this.robots[r].geom.color;
                }
            }
            else {
                this.rCtx.fillStyle = this.robots[r].geom.color;
            }
            this.rCtx.shadowBlur = 5;
            this.rCtx.shadowColor = 'black';
            this.rCtx.beginPath();
            var radius = this.robots[r].geom.radius || 0;
            this.rCtx.moveTo(this.robots[r].geom.x + radius, this.robots[r].geom.y);
            this.rCtx.lineTo(this.robots[r].geom.x + this.robots[r].geom.w - radius, this.robots[r].geom.y);
            this.rCtx.quadraticCurveTo(this.robots[r].geom.x + this.robots[r].geom.w, this.robots[r].geom.y, this.robots[r].geom.x + this.robots[r].geom.w, this.robots[r].geom.y + radius);
            this.rCtx.lineTo(this.robots[r].geom.x + this.robots[r].geom.w, this.robots[r].geom.y + this.robots[r].geom.h - radius);
            this.rCtx.quadraticCurveTo(this.robots[r].geom.x + this.robots[r].geom.w, this.robots[r].geom.y + this.robots[r].geom.h, this.robots[r].geom.x + this.robots[r].geom.w - radius, this.robots[r].geom.y + this.robots[r].geom.h);
            this.rCtx.lineTo(this.robots[r].geom.x + radius, this.robots[r].geom.y + this.robots[r].geom.h);
            this.rCtx.quadraticCurveTo(this.robots[r].geom.x, this.robots[r].geom.y + this.robots[r].geom.h, this.robots[r].geom.x, this.robots[r].geom.y + this.robots[r].geom.h - radius);
            this.rCtx.lineTo(this.robots[r].geom.x, this.robots[r].geom.y + radius);
            this.rCtx.quadraticCurveTo(this.robots[r].geom.x, this.robots[r].geom.y, this.robots[r].geom.x + radius, this.robots[r].geom.y);
            this.rCtx.closePath();
            this.rCtx.fill();
            this.rCtx.shadowBlur = 0;
            this.rCtx.shadowOffsetX = 0;
            this.rCtx.beginPath();
            this.rCtx.lineWidth = 2;
            this.rCtx.fill();
            this.rCtx.closePath();
            //LED
            if (this.robots[r].led && !this.robots[r].leds) {
                this.rCtx.fillStyle = this.robots[r].led.color;
                this.rCtx.beginPath();
                this.rCtx.arc(this.robots[r].led.x, this.robots[r].led.y, 2.5, 0, Math.PI * 2);
                this.rCtx.fill();
            }
            if (this.robots[r].leds) {
                for (var port in this.robots[r].leds) {
                    this.rCtx.fillStyle = this.robots[r].leds[port].color;
                    this.rCtx.beginPath();
                    this.rCtx.arc(this.robots[r].leds[port].x, this.robots[r].leds[port].y, 2.5, 0, Math.PI * 2);
                    this.rCtx.fill();
                }
            }
            //touch
            this.rCtx.shadowBlur = 5;
            this.rCtx.shadowOffsetX = 2;
            var touchSensor;
            var touch = false;
            if (Array.isArray(this.robots[r].touchSensor)) {
                for (var s in this.robots[r].touchSensor) {
                    touchSensor = this.robots[r].touchSensor[s];
                    touch = true;
                    break;
                }
            }
            else {
                touchSensor = this.robots[r].touchSensor;
            }
            if (touch && touchSensor.value === 1) {
                this.rCtx.fillStyle = 'red';
                this.rCtx.fillRect(this.robots[r].frontRight.x, this.robots[r].frontRight.y, this.robots[r].frontLeft.x - this.robots[r].frontRight.x, 3.5);
            }
            else if (touchSensor) {
                this.rCtx.fillStyle = this.robots[r].geom.color;
                this.rCtx.fillRect(this.robots[r].frontRight.x, this.robots[r].frontRight.y, this.robots[r].frontLeft.x - this.robots[r].frontRight.x, 3.5);
            }
            this.rCtx.shadowBlur = 0;
            this.rCtx.shadowOffsetX = 0;
            //wheels
            this.rCtx.fillStyle = this.robots[r].wheelLeft.color;
            this.rCtx.fillRect(this.robots[r].wheelLeft.x, this.robots[r].wheelLeft.y, this.robots[r].wheelLeft.w, this.robots[r].wheelLeft.h);
            this.rCtx.fillStyle = this.robots[r].wheelRight.color;
            this.rCtx.fillRect(this.robots[r].wheelRight.x, this.robots[r].wheelRight.y, this.robots[r].wheelRight.w, this.robots[r].wheelRight.h);
            this.rCtx.lineWidth = '0.5';
            //color
            var colorSensors = this.robots[r].colorSensor;
            for (var s in colorSensors) {
                this.rCtx.beginPath();
                this.rCtx.arc(colorSensors[s].x, colorSensors[s].y, colorSensors[s].r, 0, Math.PI * 2);
                this.rCtx.fillStyle = colorSensors[s].color;
                this.rCtx.fill();
                this.rCtx.strokeStyle = 'black';
                this.rCtx.stroke();
                if (s !== 0) {
                    this.rCtx.translate(colorSensors[s].x, colorSensors[s].y);
                    this.rCtx.scale(-1, 1);
                    this.rCtx.rotate(-Math.PI / 2);
                    this.rCtx.beginPath();
                    this.rCtx.fillStyle = '#555555';
                    this.rCtx.fillText(s, -12, 4);
                    this.rCtx.rotate(Math.PI / 2);
                    this.rCtx.scale(-1, 1);
                    this.rCtx.translate(-colorSensors[s].x, -colorSensors[s].y);
                }
            }
            // infrared sensors (mBot)
            var infraredSensors = this.robots[r].infraredSensors;
            for (var s in infraredSensors) {
                // here we always have a left (1) and right (2) side
                this.rCtx.beginPath();
                this.rCtx.lineWidth = '0.1';
                this.rCtx.arc(infraredSensors[s]['left'].x, infraredSensors[s]['left'].y, infraredSensors[s]['left'].r, 0, Math.PI * 2);
                this.rCtx.fillStyle = infraredSensors[s]['left'].value ? 'black' : 'white';
                this.rCtx.fill();
                this.rCtx.strokeStyle = 'black';
                this.rCtx.stroke();
                this.rCtx.lineWidth = '0.5';
                this.rCtx.beginPath();
                this.rCtx.lineWidth = '0.1';
                this.rCtx.arc(infraredSensors[s]['right'].x, infraredSensors[s]['right'].y, infraredSensors[s]['right'].r, 0, Math.PI * 2);
                this.rCtx.fillStyle = infraredSensors[s]['right'].value ? 'black' : 'white';
                this.rCtx.fill();
                this.rCtx.strokeStyle = 'black';
                this.rCtx.stroke();
                this.rCtx.lineWidth = '0.5';
            }
            //ledSensor
            if (this.robots[r].ledSensor && this.robots[r].ledSensor.color) {
                this.rCtx.fillStyle = this.robots[r].ledSensor.color;
                this.rCtx.beginPath();
                this.rCtx.arc(this.robots[r].ledSensor.x, this.robots[r].ledSensor.y, 2.5, 0, Math.PI * 2);
                this.rCtx.fill();
            }
            if (SIM.getSelectedRobot() === r) {
                var objectCorners = [
                    { x: Math.round(this.robots[r].frontRight.x), y: Math.round(this.robots[r].frontRight.y) },
                    { x: Math.round(this.robots[r].geom.x) + this.robots[r].geom.w, y: Math.round(this.robots[r].frontLeft.y) },
                    { x: Math.round(this.robots[r].geom.x), y: Math.round(this.robots[r].geom.y) + this.robots[r].geom.h },
                    { x: Math.round(this.robots[r].geom.x) + this.robots[r].geom.w, y: Math.round(this.robots[r].geom.y) + this.robots[r].geom.h },
                ];
                for (var c in objectCorners) {
                    this.rCtx.beginPath();
                    this.rCtx.lineWidth = 2;
                    this.rCtx.shadowBlur = 0;
                    this.rCtx.strokeStyle = 'gray';
                    this.rCtx.arc(objectCorners[c].x, objectCorners[c].y, simulation_constants_1.default.CORNER_RADIUS, 0, 2 * Math.PI);
                    this.rCtx.fillStyle = 'black';
                    this.rCtx.stroke();
                    this.rCtx.fill();
                    this.rCtx.closePath();
                }
            }
            this.rCtx.restore();
            // ultra
            var ultraSensors = this.robots[r].ultraSensor;
            this.waves[r] += simulation_constants_1.default.WAVE_LENGTH * SIM.getDt();
            this.waves[r] = this.waves[r] % simulation_constants_1.default.WAVE_LENGTH;
            this.rCtx.lineDashOffset = simulation_constants_1.default.WAVE_LENGTH - this.waves[r];
            this.rCtx.setLineDash([20, 40]);
            for (var s in ultraSensors) {
                for (var i = 0; i < ultraSensors[s].u.length; i++) {
                    this.rCtx.beginPath();
                    this.rCtx.lineWidth = '0.5';
                    this.rCtx.strokeStyle = '#555555';
                    this.rCtx.moveTo(ultraSensors[s].rx, ultraSensors[s].ry);
                    if (ultraSensors[s].u[i]) {
                        this.rCtx.lineTo(ultraSensors[s].u[i].x, ultraSensors[s].u[i].y);
                    }
                    this.rCtx.stroke();
                }
                this.rCtx.beginPath();
                this.rCtx.lineWidth = '1';
                this.rCtx.strokeStyle = 'black';
                this.rCtx.moveTo(ultraSensors[s].rx, ultraSensors[s].ry);
                this.rCtx.lineTo(ultraSensors[s].cx, ultraSensors[s].cy);
                this.rCtx.stroke();
                if (s !== 0 && this.robots[r].name !== 'mbot') {
                    this.rCtx.translate(ultraSensors[s].rx, ultraSensors[s].ry);
                    this.rCtx.rotate(this.robots[r].pose.theta);
                    this.rCtx.beginPath();
                    this.rCtx.fillStyle = '#555555';
                    this.rCtx.fillText(s, ultraSensors[s].y !== 30 ? 10 : -10, 4);
                    this.rCtx.rotate(-this.robots[r].pose.theta);
                    this.rCtx.translate(-ultraSensors[s].rx, -ultraSensors[s].ry);
                }
            }
            // mBot only (so far)
            if (this.robots[r].display && this.robots[r].display.draw) {
                this.robots[r].display.draw(this.robots[r].ctx);
            }
            //this.rCtx.stroke();
            if (this.robots[r].canDraw) {
                this.dCtx.scale(SIM.getScale(), SIM.getScale());
                this.dCtx.beginPath();
                this.dCtx.lineCap = 'round';
                this.dCtx.lineWidth = this.robots[r].drawWidth;
                this.dCtx.strokeStyle = this.robots[r].drawColor;
                this.dCtx.moveTo(this.robots[r].pose.xOld, this.robots[r].pose.yOld);
                this.dCtx.lineTo(this.robots[r].pose.x, this.robots[r].pose.y);
                this.dCtx.stroke();
                this.udCtx.beginPath();
                this.udCtx.lineCap = 'round';
                this.udCtx.lineWidth = this.robots[r].drawWidth;
                this.udCtx.strokeStyle = this.robots[r].drawColor;
                this.udCtx.moveTo(this.robots[r].pose.xOld, this.robots[r].pose.yOld);
                this.udCtx.lineTo(this.robots[r].pose.x, this.robots[r].pose.y);
                this.udCtx.stroke();
                this.robots[r].pose.xOld = this.robots[r].pose.x;
                this.robots[r].pose.yOld = this.robots[r].pose.y;
                this.dCtx.restore();
                this.dCtx.save();
            }
        }
        this.dCtx.restore();
    };
    Scene.prototype.updateSensorValues = function (running) {
        for (var r = 0; r < this.numprogs; r++) {
            var personalObstacleList = SIM.getObstacleList().slice();
            var values = this.robots[r].robotBehaviour.hardwareState.sensors;
            for (var i = 0; i < this.numprogs; i++) {
                if (i === r) {
                    continue;
                }
                else {
                    var tempobstacle = {
                        form: 'robot',
                        backLeft: this.robots[i].backLeft,
                        backRight: this.robots[i].backRight,
                        frontLeft: this.robots[i].frontLeft,
                        frontRight: this.robots[i].frontRight,
                        tolerance: Math.max(Math.abs(this.robots[i].right), Math.abs(this.robots[i].left) || 0),
                    };
                    personalObstacleList.push(tempobstacle);
                }
            }
            if (this.robots[r].touchSensor || this.robots[r].ultraSensor) {
                // check only if it is a moving robot
                var touchSensor;
                if (Array.isArray(this.robots[r].touchSensor)) {
                    for (var s in this.robots[r].touchSensor) {
                        touchSensor = this.robots[r].touchSensor[s];
                        break;
                    }
                }
                else {
                    touchSensor = this.robots[r].touchSensor || {};
                }
                touchSensor.value = 0;
                this.robots[r].frontLeft.bumped = false;
                this.robots[r].frontRight.bumped = false;
                this.robots[r].backLeft.bumped = false;
                this.robots[r].backRight.bumped = false;
                if (SIM.getGround()) {
                    var x = this.robots[r].frontLeft.rx;
                    var y = this.robots[r].frontLeft.ry;
                    if (x < SIM.getGround().x || x > SIM.getGround().x + SIM.getGround().w || y < SIM.getGround().y || y > SIM.getGround().y + SIM.getGround().h) {
                        this.robots[r].frontLeft.bumped = true;
                        touchSensor.value = 1;
                    }
                    x = this.robots[r].frontRight.rx;
                    y = this.robots[r].frontRight.ry;
                    if (x < SIM.getGround().x || x > SIM.getGround().x + SIM.getGround().w || y < SIM.getGround().y || y > SIM.getGround().y + SIM.getGround().h) {
                        this.robots[r].frontRight.bumped = true;
                        touchSensor.value = 1;
                    }
                    x = this.robots[r].backLeft.rx;
                    y = this.robots[r].backLeft.ry;
                    if (x < SIM.getGround().x || x > SIM.getGround().x + SIM.getGround().w || y < SIM.getGround().y || y > SIM.getGround().y + SIM.getGround().h) {
                        this.robots[r].backLeft.bumped = true;
                    }
                    x = this.robots[r].backRight.rx;
                    y = this.robots[r].backRight.ry;
                    if (x < SIM.getGround().x || x > SIM.getGround().x + SIM.getGround().w || y < SIM.getGround().y || y > SIM.getGround().y + SIM.getGround().h) {
                        this.robots[r].backRight.bumped = true;
                    }
                }
                for (var i = 0; i < personalObstacleList.length; i++) {
                    var p = personalObstacleList[i];
                    touchSensor.value = touchSensor.value || SIMATH.checkObstacle(this.robots[r], p);
                    if (touchSensor.value === 0) {
                        var robotSeg = {
                            x1: this.robots[r].frontLeft.rx,
                            x2: this.robots[r].frontRight.rx,
                            y1: this.robots[r].frontLeft.ry,
                            y2: this.robots[r].frontRight.ry,
                        };
                        var p;
                        if (personalObstacleList[i].form !== 'circle') {
                            var obstacleLines = SIMATH.getLinesFromObj(personalObstacleList[i]);
                            for (var k = 0; k < obstacleLines.length; k++) {
                                var interPoint = SIMATH.getIntersectionPoint(robotSeg, obstacleLines[k]);
                                if (interPoint) {
                                    if (Math.abs(this.robots[r].frontLeft.rx - interPoint.x) < Math.abs(this.robots[r].frontRight.rx - interPoint.x)) {
                                        this.robots[r].frontLeft.bumped = true;
                                    }
                                    else {
                                        this.robots[r].frontRight.bumped = true;
                                    }
                                    touchSensor.value = 1;
                                }
                                else {
                                    p = SIMATH.getDistanceToLine({
                                        x: touchSensor.rx,
                                        y: touchSensor.ry,
                                    }, {
                                        x: obstacleLines[k].x1,
                                        y: obstacleLines[k].y1,
                                    }, {
                                        x: obstacleLines[k].x2,
                                        y: obstacleLines[k].y2,
                                    });
                                }
                                var thisTolerance = Math.max(Math.abs(this.robots[r].right), Math.abs(this.robots[r].left));
                                if (SIMATH.sqr(touchSensor.rx - p.x) + SIMATH.sqr(touchSensor.ry - p.y) <
                                    SIM.getDt() * (personalObstacleList[i].tolerance + thisTolerance)) {
                                    this.robots[r].frontLeft.bumped = true;
                                    this.robots[r].frontRight.bumped = true;
                                    touchSensor.value = 1;
                                }
                                else {
                                    var interPoint = SIMATH.getIntersectionPoint({
                                        x1: this.robots[r].backLeft.rx,
                                        x2: this.robots[r].backRight.rx,
                                        y1: this.robots[r].backLeft.ry,
                                        y2: this.robots[r].backRight.ry,
                                    }, obstacleLines[k]);
                                    if (interPoint) {
                                        if (Math.abs(this.robots[r].backLeft.rx - interPoint.x) < Math.abs(this.robots[r].backRight.rx - interPoint.x)) {
                                            this.robots[r].backLeft.bumped = true;
                                        }
                                        else {
                                            this.robots[r].backRight.bumped = true;
                                        }
                                    }
                                    else {
                                        p = SIMATH.getDistanceToLine({
                                            x: touchSensor.rx,
                                            y: touchSensor.ry,
                                        }, {
                                            x: obstacleLines[k].x1,
                                            y: obstacleLines[k].y1,
                                        }, {
                                            x: obstacleLines[k].x2,
                                            y: obstacleLines[k].y2,
                                        });
                                    }
                                    if (SIMATH.sqr(this.robots[r].backMiddle.rx - p.x) + SIMATH.sqr(this.robots[r].backMiddle.ry - p.y) <
                                        SIM.getDt() * (personalObstacleList[i].tolerance + thisTolerance)) {
                                        this.robots[r].backLeft.bumped = true;
                                        this.robots[r].backRight.bumped = true;
                                    }
                                }
                            }
                        }
                        else {
                            var interPoint = SIMATH.getClosestIntersectionPointCircle(robotSeg, personalObstacleList[i]);
                            if (interPoint) {
                                if (Math.abs(this.robots[r].frontLeft.rx - interPoint.x) < Math.abs(this.robots[r].frontRight.rx - interPoint.x)) {
                                    this.robots[r].frontLeft.bumped = true;
                                }
                                else {
                                    this.robots[r].frontRight.bumped = true;
                                }
                                touchSensor.value = 1;
                            }
                            else {
                                p = SIMATH.getDistanceToCircle({
                                    x: touchSensor.rx,
                                    y: touchSensor.ry,
                                }, personalObstacleList[i]);
                            }
                            var thisTolerance = Math.max(Math.abs(this.robots[r].right), Math.abs(this.robots[r].left));
                            if (SIMATH.sqr(touchSensor.rx - p.x) + SIMATH.sqr(touchSensor.ry - p.y) <
                                SIM.getDt() * (personalObstacleList[i].tolerance + thisTolerance)) {
                                this.robots[r].frontLeft.bumped = true;
                                this.robots[r].frontRight.bumped = true;
                                touchSensor.value = 1;
                            }
                            else {
                                var interPoint = SIMATH.getClosestIntersectionPointCircle({
                                    x1: this.robots[r].backLeft.rx,
                                    x2: this.robots[r].backRight.rx,
                                    y1: this.robots[r].backLeft.ry,
                                    y2: this.robots[r].backRight.ry,
                                }, personalObstacleList[i]);
                                if (interPoint) {
                                    if (Math.abs(this.robots[r].backLeft.rx - interPoint.x) < Math.abs(this.robots[r].backRight.rx - interPoint.x)) {
                                        this.robots[r].backLeft.bumped = true;
                                    }
                                    else {
                                        this.robots[r].backRight.bumped = true;
                                    }
                                }
                                else {
                                    p = SIMATH.getDistanceToCircle({
                                        x: touchSensor.rx,
                                        y: touchSensor.ry,
                                    }, personalObstacleList[i]);
                                    if (SIMATH.sqr(this.robots[r].backMiddle.rx - p.x) + SIMATH.sqr(this.robots[r].backMiddle.ry - p.y) <
                                        SIM.getDt() * (personalObstacleList[i].tolerance + thisTolerance)) {
                                        this.robots[r].backLeft.bumped = true;
                                        this.robots[r].backRight.bumped = true;
                                    }
                                }
                            }
                        }
                    }
                }
                values.touch = {};
                for (var s in this.robots[r].touchSensor) {
                    if (touchSensor.value === 1) {
                        values.touch[s] = true;
                    }
                    else {
                        values.touch[s] = false;
                    }
                }
            }
            if (this.robots[r].colorSensor) {
                var colorSensors = this.robots[r].colorSensor;
                values.color = {};
                values.light = {};
                for (var s in colorSensors) {
                    var red_1 = 0;
                    var green_1 = 0;
                    var blue_1 = 0;
                    var x_1 = Math.round(colorSensors[s].rx - 3);
                    var y_1 = Math.round(colorSensors[s].ry - 3);
                    var colors_1 = this.uCtx.getImageData(x_1, y_1, 6, 6);
                    var colorsD_1 = this.udCtx.getImageData(x_1, y_1, 6, 6);
                    mergeDrawings(colors_1, colorsD_1);
                    var out_1 = [0, 4, 16, 20, 24, 44, 92, 116, 120, 124, 136, 140]; // outside the circle
                    for (var j = 0; j < colors_1.data.length; j += 24) {
                        for (var i = j; i < j + 24; i += 4) {
                            if (out_1.indexOf(i) < 0) {
                                red_1 += colors_1.data[i + 0];
                                green_1 += colors_1.data[i + 1];
                                blue_1 += colors_1.data[i + 2];
                            }
                        }
                    }
                    var num = colors_1.data.length / 4 - 12; // 12 are outside
                    red_1 = red_1 / num;
                    green_1 = green_1 / num;
                    blue_1 = blue_1 / num;
                    values.color[s] = {};
                    values.light[s] = {};
                    colorSensors[s].colorValue = SIMATH.getColor(SIMATH.rgbToHsv(red_1, green_1, blue_1));
                    values.color[s].colorValue = colorSensors[s].colorValue;
                    values.color[s].colour = colorSensors[s].colorValue;
                    if (colorSensors[s].colorValue === simulation_constants_1.default.COLOR_ENUM.NONE) {
                        colorSensors[s].color = 'grey';
                    }
                    else if (colorSensors[s].colorValue === simulation_constants_1.default.COLOR_ENUM.BLACK) {
                        colorSensors[s].color = 'black';
                    }
                    else if (colorSensors[s].colorValue === simulation_constants_1.default.COLOR_ENUM.WHITE) {
                        colorSensors[s].color = 'white';
                    }
                    else if (colorSensors[s].colorValue === simulation_constants_1.default.COLOR_ENUM.YELLOW) {
                        colorSensors[s].color = 'yellow';
                    }
                    else if (colorSensors[s].colorValue === simulation_constants_1.default.COLOR_ENUM.BROWN) {
                        colorSensors[s].color = 'brown';
                    }
                    else if (colorSensors[s].colorValue === simulation_constants_1.default.COLOR_ENUM.RED) {
                        colorSensors[s].color = 'red';
                    }
                    else if (colorSensors[s].colorValue === simulation_constants_1.default.COLOR_ENUM.BLUE) {
                        colorSensors[s].color = 'blue';
                    }
                    else if (colorSensors[s].colorValue === simulation_constants_1.default.COLOR_ENUM.GREEN) {
                        colorSensors[s].color = 'lime';
                    }
                    colorSensors[s].lightValue = (red_1 + green_1 + blue_1) / 3 / 2.55;
                    values.color[s].light = colorSensors[s].lightValue;
                    values.color[s].rgb = [UTIL.round(red_1, 0), UTIL.round(green_1, 0), UTIL.round(blue_1, 0)];
                    values.color[s].ambientlight = 0;
                    values.light[s].light = colorSensors[s].lightValue;
                    values.light[s].ambientlight = 0;
                }
            }
            if (this.robots[r].ultraSensor) {
                var ultraSensors = this.robots[r].ultraSensor;
                values.ultrasonic = {};
                values.infrared = {};
                for (var s in ultraSensors) {
                    ultraSensors[s].u = [];
                    values.ultrasonic[s] = {};
                    values.infrared[s] = {};
                    var u3 = {
                        x1: ultraSensors[s].rx,
                        y1: ultraSensors[s].ry,
                        x2: ultraSensors[s].rx + simulation_constants_1.default.MAXDIAG * Math.cos(this.robots[r].pose.theta + ultraSensors[s].theta),
                        y2: ultraSensors[s].ry + simulation_constants_1.default.MAXDIAG * Math.sin(this.robots[r].pose.theta + ultraSensors[s].theta),
                    };
                    var u1 = {
                        x1: ultraSensors[s].rx,
                        y1: ultraSensors[s].ry,
                        x2: ultraSensors[s].rx + simulation_constants_1.default.MAXDIAG * Math.cos(this.robots[r].pose.theta - Math.PI / 8 + ultraSensors[s].theta),
                        y2: ultraSensors[s].ry + simulation_constants_1.default.MAXDIAG * Math.sin(this.robots[r].pose.theta - Math.PI / 8 + ultraSensors[s].theta),
                    };
                    var u2 = {
                        x1: ultraSensors[s].rx,
                        y1: ultraSensors[s].ry,
                        x2: ultraSensors[s].rx + simulation_constants_1.default.MAXDIAG * Math.cos(this.robots[r].pose.theta - Math.PI / 16 + ultraSensors[s].theta),
                        y2: ultraSensors[s].ry + simulation_constants_1.default.MAXDIAG * Math.sin(this.robots[r].pose.theta - Math.PI / 16 + ultraSensors[s].theta),
                    };
                    var u5 = {
                        x1: ultraSensors[s].rx,
                        y1: ultraSensors[s].ry,
                        x2: ultraSensors[s].rx + simulation_constants_1.default.MAXDIAG * Math.cos(this.robots[r].pose.theta + Math.PI / 8 + ultraSensors[s].theta),
                        y2: ultraSensors[s].ry + simulation_constants_1.default.MAXDIAG * Math.sin(this.robots[r].pose.theta + Math.PI / 8 + ultraSensors[s].theta),
                    };
                    var u4 = {
                        x1: ultraSensors[s].rx,
                        y1: ultraSensors[s].ry,
                        x2: ultraSensors[s].rx + simulation_constants_1.default.MAXDIAG * Math.cos(this.robots[r].pose.theta + Math.PI / 16 + ultraSensors[s].theta),
                        y2: ultraSensors[s].ry + simulation_constants_1.default.MAXDIAG * Math.sin(this.robots[r].pose.theta + Math.PI / 16 + ultraSensors[s].theta),
                    };
                    var uA = new Array(u1, u2, u3, u4, u5);
                    ultraSensors[s].distance = simulation_constants_1.default.MAXDIAG;
                    var uDis = [Infinity, Infinity, Infinity, Infinity, Infinity];
                    personalObstacleList.push(SIM.getGround());
                    for (var i = 0; i < personalObstacleList.length; i++) {
                        if (personalObstacleList[i].form !== 'circle') {
                            var obstacleLines = SIMATH.getLinesFromObj(personalObstacleList[i]);
                            for (var k = 0; k < obstacleLines.length; k++) {
                                for (var j = 0; j < uA.length; j++) {
                                    var interPoint = SIMATH.getIntersectionPoint(uA[j], obstacleLines[k]);
                                    if (interPoint) {
                                        var dis = Math.sqrt((interPoint.x - ultraSensors[s].rx) * (interPoint.x - ultraSensors[s].rx) +
                                            (interPoint.y - ultraSensors[s].ry) * (interPoint.y - ultraSensors[s].ry));
                                        if (dis < ultraSensors[s].distance) {
                                            ultraSensors[s].distance = dis;
                                            ultraSensors[s].cx = interPoint.x;
                                            ultraSensors[s].cy = interPoint.y;
                                        }
                                        if (dis < uDis[j]) {
                                            uDis[j] = dis;
                                            ultraSensors[s].u[j] = interPoint;
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            for (var j = 0; j < uA.length; j++) {
                                var interPoint = SIMATH.getClosestIntersectionPointCircle(uA[j], personalObstacleList[i]);
                                if (interPoint) {
                                    var dis = Math.sqrt((interPoint.x - ultraSensors[s].rx) * (interPoint.x - ultraSensors[s].rx) +
                                        (interPoint.y - ultraSensors[s].ry) * (interPoint.y - ultraSensors[s].ry));
                                    if (dis < ultraSensors[s].distance) {
                                        ultraSensors[s].distance = dis;
                                        ultraSensors[s].cx = interPoint.x;
                                        ultraSensors[s].cy = interPoint.y;
                                    }
                                    if (dis < uDis[j]) {
                                        uDis[j] = dis;
                                        ultraSensors[s].u[j] = interPoint;
                                    }
                                }
                            }
                        }
                    }
                    var distance = ultraSensors[s].distance / 3.0;
                    // adopt sim sensor to real sensor
                    if (distance < 255) {
                        values.ultrasonic[s].distance = distance;
                    }
                    else {
                        values.ultrasonic[s].distance = 255.0;
                    }
                    values.ultrasonic[s].presence = false;
                    // treat the ultrasonic sensor as infrared sensor
                    if (distance < 70) {
                        values.infrared[s].distance = (100.0 / 70.0) * distance;
                    }
                    else {
                        values.infrared[s].distance = 100.0;
                    }
                    values.infrared[s].presence = false;
                }
            }
            if (this.robots[r].infraredSensors) {
                var infraredSensors = this.robots[r].infraredSensors;
                for (var s in infraredSensors) {
                    values.infrared[s] = {};
                    for (var side in infraredSensors[s]) {
                        var red = 0;
                        var green = 0;
                        var blue = 0;
                        var colors = this.uCtx.getImageData(Math.round(infraredSensors[s][side].rx - 3), Math.round(infraredSensors[s][side].ry - 3), 6, 6);
                        var colorsD = this.udCtx.getImageData(Math.round(infraredSensors[s][side].rx - 3), Math.round(infraredSensors[s][side].ry - 3), 6, 6);
                        mergeDrawings(colors, colorsD);
                        var out = [0, 4, 16, 20, 24, 44, 92, 116, 120, 124, 136, 140]; // outside the circle
                        for (var j = 0; j < colors.data.length; j += 24) {
                            for (var i = j; i < j + 24; i += 4) {
                                if (out.indexOf(i) < 0) {
                                    red += colors.data[i + 0];
                                    green += colors.data[i + 1];
                                    blue += colors.data[i + 2];
                                }
                            }
                        }
                        var num = colors.data.length / 4 - 12; // 12 are outside
                        red = red / num;
                        green = green / num;
                        blue = blue / num;
                        var lightValue = (red + green + blue) / 3 / 2.55;
                        if (lightValue < 50) {
                            infraredSensors[s][side].value = true;
                        }
                        else {
                            infraredSensors[s][side].value = false;
                        }
                        values.infrared[s][side] = infraredSensors[s][side].value;
                    }
                }
            }
            if (running) {
                this.robots[r].time += SIM.getDt();
                for (var key in this.robots[r].timer) {
                    this.robots[r].timer[key] += UTIL.round(SIM.getDt() * 1000, 0);
                }
            }
            values.time = this.robots[r].time;
            if (this.robots[r].timer) {
                values.timer = {};
                for (var key in this.robots[r].timer) {
                    values.timer[key] = this.robots[r].timer[key];
                }
            }
            if (this.robots[r].encoder) {
                values.encoder = {};
                values.encoder.left = this.robots[r].encoder.left * simulation_constants_1.default.ENC;
                values.encoder.right = this.robots[r].encoder.right * simulation_constants_1.default.ENC;
            }
            if (this.robots[r].gyroSensor) {
                values.gyro = {};
                for (var s in this.robots[r].gyroSensor) {
                    values.gyro[s] = {};
                    values.gyro[s].angle = SIMATH.toDegree(this.robots[r].pose.theta);
                    values.gyro[s].rate = SIM.getDt() * SIMATH.toDegree(this.robots[r].pose.thetaDiff);
                }
            }
            if (this.robots[r].buttons) {
                values.buttons = {};
                values.buttons.any = false;
                values.buttons.Reset = false;
                for (var key in this.robots[r].buttons) {
                    values.buttons[key] = this.robots[r].buttons[key] === true;
                    values.buttons.any = values.buttons.any || this.robots[r].buttons[key];
                }
            }
            if (this.robots[r].webAudio) {
                values.volume = this.robots[r].webAudio.volume * 100;
            }
            if (this.robots[r].sound) {
                values.sound = {};
                values.sound.volume = UTIL.round(this.robots[r].sound.volume * 100, 0);
            }
            if (this.robots[r].display) {
                var robotName = getFnName(this.robots[r].constructor);
                values.light = {};
                values.display = {};
                values.light.ambientlight = this.robots[r].display.lightLevel;
                if (robotName === 'Ev3' || robotName === 'Nxt' || robotName === 'Mbot') {
                    values.display.brightness = this.robots[r].display.brightness;
                    values.display.pixel = this.robots[r].display.leds;
                }
                else {
                    values.display.brightness = Math.round((this.robots[r].display.brightness * 9.0) / 255.0, 0);
                    values.display.pixel = this.robots[r].display.leds.map(function (x) {
                        return x.map(function (y) {
                            return Math.round(y / IC.BRIGHTNESS_MULTIPLIER);
                        });
                    });
                }
            }
            if (this.robots[r].temperature) {
                values.temperature = {};
                values.temperature.value = this.robots[r].temperature.degree;
            }
            if (this.robots[r].gesture) {
                values.gesture = {};
                for (var mode in this.robots[r].gesture) {
                    values.gesture[mode] = this.robots[r].gesture[mode];
                }
            }
            if (this.robots[r].compass) {
                values.compass = {};
                values.compass.angle = this.robots[r].compass.degree;
            }
            for (var i = 0; i < 4; i++) {
                if (this.robots[r]['pin' + i]) {
                    values['pin' + i] = {};
                    values['pin' + i].pressed = this.robots[r]['pin' + i].touched;
                    if (this.robots[r]['pin' + i].digitalIn !== undefined) {
                        values['pin' + i].digital = this.robots[r]['pin' + i].digitalIn;
                    }
                    else if (this.robots[r]['pin' + i].analogIn !== undefined) {
                        values['pin' + i].analog = this.robots[r]['pin' + i].analogIn;
                    }
                }
            }
            values.correctDrive = SIM.getBackground() == 7;
            if (this.robots[r].display && this.robots[r].display.finished) {
                this.robots[r].robotBehaviour.setBlocking(false);
                this.robots[r].display.finished = false;
            }
            if (this.robots[r].sayText && this.robots[r].sayText.finished) {
                this.robots[r].robotBehaviour.setBlocking(false);
                this.robots[r].sayText.finished = false;
            }
            if (this.robots[r].tone && this.robots[r].tone.finished) {
                this.robots[r].robotBehaviour.setBlocking(false);
                this.robots[r].tone.finished = false;
            }
            values.frameTime = SIM.getDt();
        }
        function mergeDrawings(colors, colorsD) {
            for (var i = 0; i <= colors.data.length; i += 4) {
                if (colorsD.data[i + 3] === 255) {
                    for (var j = i; j < i + 3; j++) {
                        colors.data[j] = colorsD.data[j];
                    }
                }
            }
        }
    };
    Scene.prototype.drawPattern = function (ctx, pattern) {
        if (this.robots && (getFnName(this.robots[0].constructor).indexOf('Calliope') >= 0 || getFnName(this.robots[0].constructor) === 'Microbit')) {
            return;
        }
        ctx.beginPath();
        if (pattern) {
            var patternImg = pattern;
            var pattern = ctx.createPattern(patternImg, 'repeat');
            ctx.strokeStyle = pattern;
        }
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, this.backgroundImg.width + 10, this.backgroundImg.height + 10);
    };
    function getFnName(fn) {
        var f = typeof fn == 'function';
        var s = f && ((fn.name && ['', fn.name]) || fn.toString().match(/function ([^\(]+)/));
        return (!f && 'not a function') || (s && s[1]) || 'anonymous';
    }
    function drawVariables() {
        var variables = SIM.getSimVariables();
        if (Object.keys(variables).length > 0) {
            $('#notConstantValue').append('<div><label>Variables</label></div>');
            for (var v in variables) {
                var value = variables[v][0];
                addVariableValue(v, value);
            }
        }
    }
    function addVariableValue(name, value) {
        switch (typeof value) {
            case 'number': {
                $('#notConstantValue').append('<div><label>' + name + ' :  </label><span> ' + UTIL.round(value, 2) + '</span></div>');
                break;
            }
            case 'string': {
                $('#notConstantValue').append('<div><label>' + name + ' :  </label><span> ' + value + '</span></div>');
                break;
            }
            case 'boolean': {
                $('#notConstantValue').append('<div><label>' + name + ' :  </label><span> ' + value + '</span></div>');
                break;
            }
            case 'object': {
                for (var i = 0; i < value.length; i++) {
                    addVariableValue(name + ' [' + String(i) + ']', value[i]);
                }
                break;
            }
        }
    }
    exports.default = Scene;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NlbmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL3NpbXVsYXRpb24vc2ltdWxhdGlvbkxvZ2ljL3NjZW5lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBV0E7Ozs7T0FJRztJQUNILFNBQVMsS0FBSyxDQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUs7UUFDaEQsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDbkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzlCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsZUFBZTtRQUMxRSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLG9CQUFvQjtRQUNwRixJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLHFCQUFxQjtRQUM1RSxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxxQkFBcUI7UUFDdEUsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENB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QUNqQixJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDMUQsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkIsTUFBTTtZQUNOLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztZQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUM7WUFDdkQsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDbkIsWUFBWTtZQUNaLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxD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QUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQzdDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQ2pDLENBQUM7WUFDRixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUM7WUFDeEgsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FDdEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLEVBQ3RELElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFB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QUFDLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2FBQy9JO1lBQ0QsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQztZQUM1QixRQUFRO1lBQ1IsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDO1lBQ3JELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ25JLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztZQUN0RCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMs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QkFDekMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztnQkFDeEMsSUFBSSxHQUFHLENBQUMsU0FBUyxFQUFFLEVBQUU7b0JBQ2pCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztvQkFDcEMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO29CQUNwQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRTt3QkFDMUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQzt3QkFDdkMsV0FBVyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7cUJBQ3pCO29CQUNELENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7b0JBQ2pDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7b0JBQ2pDLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FB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LEtBQUssR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO3FCQUNuRyxDQUFDO29CQUNGLElBQUksRUFBRSxHQUFHO3dCQUNMLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDdEIsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUN0QixFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyw4QkFBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO3dCQUM5RyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyw4QkFBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO3FCQUNqSCxDQUFDO29CQUNGLElBQUksRUFBRSxHQUFHO3dCQUNMLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDdEIsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUN0QixFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyw4QkFBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO3dCQUMvRyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyw4QkFBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO3FCQUNsSCxDQUFDO29CQUNGLElBQUksRUFBRSxHQUFHO3dCQUNMLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDdEIsRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUN0QixFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyw4QkFBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO3dCQUM5RyxFQUFFLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyw4QkFBQyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO3FCQUNqSCxDQUFDO29CQUNGLElBQUksRUFBRSxHQUFHO3dCQUNMLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTt3QkFDdEIsRUFBRSxFQUFFLFlB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