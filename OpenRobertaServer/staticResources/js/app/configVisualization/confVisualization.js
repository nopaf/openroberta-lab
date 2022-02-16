var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
define(["require", "exports", "./wires", "./const.robots", "./robotBlock", "./port", "jquery"], function (require, exports, wires_1, const_robots_1, robotBlock_1, port_1, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CircuitVisualization = void 0;
    var SEP = 2.5;
    var STROKE = 1.8;
    // fix for IE which does not have the remove function
    if (!('remove' in Element.prototype)) {
        Element.prototype.remove = function () {
            if (this.parentNode) {
                this.parentNode.removeChild(this);
            }
        };
    }
    var CircuitVisualization = /** @class */ (function () {
        function CircuitVisualization(workspace, dom) {
            var _this = this;
            this.scale = 1;
            this.observers = [];
            this.clear = function () {
                while (_this.workspace.getAllBlocks().length) {
                    _this.workspace.getAllBlocks()[0].dispose();
                }
            };
            this.onChangeListener = function (event) {
                if (!event.blockId) {
                    return;
                }
                var block = _this.workspace.getBlockById(event.blockId);
                switch (event.type) {
                    case window.Blockly.Events.CREATE:
                        _this.createBlockPorts(block);
                        _this.initEventListeners(block);
                        _this.renderBlockConnections(block);
                        break;
                    case window.Blockly.Events.CHANGE:
                        _this.updateBlockPorts(block);
                        _this.updateConnections(block);
                        _this.renderBlockConnections(block);
                        break;
                    case window.Blockly.Events.DELETE:
                        _this.deleteConnections(event.blockId);
                        if (block && block.ports) {
                            block.ports.forEach(function (port) { return port.element.remove(); });
                        }
                        break;
                }
            };
            this.updateBlockPorts = function (block) {
                block.ports.forEach(function (port) {
                    var position = port.position;
                    port.moveTo(__assign(__assign({}, position), { x: _this.calculatePortPosition(block, port.connectedTo) }));
                });
                _this.connections = _this.connections.map(function (_a) {
                    var position = _a.position, connectedTo = _a.connectedTo, others = __rest(_a, ["position", "connectedTo"]);
                    if (others.blockId !== block.id) {
                        return __assign({ position: position, connectedTo: connectedTo }, others);
                    }
                    return __assign({ position: __assign(__assign({}, position), { x: _this.calculatePortPosition(block, connectedTo) }), connectedTo: connectedTo }, others);
                });
            };
            this.createBlockPorts = function (block) {
                block.ports = [];
                block.inputList.forEach(function (input, index) {
                    if (index === 0) {
                        if (_this.robot.getPortByName(block.confBlock)) {
                            _this.appendPortAndConnection(block, input.fieldRow[0].textElement_, name, block.confBlock);
                        }
                    }
                    else {
                        input.fieldRow.forEach(function (_a) {
                            var fieldGroup_ = _a.fieldGroup_, name = _a.name, value_ = _a.value_;
                            name = name || value_;
                            if (name) {
                                var connectedTo = _this.robot.getPortByName(block.confBlock + ' ' + value_)
                                    ? block.confBlock + ' ' + value_
                                    : _this.robot.getPortByName(block.getFieldValue(name))
                                        ? block.getFieldValue(name)
                                        : _this.robot.getPortByName(name)
                                            ? name
                                            : null;
                                if (connectedTo) {
                                    _this.appendPortAndConnection(block, fieldGroup_, name, connectedTo);
                                }
                            }
                        });
                    }
                });
            };
            this.appendPortAndConnection = function (block, svgElement, name, connectedTo) {
                var matrix = svgElement.transform.baseVal.getItem(0).matrix;
                var position = {
                    x: _this.calculatePortPosition(block, connectedTo),
                    y: matrix.f + 6,
                };
                var port = new port_1.Port(block.getSvgRoot(), name, position, connectedTo);
                block.ports.push(port);
                var wireColor = wires_1.default.getColor(block, name);
                var wireSvg = window.Blockly.createSvgElement('path', {
                    fill: 'none',
                    stroke: wireColor,
                    'stroke-width': STROKE,
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                }, _this.wireGroup);
                _this.connections.push({
                    blockId: block.id,
                    connectedTo: connectedTo,
                    blockPort: port,
                    name: name,
                    position: position,
                    wireSvg: wireSvg,
                });
            };
            this.updateConnections = function (block) {
                var connections = _this.connections.filter(function (connection) { return connection.blockId === block.id; });
                connections = connections.map(function (_a) {
                    var name = _a.name, others = __rest(_a, ["name"]);
                    return (__assign(__assign({ name: name }, others), { connectedTo: _this.robot.getPortByName(block.confBlock + ' ' + block.getFieldValue(name))
                            ? block.confBlock + ' ' + block.getFieldValue(name)
                            : block.getFieldValue(name) || others.connectedTo }));
                });
                _this.connections = _this.connections.filter(function (connection) { return connection.blockId !== block.id; });
                _this.connections = __spreadArrays(_this.connections, connections);
            };
            this.deleteConnections = function (blockId) {
                _this.connections = _this.connections.filter(function (connection) {
                    if (connection.blockId === blockId) {
                        connection.wireSvg.remove();
                        return false;
                    }
                    return true;
                });
            };
            this.dom = dom;
            this.workspace = workspace;
            if (!window.Blockly) {
                throw new Error('Blockly required');
            }
            this.components = {};
            this.connections = [];
            this.currentRobot = this.workspace.device + '_' + this.workspace.subDevice;
            this.injectRobotBoard();
            this.workspace.addChangeListener(this.onChangeListener);
            this.wireGroup = window.Blockly.createSvgElement('g', { id: 'wireGroup' }, this.workspace.getCanvas());
        }
        CircuitVisualization.domToWorkspace = function (dom, workspace) {
            var confVis = new CircuitVisualization(workspace, dom);
            return {
                dispose: confVis.dispose.bind(confVis),
                refresh: confVis.refresh.bind(confVis),
                resetRobot: confVis.reset.bind(confVis),
                getXml: confVis.getXml.bind(confVis),
            };
        };
        CircuitVisualization.isRobotVisualized = function (robotGroup, robot) {
            return const_robots_1.ROBOTS[robotGroup + '_' + robot] || const_robots_1.ROBOTS[robotGroup] !== undefined;
        };
        CircuitVisualization.prototype.reset = function () {
            var currentRobot = this.workspace.device + '_' + this.workspace.subDevice;
            if (currentRobot !== this.currentRobot) {
                this.currentRobot = currentRobot;
                this.dom = this.getXml();
                this.clear();
                this.injectRobotBoard();
            }
        };
        CircuitVisualization.prototype.refresh = function () {
            var _this = this;
            this.workspace.getAllBlocks().forEach(function (block) {
                _this.updateBlockPorts(block);
                _this.renderConnections(_this.connections);
            });
        };
        CircuitVisualization.prototype.dispose = function () {
            this.workspace.removeChangeListener(this.onChangeListener);
            this.wireGroup.remove();
            this.observers.forEach(function (observer) { return observer.disconnect(); });
            this.observers = [];
        };
        CircuitVisualization.prototype.getXml = function () {
            return window.Blockly.Xml.workspaceToDom(this.workspace);
        };
        CircuitVisualization.prototype.injectRobotBoard = function () {
            window.Blockly.Blocks['robConf_robot'] = robotBlock_1.createRobotBlock(this.currentRobot);
            if (!this.dom.querySelector('block[type=robConf_robot]')) {
                var robotXml = "<instance x='250' y='250'><block type='robConf_robot' id='robot'></block></instance>";
                var oParser = new DOMParser();
                var robotElement = oParser.parseFromString(robotXml, 'text/xml').firstChild;
                this.dom.appendChild(robotElement);
            }
            window.Blockly.Xml.domToWorkspace(this.dom, this.workspace);
            this.robot = this.workspace.getBlockById('robot');
        };
        CircuitVisualization.prototype.initEventListeners = function (block) {
            var _this = this;
            var observer = new MutationObserver(function () {
                return _this.renderBlockConnections(block);
            });
            observer.observe(block.svgGroup_, {
                childList: false,
                subtree: false,
                attributes: true,
                attributeFilter: ['transform'],
            });
            this.observers.push(observer);
        };
        CircuitVisualization.prototype.renderBlockConnections = function (block) {
            if (block.id !== 'robot') {
                return this.renderConnections(this.connections.filter(function (_a) {
                    var blockId = _a.blockId;
                    return blockId === block.id;
                }));
            }
            return this.renderConnections(this.connections);
        };
        CircuitVisualization.prototype.renderConnections = function (connections) {
            var _this = this;
            if (connections.length === 0) {
                return;
            }
            var robotPosition = this.robot.getRelativeToSurfaceXY();
            connections.forEach(function (_a) {
                var blockId = _a.blockId, position = _a.position, connectedTo = _a.connectedTo, wireSvg = _a.wireSvg, blockPort = _a.blockPort;
                var block = _this.workspace.getBlockById(blockId);
                if (!block) {
                    return;
                }
                if (_this.needToUpdateBlockPorts(block, position, connectedTo)) {
                    _this.updateBlockPorts(block);
                    position.x = _this.calculatePortPosition(block, connectedTo);
                }
                var blockPosition = block.getRelativeToSurfaceXY();
                var origin = {
                    x: blockPosition.x + position.x + SEP,
                    y: blockPosition.y + position.y + SEP,
                };
                var robotConnection = _this.robot.getPortByName(connectedTo);
                if (!robotConnection) {
                    return;
                }
                var destination = {
                    x: robotPosition.x + robotConnection.position.x + SEP,
                    y: robotPosition.y + robotConnection.position.y + SEP,
                };
                var wireShouldWrap = _this.shouldWireWrap(block, destination);
                var drawer = new wires_1.default(origin, destination, block.ports.indexOf(blockPort), wireShouldWrap ? _this.calculateBlockCorners(block) : undefined);
                wireSvg.setAttribute('d', drawer.path);
                wireSvg.setAttribute('stroke-width', STROKE);
            });
            $(this.wireGroup).remove().appendTo(this.workspace.getCanvas());
        };
        CircuitVisualization.prototype.shouldWireWrap = function (block, destination) {
            var _a = this.calculateBlockCorners(block), _b = _a.lowerRight, rightEdge = _b.x, lowerEdge = _b.y, _c = _a.upperLeft, leftEdge = _c.x, upperEdge = _c.y;
            return leftEdge - wires_1.default.SEPARATOR <= destination.x && destination.x <= rightEdge + wires_1.default.SEPARATOR;
        };
        CircuitVisualization.prototype.calculateBlockCorners = function (block) {
            var relativeUpperLeft = block.getRelativeToSurfaceXY();
            return {
                upperLeft: relativeUpperLeft,
                lowerRight: {
                    x: relativeUpperLeft.x + block.width,
                    y: relativeUpperLeft.y + block.height,
                },
            };
        };
        CircuitVisualization.prototype.needToUpdateBlockPorts = function (block, portPosition, connectedTo) {
            if (connectedTo) {
                return portPosition.x !== this.calculatePortPosition(block, connectedTo);
            }
        };
        CircuitVisualization.prototype.calculatePortPosition = function (block, connectedTo) {
            var blockPosition = block.getRelativeToSurfaceXY().x + block.width / 2;
            var robotPortPosition = this.robot.getRelativeToSurfaceXY().x + this.robot.getPortByName(connectedTo).position.x;
            if (blockPosition < robotPortPosition) {
                return block.width - SEP;
            }
            return -SEP;
        };
        return CircuitVisualization;
    }());
    exports.CircuitVisualization = CircuitVisualization;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZlZpc3VhbGl6YXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL2NvbmZpZ1Zpc3VhbGl6YXRpb24vY29uZlZpc3VhbGl6YXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFPQSxJQUFNLEdBQUcsR0FBRyxHQUFHLENBQUM7SUFDaEIsSUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDO0lBRW5CLHFEQUFxRDtJQUNyRCxJQUFJLENBQUMsQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQ2pDLE9BQU8sQ0FBQyxTQUFpQixDQUFDLE1BQU0sR0FBRztZQUNoQyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7Z0JBQ2pCLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQ3JDO1FBQ0wsQ0FBQyxDQUFDO0tBQ0w7SUFXRDtRQVlJLDhCQUFZLFNBQWMsRUFBRSxHQUFXO1lBQXZDLGlCQVlDO1lBZkQsVUFBSyxHQUFXLENBQUMsQ0FBQztZQUNsQixjQUFTLEdBQXVCLEVBQUUsQ0FBQztZQXdFbkMsVUFBSyxHQUFHO2dCQUNKLE9BQU8sS0FBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLEVBQUU7b0JBQ3pDLEtBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7aUJBQzlDO1lBQ0wsQ0FBQyxDQUFDO1lBRUYscUJBQWdCLEdBQUcsVUFBQyxLQUFLO2dCQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRTtvQkFDaEIsT0FBTztpQkFDVjtnQkFDRCxJQUFNLEtBQUssR0FBRyxLQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENB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