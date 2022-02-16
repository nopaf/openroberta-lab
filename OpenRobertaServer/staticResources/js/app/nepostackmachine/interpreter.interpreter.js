define(["require", "exports", "./interpreter.state", "./interpreter.constants", "./interpreter.util", "neuralnetwork.playground"], function (require, exports, interpreter_state_1, C, U, PG) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Interpreter = void 0;
    var Interpreter = /** @class */ (function () {
        /*
         *
         * . @param generatedCode argument contains the operations and the function definitions
         * . @param robotBehaviour implementation of the ARobotBehaviour class
         * . @param cbOnTermination is called when the program has terminated
         */
        function Interpreter(generatedCode, r, cbOnTermination, simBreakpoints) {
            this.terminated = false;
            this.callbackOnTermination = undefined;
            this.debugDelay = 2;
            this.terminated = false;
            this.callbackOnTermination = cbOnTermination;
            var stmts = generatedCode[C.OPS];
            this.robotBehaviour = r;
            this.breakpoints = simBreakpoints;
            this.events = {};
            this.events[C.DEBUG_STEP_INTO] = false;
            this.events[C.DEBUG_BREAKPOINT] = false;
            this.events[C.DEBUG_STEP_OVER] = false;
            this.lastBlock = null;
            this.lastStoppedBlock = null;
            this.stepOverBlock = null;
            this.state = new interpreter_state_1.State(stmts);
        }
        /**
         * run the operations.
         * . @param maxRunTime the time stamp at which the run method must have terminated. If 0 run as long as possible.
         */
        Interpreter.prototype.run = function (maxRunTime) {
            return this.evalOperation(maxRunTime);
        };
        /**
         * return true, if the program is terminated
         */
        Interpreter.prototype.isTerminated = function () {
            return this.terminated;
        };
        /**
         * force the termination of the program. The termination takes place, when the NEXT operation should be executed. The delay is not significant.
         * The callbackOnTermination function is called
         */
        Interpreter.prototype.terminate = function () {
            this.terminated = true;
            this.callbackOnTermination();
            this.robotBehaviour.close();
            this.state.removeHighlights([]);
        };
        Interpreter.prototype.getRobotBehaviour = function () {
            return this.robotBehaviour;
        };
        /** Returns the map of interpreters variables */
        Interpreter.prototype.getVariables = function () {
            return this.state.getVariables();
        };
        /** Removes all highlights from currently executing blocks*/
        Interpreter.prototype.removeHighlights = function () {
            this.state.removeHighlights([]);
        };
        /** Sets the debug mode*/
        Interpreter.prototype.setDebugMode = function (mode) {
            this.state.setDebugMode(mode);
            if (mode) {
                stackmachineJsHelper.getJqueryObject('#blockly').addClass('debug');
                this.state.addHighlights(this.breakpoints);
            }
            else {
                this.state.removeHighlights(this.breakpoints);
                stackmachineJsHelper.getJqueryObject('#blockly').removeClass('debug');
            }
        };
        /** sets relevant event value to true */
        Interpreter.prototype.addEvent = function (mode) {
            this.events[mode] = true;
        };
        /** sets relevant event value to false */
        Interpreter.prototype.removeEvent = function (mode) {
            this.events[mode] = false;
        };
        /**
         * the central interpreter. It is a stack machine interpreting operations given as JSON objects. The operations are all IMMUTABLE. It
         * - uses the this.state component to store the state of the interpretation.
         * - uses the this.robotBehaviour component for accessing hardware sensors and actors
         *
         * if the program is not terminated, it will take one operation after the other and execute it. The property C.OPCODE contains the
         * operation code and is used for switching to the various operations implementations. For some operation codes the implementations is extracted to
         * special functions (repeat, expression) for better readability.
         *
         * The state of the interpreter consists of
         * - a stack of computed values
         * - the actual array of operations to be executed now, including a program counter as index into the array
         * - a hash map of bindings. A binding map a name as key to an array of values. This implements hiding of variables.
         *
         * Each operation code implementation may
         * - create new bindings of values to names (variable declaration)
         * - change the values of the binding (assign)
         * - push and pop values to the stack (expressions)
         *
         * Debugging functions:
         * -StepOver will step over a given line. If the line contains a function the function will be executed and the result returned without debugging each line.
         * -StepInto If the line does not contain a function it behaves the same as “step over” but if it does the debugger will enter the called function
         * and continue line-by-line debugging there.
         * -BreakPoint will continue execution until the next breakpoint is reached or the program exits.
         */
        Interpreter.prototype.evalOperation = function (maxRunTime) {
            while (maxRunTime >= new Date().getTime() && !this.robotBehaviour.getBlocking()) {
                var op = this.state.getOp();
                this.state.evalHighlightings(op, this.lastBlock);
                if (this.state.getDebugMode()) {
                    var canContinue = this.calculateDebugBehaviour(op);
                    if (!canContinue)
                        return 0;
                }
                var _a = this.evalSingleOperation(op), result = _a[0], stop_1 = _a[1];
                this.lastStoppedBlock = null;
                this.lastBlock = op;
                if (result > 0 || stop_1) {
                    return result;
                }
                if (this.terminated) {
                    // termination either requested by the client or by executing 'stop' or after last statement
                    this.robotBehaviour.close();
                    this.callbackOnTermination();
                    return 0;
                }
                if (this.state.getDebugMode()) {
                    return this.debugDelay;
                }
            }
            return 0;
        };
        /**
         * Is responsible for all debugging behavior
         * @param op
         * @return whether the interpreter can continue evaluating the operation
         * @private
         */
        Interpreter.prototype.calculateDebugBehaviour = function (op) {
            if (this.events[C.DEBUG_BREAKPOINT] && Interpreter.isBreakPoint(op, this.breakpoints) && op !== this.lastStoppedBlock) {
                this.breakPoint(op);
                return false;
            }
            if (this.events[C.DEBUG_STEP_INTO] && Interpreter.isPossibleStepInto(op) && op !== this.lastStoppedBlock) {
                this.stepInto(op);
                return false;
            }
            if (this.events[C.DEBUG_STEP_OVER]) {
                if (this.stepOverBlock !== null && !this.state.beingExecuted(this.stepOverBlock) && Interpreter.isPossibleStepInto(op)) {
                    this.stepOver(op);
                    return false;
                }
                else if (this.stepOverBlock === null && Interpreter.isPossibleStepOver(op)) {
                    this.stepOverBlock = op;
                }
                else if (this.stepOverBlock === null && this.lastStoppedBlock !== op && Interpreter.isPossibleStepInto(op)) {
                    this.stepOver(op);
                    return false;
                }
            }
            return true;
        };
        Interpreter.prototype.stepOver = function (op) {
            stackmachineJsHelper.setSimBreak();
            this.events[C.DEBUG_STEP_OVER] = false;
            this.stepOverBlock = null;
            this.lastStoppedBlock = op;
        };
        Interpreter.prototype.stepInto = function (op) {
            stackmachineJsHelper.setSimBreak();
            this.events[C.DEBUG_STEP_INTO] = false;
            this.lastStoppedBlock = op;
        };
        Interpreter.prototype.breakPoint = function (op) {
            stackmachineJsHelper.setSimBreak();
            this.events[C.DEBUG_BREAKPOINT] = false;
            this.lastStoppedBlock = op;
        };
        /**
         *  called from @see evalOperation() to evaluate all the operations
         *
         * @param stmt the operation to be evaluated
         * @returns [result,stop] result will be time required till next instruction and stop indicates if evalOperation should return result or not.
         */
        Interpreter.prototype.evalSingleOperation = function (stmt) {
            this.state.opLog('actual ops: ');
            this.state.incrementProgramCounter();
            if (stmt === undefined) {
                U.debug('PROGRAM TERMINATED. No ops remaining');
                this.terminated = true;
            }
            else {
                var opCode = stmt[C.OPCODE];
                switch (opCode) {
                    case C.JUMP: {
                        var condition = stmt[C.CONDITIONAL];
                        if (condition === C.ALWAYS || this.state.pop() === condition) {
                            this.state.pc = stmt[C.TARGET];
                        }
                        break;
                    }
                    case C.ASSIGN_STMT: {
                        var name_1 = stmt[C.NAME];
                        this.state.setVar(name_1, this.state.pop());
                        break;
                    }
                    case C.CLEAR_DISPLAY_ACTION: {
                        this.robotBehaviour.clearDisplay();
                        return [0, true];
                    }
                    case C.CREATE_DEBUG_ACTION: {
                        U.debug('NYI');
                        break;
                    }
                    case C.EXPR:
                        this.evalExpr(stmt);
                        break;
                    case C.GET_SAMPLE: {
                        this.robotBehaviour.getSample(this.state, stmt[C.NAME], stmt[C.GET_SAMPLE], stmt[C.PORT], stmt[C.MODE]);
                        break;
                    }
                    case C.NNSTEP_STMT:
                        this.evalNNStep();
                        break;
                    case C.LED_ON_ACTION: {
                        var color_1 = this.state.pop();
                        this.robotBehaviour.ledOnAction(stmt[C.NAME], stmt[C.PORT], color_1);
                        break;
                    }
                    case C.RETURN:
                        var returnValue = void 0;
                        if (stmt[C.VALUES])
                            returnValue = this.state.pop();
                        var returnAddress = this.state.pop();
                        this.state.pc = returnAddress;
                        if (stmt[C.VALUES])
                            this.state.push(returnValue);
                        break;
                    case C.MOTOR_ON_ACTION: {
                        var speedOnly = stmt[C.SPEED_ONLY];
                        var duration = speedOnly ? undefined : this.state.pop();
                        var speed = this.state.pop();
                        var name_2 = stmt[C.NAME];
                        var port = stmt[C.PORT];
                        var durationType = stmt[C.MOTOR_DURATION];
                        if (durationType === C.DEGREE || durationType === C.DISTANCE || durationType === C.ROTATIONS) {
                            // if durationType is defined, then duration must be defined, too. Thus, it is never 'undefined' :-)
                            var rotationPerSecond = (C.MAX_ROTATION * Math.abs(speed)) / 100.0;
                            duration = (duration / rotationPerSecond) * 1000;
                            if (durationType === C.DEGREE) {
                                duration /= 360.0;
                            }
                        }
                        this.robotBehaviour.motorOnAction(name_2, port, duration, speed);
                        return [duration ? duration : 0, true];
                    }
                    case C.DRIVE_ACTION: {
                        var speedOnly = stmt[C.SPEED_ONLY];
                        var setTime = stmt[C.SET_TIME];
                        var name_3 = stmt[C.NAME];
                        var time = void 0;
                        var distance = void 0;
                        if (setTime) {
                            distance = undefined;
                            time = setTime ? this.state.pop() : undefined;
                        }
                        else {
                            time = undefined;
                            distance = speedOnly ? undefined : this.state.pop();
                        }
                        var speed = this.state.pop();
                        var direction = stmt[C.DRIVE_DIRECTION];
                        var duration = this.robotBehaviour.driveAction(name_3, direction, speed, distance, time);
                        return [duration, true];
                    }
                    case C.TURN_ACTION: {
                        var speedOnly = stmt[C.SPEED_ONLY];
                        var setTime = stmt[C.SET_TIME];
                        var time = void 0;
                        var angle = void 0;
                        if (setTime) {
                            angle = undefined;
                            time = setTime ? this.state.pop() : undefined;
                        }
                        else {
                            time = undefined;
                            angle = speedOnly ? undefined : this.state.pop();
                        }
                        var speed = this.state.pop();
                        var name_4 = stmt[C.NAME];
                        var direction = stmt[C.TURN_DIRECTION];
                        var duration = this.robotBehaviour.turnAction(name_4, direction, speed, angle, time);
                        return [duration, true];
                    }
                    case C.CURVE_ACTION: {
                        var speedOnly = stmt[C.SPEED_ONLY];
                        var setTime = stmt[C.SET_TIME];
                        var time = void 0;
                        var distance = void 0;
                        if (setTime) {
                            distance = undefined;
                            time = setTime ? this.state.pop() : undefined;
                        }
                        else {
                            time = undefined;
                            distance = speedOnly ? undefined : this.state.pop();
                        }
                        var speedR = this.state.pop();
                        var speedL = this.state.pop();
                        var name_5 = stmt[C.NAME];
                        var direction = stmt[C.DRIVE_DIRECTION];
                        var duration = this.robotBehaviour.curveAction(name_5, direction, speedL, speedR, distance, time);
                        return [duration, true];
                    }
                    case C.STOP_DRIVE:
                        var name_6 = stmt[C.NAME];
                        this.robotBehaviour.driveStop(name_6);
                        return [0, true];
                    case C.BOTH_MOTORS_ON_ACTION: {
                        var duration = this.state.pop();
                        var speedB = this.state.pop();
                        var speedA = this.state.pop();
                        var portA = stmt[C.PORT_A];
                        var portB = stmt[C.PORT_B];
                        this.robotBehaviour.motorOnAction(portA, portA, duration, speedA);
                        this.robotBehaviour.motorOnAction(portB, portB, duration, speedB);
                        return [duration, true];
                    }
                    case C.MOTOR_STOP: {
                        this.robotBehaviour.motorStopAction(stmt[C.NAME], stmt[C.PORT]);
                        return [0, true];
                    }
                    case C.MOTOR_SET_POWER: {
                        var speed = this.state.pop();
                        var name_7 = stmt[C.NAME];
                        var port = stmt[C.PORT];
                        this.robotBehaviour.setMotorSpeed(name_7, port, speed);
                        return [0, true];
                    }
                    case C.MOTOR_GET_POWER: {
                        var port = stmt[C.PORT];
                        this.robotBehaviour.getMotorSpeed(this.state, name_6, port);
                        break;
                    }
                    case C.SHOW_TEXT_ACTION: {
                        var text = this.state.pop();
                        var name_8 = stmt[C.NAME];
                        if (name_8 === 'ev3') {
                            var x = this.state.pop();
                            var y = this.state.pop();
                            this.robotBehaviour.showTextActionPosition(text, x, y);
                            return [0, true];
                        }
                        return [this.robotBehaviour.showTextAction(text, stmt[C.MODE]), true];
                    }
                    case C.SHOW_IMAGE_ACTION: {
                        var image = void 0;
                        if (stmt[C.NAME] == 'ev3') {
                            image = stmt[C.IMAGE];
                        }
                        else {
                            image = this.state.pop();
                        }
                        return [this.robotBehaviour.showImageAction(image, stmt[C.MODE]), true];
                    }
                    case C.DISPLAY_SET_BRIGHTNESS_ACTION: {
                        var b = this.state.pop();
                        return [this.robotBehaviour.displaySetBrightnessAction(b), true];
                    }
                    case C.IMAGE_SHIFT_ACTION: {
                        var nShift = this.state.pop();
                        var image = this.state.pop();
                        if (stmt[C.NAME] === 'mbot') {
                            this.state.push(this.shiftImageActionMbot(image, stmt[C.DIRECTION], nShift));
                        }
                        else {
                            this.state.push(this.shiftImageAction(image, stmt[C.DIRECTION], nShift));
                        }
                        break;
                    }
                    case C.DISPLAY_SET_PIXEL_BRIGHTNESS_ACTION: {
                        var b = this.state.pop();
                        var y = this.state.pop();
                        var x = this.state.pop();
                        return [this.robotBehaviour.displaySetPixelBrightnessAction(x, y, b), true];
                    }
                    case C.DISPLAY_GET_PIXEL_BRIGHTNESS_ACTION: {
                        var y = this.state.pop();
                        var x = this.state.pop();
                        this.robotBehaviour.displayGetPixelBrightnessAction(this.state, x, y);
                        break;
                    }
                    case C.LIGHT_ACTION:
                        var color = void 0;
                        if (stmt[C.NAME] === 'mbot') {
                            var rgb = this.state.pop();
                            color = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
                        }
                        else {
                            color = stmt[C.COLOR];
                        }
                        this.robotBehaviour.lightAction(stmt[C.MODE], color, stmt[C.PORT]);
                        return [0, true];
                    case C.STATUS_LIGHT_ACTION:
                        this.robotBehaviour.statusLightOffAction(stmt[C.NAME], stmt[C.PORT]);
                        return [0, true];
                    case C.STOP:
                        U.debug('PROGRAM TERMINATED. stop op');
                        this.terminated = true;
                        break;
                    case C.TEXT_JOIN: {
                        var n = stmt[C.NUMBER];
                        var result = new Array(n);
                        for (var i = 0; i < n; i++) {
                            var e = this.state.pop();
                            result[n - i - 1] = e;
                        }
                        this.state.push(result.join(''));
                        break;
                    }
                    case C.TIMER_SENSOR_RESET:
                        this.robotBehaviour.timerReset(stmt[C.PORT]);
                        break;
                    case C.ENCODER_SENSOR_RESET:
                        this.robotBehaviour.encoderReset(stmt[C.PORT]);
                        return [0, true];
                    case C.GYRO_SENSOR_RESET:
                        this.robotBehaviour.gyroReset(stmt[C.PORT]);
                        return [0, true];
                    case C.TONE_ACTION: {
                        var duration = this.state.pop();
                        var frequency = this.state.pop();
                        return [this.robotBehaviour.toneAction(stmt[C.NAME], frequency, duration), true];
                    }
                    case C.PLAY_FILE_ACTION:
                        return [this.robotBehaviour.playFileAction(stmt[C.FILE]), true];
                    case C.SET_VOLUME_ACTION:
                        this.robotBehaviour.setVolumeAction(this.state.pop());
                        return [0, true];
                    case C.GET_VOLUME:
                        this.robotBehaviour.getVolumeAction(this.state);
                        break;
                    case C.SET_LANGUAGE_ACTION:
                        this.robotBehaviour.setLanguage(stmt[C.LANGUAGE]);
                        break;
                    case C.SAY_TEXT_ACTION: {
                        var pitch = this.state.pop();
                        var speed = this.state.pop();
                        var text = this.state.pop();
                        return [this.robotBehaviour.sayTextAction(text, speed, pitch), true];
                    }
                    case C.UNBIND_VAR:
                        var variableToUnbind = stmt[C.NAME];
                        this.state.unbindVar(variableToUnbind);
                        break;
                    case C.VAR_DECLARATION: {
                        var name_9 = stmt[C.NAME];
                        this.state.bindVar(name_9, this.state.pop());
                        break;
                    }
                    case C.WAIT_TIME_STMT: {
                        var time = this.state.pop();
                        return [time, true]; // wait for handler being called
                    }
                    case C.WRITE_PIN_ACTION: {
                        var value = this.state.pop();
                        var mode = stmt[C.MODE];
                        var pin = stmt[C.PIN];
                        this.robotBehaviour.writePinAction(pin, mode, value);
                        return [0, true];
                    }
                    case C.LIST_OPERATION: {
                        var op = stmt[C.OP];
                        var loc = stmt[C.POSITION];
                        var ix = 0;
                        if (loc != C.LAST && loc != C.FIRST) {
                            ix = this.state.pop();
                        }
                        var value = this.state.pop();
                        var list = this.state.pop();
                        ix = this.getIndex(list, loc, ix);
                        if (op == C.SET) {
                            list[ix] = value;
                        }
                        else if (op == C.INSERT) {
                            if (loc === C.LAST) {
                                list.splice(ix + 1, 0, value);
                            }
                            else {
                                list.splice(ix, 0, value);
                            }
                        }
                        break;
                    }
                    case C.TEXT_APPEND:
                    case C.MATH_CHANGE: {
                        var value = this.state.pop();
                        var name_10 = stmt[C.NAME];
                        this.state.bindVar(name_10, this.state.pop() + value);
                        break;
                    }
                    case C.DEBUG_ACTION: {
                        var value = this.state.pop();
                        this.robotBehaviour.debugAction(value);
                        break;
                    }
                    case C.ASSERT_ACTION: {
                        var right = this.state.pop();
                        var left = this.state.pop();
                        var value = this.state.pop();
                        this.robotBehaviour.assertAction(stmt[C.MSG], left, stmt[C.OP], right, value);
                        break;
                    }
                    case C.COMMENT: {
                        break;
                    }
                    default:
                        U.dbcException('invalid stmt op: ' + opCode);
                }
            }
            return [0, false];
        };
        /**
         *  called from @see evalSingleOperation() to evaluate all kinds of expressions
         *
         * . @param expr to be evaluated
         */
        Interpreter.prototype.evalExpr = function (expr) {
            var _a;
            var kind = expr[C.EXPR];
            switch (kind) {
                case C.VAR:
                    this.state.push(this.state.getVar(expr[C.NAME]));
                    break;
                case C.NUM_CONST:
                    this.state.push(+expr[C.VALUE]);
                    break;
                case C.CREATE_LIST: {
                    var n = expr[C.NUMBER];
                    var arr = new Array(n);
                    for (var i = 0; i < n; i++) {
                        var e = this.state.pop();
                        arr[n - i - 1] = e;
                    }
                    this.state.push(arr);
                    break;
                }
                case C.CREATE_LIST_REPEAT: {
                    var rep = this.state.pop();
                    var val = this.state.pop();
                    var arr = new Array();
                    for (var i = 0; i < rep; i++) {
                        arr[i] = val;
                    }
                    this.state.push(arr);
                    break;
                }
                case C.BOOL_CONST:
                    this.state.push(expr[C.VALUE]);
                    break;
                case C.STRING_CONST:
                    this.state.push(expr[C.VALUE]);
                    break;
                case C.COLOR_CONST:
                    this.state.push(expr[C.VALUE]);
                    break;
                case C.IMAGE:
                    this.state.push(expr[C.VALUE]);
                    break;
                case C.RGB_COLOR_CONST: {
                    var b = this.state.pop();
                    var g = this.state.pop();
                    var r = this.state.pop();
                    this.state.push([r, g, b]);
                    break;
                }
                case C.UNARY: {
                    var subOp = expr[C.OP];
                    switch (subOp) {
                        case C.NOT:
                            var truthy;
                            var bool = this.state.pop();
                            if (bool === 'true') {
                                truthy = true;
                            }
                            else if (bool === 'false' || bool === '0' || bool === '') {
                                truthy = false;
                            }
                            else {
                                truthy = !!bool;
                            }
                            this.state.push(!truthy);
                            break;
                        case C.NEG:
                            var value_1 = this.state.pop();
                            this.state.push(-value_1);
                            break;
                        default:
                            U.dbcException('invalid unary expr subOp: ' + subOp);
                    }
                    break;
                }
                case C.MATH_CONST: {
                    var value_2 = expr[C.VALUE];
                    switch (value_2) {
                        case 'PI':
                            this.state.push(Math.PI);
                            break;
                        case 'E':
                            this.state.push(Math.E);
                            break;
                        case 'GOLDEN_RATIO':
                            this.state.push((1.0 + Math.sqrt(5.0)) / 2.0);
                            break;
                        case 'SQRT2':
                            this.state.push(Math.SQRT2);
                            break;
                        case 'SQRT1_2':
                            this.state.push(Math.SQRT1_2);
                            break;
                        case 'INFINITY':
                            this.state.push(Infinity);
                            break;
                        default:
                            throw 'Invalid Math Constant Name';
                    }
                    break;
                }
                case C.SINGLE_FUNCTION: {
                    var subOp = expr[C.OP];
                    var value_3 = this.state.pop();
                    U.debug('---------- ' + subOp + ' with ' + value_3);
                    switch (subOp) {
                        case 'SQUARE':
                            this.state.push(Math.pow(value_3, 2));
                            break;
                        case 'ROOT':
                            this.state.push(Math.sqrt(value_3));
                            break;
                        case 'ABS':
                            this.state.push(Math.abs(value_3));
                            break;
                        case 'LN':
                            this.state.push(Math.log(value_3));
                            break;
                        case 'LOG10':
                            this.state.push(Math.log(value_3) / Math.LN10);
                            break;
                        case 'EXP':
                            this.state.push(Math.exp(value_3));
                            break;
                        case 'POW10':
                            this.state.push(Math.pow(10, value_3));
                            break;
                        case 'SIN':
                            this.state.push(Math.sin(value_3));
                            break;
                        case 'COS':
                            this.state.push(Math.cos(value_3));
                            break;
                        case 'TAN':
                            this.state.push(Math.tan(value_3));
                            break;
                        case 'ASIN':
                            this.state.push(Math.asin(value_3));
                            break;
                        case 'ATAN':
                            this.state.push(Math.atan(value_3));
                            break;
                        case 'ACOS':
                            this.state.push(Math.acos(value_3));
                            break;
                        case 'ROUND':
                            this.state.push(Math.round(value_3));
                            break;
                        case 'ROUNDUP':
                            this.state.push(Math.ceil(value_3));
                            break;
                        case 'ROUNDDOWN':
                            this.state.push(Math.floor(value_3));
                            break;
                        case C.IMAGE_INVERT_ACTION:
                            this.state.push(this.invertImage(value_3));
                            break;
                        default:
                            throw 'Invalid Function Name';
                    }
                    break;
                }
                case C.MATH_CONSTRAIN_FUNCTION: {
                    var max_1 = this.state.pop();
                    var min_1 = this.state.pop();
                    var value_4 = this.state.pop();
                    this.state.push(Math.min(Math.max(value_4, min_1), max_1));
                    break;
                }
                case C.RANDOM_INT: {
                    var max = this.state.pop();
                    var min = this.state.pop();
                    if (min > max) {
                        _a = [max, min], min = _a[0], max = _a[1];
                    }
                    this.state.push(Math.floor(Math.random() * (max - min + 1) + min));
                    break;
                }
                case C.RANDOM_DOUBLE:
                    this.state.push(Math.random());
                    break;
                case C.MATH_PROP_FUNCT: {
                    var subOp = expr[C.OP];
                    var value_5 = this.state.pop();
                    switch (subOp) {
                        case 'EVEN':
                            this.state.push(this.isWhole(value_5) && value_5 % 2 === 0);
                            break;
                        case 'ODD':
                            this.state.push(this.isWhole(value_5) && value_5 % 2 !== 0);
                            break;
                        case 'PRIME':
                            this.state.push(this.isPrime(value_5));
                            break;
                        case 'WHOLE':
                            this.state.push(this.isWhole(value_5));
                            break;
                        case 'POSITIVE':
                            this.state.push(value_5 >= 0);
                            break;
                        case 'NEGATIVE':
                            this.state.push(value_5 < 0);
                            break;
                        case 'DIVISIBLE_BY':
                            var first = this.state.pop();
                            this.state.push(first % value_5 === 0);
                            break;
                        default:
                            throw 'Invalid Math Property Function Name';
                    }
                    break;
                }
                case C.MATH_ON_LIST: {
                    var subOp = expr[C.OP];
                    var value_6 = this.state.pop();
                    switch (subOp) {
                        case C.SUM:
                            this.state.push(this.sum(value_6));
                            break;
                        case C.MIN:
                            this.state.push(this.min(value_6));
                            break;
                        case C.MAX:
                            this.state.push(this.max(value_6));
                            break;
                        case C.AVERAGE:
                            this.state.push(this.mean(value_6));
                            break;
                        case C.MEDIAN:
                            this.state.push(this.median(value_6));
                            break;
                        case C.STD_DEV:
                            this.state.push(this.std(value_6));
                            break;
                        case C.RANDOM:
                            this.state.push(value_6[this.getRandomInt(value_6.length)]);
                            break;
                        default:
                            throw 'Invalid Math on List Function Name';
                    }
                    break;
                }
                case C.CAST_STRING: {
                    var num = this.state.pop();
                    this.state.push(num.toString());
                    break;
                }
                case C.CAST_CHAR: {
                    var num = this.state.pop();
                    this.state.push(String.fromCharCode(num));
                    break;
                }
                case C.CAST_STRING_NUMBER: {
                    var value = this.state.pop();
                    this.state.push(parseFloat(value));
                    break;
                }
                case C.CAST_CHAR_NUMBER: {
                    var index = this.state.pop();
                    var value = this.state.pop();
                    this.state.push(value.charCodeAt(index));
                    break;
                }
                case C.LIST_OPERATION: {
                    var subOp = expr[C.OP];
                    switch (subOp) {
                        case C.LIST_IS_EMPTY:
                            this.state.push(this.state.pop().length == 0);
                            break;
                        case C.LIST_LENGTH:
                            this.state.push(this.state.pop().length);
                            break;
                        case C.LIST_FIND_ITEM:
                            {
                                var item = this.state.pop();
                                var list = this.state.pop();
                                if (expr[C.POSITION] == C.FIRST) {
                                    this.state.push(list.indexOf(item));
                                }
                                else {
                                    this.state.push(list.lastIndexOf(item));
                                }
                            }
                            break;
                        case C.GET:
                        case C.REMOVE:
                        case C.GET_REMOVE:
                            {
                                var loc = expr[C.POSITION];
                                var ix = 0;
                                if (loc != C.LAST && loc != C.FIRST) {
                                    ix = this.state.pop();
                                }
                                var list = this.state.pop();
                                ix = this.getIndex(list, loc, ix);
                                var v = list[ix];
                                if (subOp == C.GET_REMOVE || subOp == C.GET) {
                                    this.state.push(v);
                                }
                                if (subOp == C.GET_REMOVE || subOp == C.REMOVE) {
                                    list.splice(ix, 1);
                                }
                            }
                            break;
                        case C.LIST_GET_SUBLIST:
                            {
                                var position = expr[C.POSITION];
                                var start_ix = void 0;
                                var end_ix = void 0;
                                if (position[1] != C.LAST) {
                                    end_ix = this.state.pop();
                                }
                                if (position[0] != C.FIRST) {
                                    start_ix = this.state.pop();
                                }
                                var list = this.state.pop();
                                start_ix = this.getIndex(list, position[0], start_ix);
                                end_ix = this.getIndex(list, position[1], end_ix) + 1;
                                this.state.push(list.slice(start_ix, end_ix));
                            }
                            break;
                        default:
                            throw 'Invalid Op on List Function Name';
                    }
                    break;
                }
                case C.BINARY: {
                    var subOp = expr[C.OP];
                    var right = this.state.pop();
                    var left = this.state.pop();
                    this.state.push(this.evalBinary(subOp, left, right));
                    break;
                }
                default:
                    U.dbcException('invalid expr op: ' + kind);
            }
        };
        Interpreter.prototype.evalBinary = function (subOp, left, right) {
            var leftIsArray = Array.isArray(left);
            var rightIsArray = Array.isArray(right);
            if (leftIsArray && rightIsArray) {
                var leftLen = left.length;
                var rightLen = right.length;
                switch (subOp) {
                    case C.EQ:
                        if (leftLen === rightLen) {
                            for (var i = 0; i < leftLen; i++) {
                                if (!this.evalBinary(subOp, left[i], right[i])) {
                                    return false;
                                }
                            }
                            return true;
                        }
                        else {
                            return false;
                        }
                    case C.NEQ:
                        if (leftLen === rightLen) {
                            for (var i = 0; i < leftLen; i++) {
                                if (this.evalBinary(subOp, left[i], right[i])) {
                                    return true;
                                }
                            }
                            return false;
                        }
                        else {
                            return true;
                        }
                    default:
                        U.dbcException('invalid binary expr supOp for array-like structures: ' + subOp);
                }
            }
            else if (leftIsArray || rightIsArray) {
                return false;
            }
            else {
                switch (subOp) {
                    case C.EQ:
                        return left == right;
                    case C.NEQ:
                        return left !== right;
                    case C.LT:
                        return left < right;
                    case C.LTE:
                        return left <= right;
                    case C.GT:
                        return left > right;
                    case C.GTE:
                        return left >= right;
                    case C.AND:
                        return left && right;
                    case C.OR:
                        return left || right;
                    case C.ADD:
                        return 0 + left + right;
                    case C.MINUS:
                        return 0 + left - right;
                    case C.MULTIPLY:
                        return 0 + left * right;
                    case C.DIVIDE:
                        return 0 + left / right;
                    case C.POWER:
                        return Math.pow(left, right);
                    case C.MOD:
                        return left % right;
                    default:
                        U.dbcException('invalid binary expr supOp: ' + subOp);
                }
            }
        };
        Interpreter.prototype.evalNNStep = function () {
            console.log('NNStep encountered');
            var s = this.state;
            var i2 = s.pop();
            var i1 = s.pop();
            var i0 = s.pop();
            var inputData = [i0, i1, i2];
            var outputData = PG.oneStep(inputData);
            for (var i = outputData.length - 1; i >= 0; i--) {
                s.push(outputData[i]);
            }
        };
        /**
         * return true if the parameter is prime
         *
         * . @param n to be checked for primality
         */
        Interpreter.prototype.isPrime = function (n) {
            if (n < 2) {
                return false;
            }
            if (n === 2) {
                return true;
            }
            if (n % 2 === 0) {
                return false;
            }
            for (var i = 3, s = Math.sqrt(n); i <= s; i += 2) {
                if (n % i === 0) {
                    return false;
                }
            }
            return true;
        };
        /**
         * return true if the value is whole number
         *
         * . @param value to be checked
         */
        Interpreter.prototype.isWhole = function (value) {
            return Number(value) === value && value % 1 === 0;
        };
        Interpreter.prototype.min = function (values) {
            return Math.min.apply(null, values);
        };
        Interpreter.prototype.max = function (values) {
            return Math.max.apply(null, values);
        };
        Interpreter.prototype.sum = function (values) {
            return values.reduce(function (a, b) { return a + b; }, 0);
        };
        Interpreter.prototype.mean = function (value) {
            var v = this.sum(value) / value.length;
            return Number(v.toFixed(2));
        };
        Interpreter.prototype.median = function (values) {
            values.sort(function (a, b) { return a - b; });
            var median = (values[(values.length - 1) >> 1] + values[values.length >> 1]) / 2;
            return Number(median.toFixed(2));
        };
        Interpreter.prototype.std = function (values) {
            var avg = this.mean(values);
            var diffs = values.map(function (value) { return value - avg; });
            var squareDiffs = diffs.map(function (diff) { return diff * diff; });
            var avgSquareDiff = this.mean(squareDiffs);
            return Number(Math.sqrt(avgSquareDiff).toFixed(2));
        };
        Interpreter.prototype.getRandomInt = function (max) {
            return Math.floor(Math.random() * Math.floor(max));
        };
        //    private round2precision( x: number, precision: number ): number {
        //        var y = +x + ( precision === undefined ? 0.5 : precision / 2 );
        //        return y - ( y % ( precision === undefined ? 1 : +precision ) );
        //    }
        Interpreter.prototype.getIndex = function (list, loc, ix) {
            if (loc == C.FROM_START) {
                return ix;
            }
            else if (loc == C.FROM_END) {
                return list.length - 1 - ix;
            }
            else if (loc == C.FIRST) {
                return 0;
            }
            else if (loc == C.LAST) {
                return list.length - 1;
            }
            else {
                throw 'Unhandled option (lists_getSublist).';
            }
        };
        Interpreter.prototype.invertImage = function (image) {
            for (var i = 0; i < image.length; i++) {
                for (var j = 0; j < image[i].length; j++) {
                    image[i][j] = Math.abs(255 - image[i][j]);
                }
            }
            return image;
        };
        Interpreter.prototype.shiftImageAction = function (image, direction, nShift) {
            nShift = Math.round(nShift);
            var shift = {
                down: function () {
                    image.pop();
                    image.unshift([0, 0, 0, 0, 0]);
                },
                up: function () {
                    image.shift();
                    image.push([0, 0, 0, 0, 0]);
                },
                right: function () {
                    image.forEach(function (array) {
                        array.pop();
                        array.unshift(0);
                    });
                },
                left: function () {
                    image.forEach(function (array) {
                        array.shift();
                        array.push(0);
                    });
                },
            };
            if (nShift < 0) {
                nShift *= -1;
                if (direction === 'up') {
                    direction = 'down';
                }
                else if (direction === 'down') {
                    direction = 'up';
                }
                else if (direction === 'left') {
                    direction = 'right';
                }
                else if (direction === 'right') {
                    direction = 'left';
                }
            }
            for (var i = 0; i < nShift; i++) {
                shift[direction]();
            }
            return image;
        };
        Interpreter.prototype.shiftImageActionMbot = function (image, direction, nShift) {
            nShift = Math.round(nShift);
            var shift = {
                left: function () {
                    image.pop();
                    image.unshift([0, 0, 0, 0, 0, 0, 0, 0]);
                },
                right: function () {
                    image.shift();
                    image.push([0, 0, 0, 0, 0, 0, 0, 0]);
                },
                up: function () {
                    image.forEach(function (array) {
                        array.pop();
                        array.unshift(0);
                    });
                },
                down: function () {
                    image.forEach(function (array) {
                        array.shift();
                        array.push(0);
                    });
                },
            };
            if (nShift < 0) {
                nShift *= -1;
                if (direction === 'up') {
                    direction = 'down';
                }
                else if (direction === 'down') {
                    direction = 'up';
                }
                else if (direction === 'left') {
                    direction = 'right';
                }
                else if (direction === 'right') {
                    direction = 'left';
                }
            }
            for (var i = 0; i < nShift; i++) {
                shift[direction]();
            }
            return image;
        };
        Interpreter.isPossibleStepInto = function (op) {
            var _a;
            if (((_a = op[C.POSSIBLE_DEBUG_STOP]) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                return true;
            }
            return false;
        };
        Interpreter.isPossibleStepOver = function (op) {
            var isMethodCall = op[C.OPCODE] === C.COMMENT && op[C.TARGET] === C.METHOD_CALL;
            return op.hasOwnProperty(C.HIGHTLIGHT_PLUS) && isMethodCall;
        };
        Interpreter.isBreakPoint = function (op, breakpoints) {
            var _a, _b;
            if ((_a = op[C.POSSIBLE_DEBUG_STOP]) === null || _a === void 0 ? void 0 : _a.some(function (blockId) { return breakpoints.indexOf(blockId) >= 0; })) {
                return true;
            }
            if ((_b = op[C.HIGHTLIGHT_PLUS]) === null || _b === void 0 ? void 0 : _b.some(function (blockId) { return breakpoints.indexOf(blockId) >= 0; })) {
                return true;
            }
            return false;
        };
        return Interpreter;
    }());
    exports.Interpreter = Interpreter;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJwcmV0ZXIuaW50ZXJwcmV0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL25lcG9zdGFja21hY2hpbmUvaW50ZXJwcmV0ZXIuaW50ZXJwcmV0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBUUE7UUFhSTs7Ozs7V0FLRztRQUNILHFCQUFZLGFBQWtCLEVBQUUsQ0FBa0IsRUFBRSxlQUEyQixFQUFFLGNBQXFCO1lBakI5RixlQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ25CLDBCQUFxQixHQUFHLFNBQVMsQ0FBQztZQVF6QixlQUFVLEdBQUcsQ0FBQyxDQUFDO1lBUzVCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxlQUFlLENBQUM7WUFDN0MsSUFBTSxLQUFLLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQztZQUV4QixJQUFJLENBQUMsV0FBVyxHQUFHLGNBQWMsQ0FBQztZQUVsQyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztZQUNqQixJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxLQUFLLENBQUM7WUFDeEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLEdBQUcsS0FBSyxDQUFDO1lBRXZDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1lBQ3RCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7WUFDN0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7WUFFMUIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJ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