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
define(["require", "exports", "./port", "./const.robots"], function (require, exports, port_1, const_robots_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createRobotBlock = void 0;
    var RobotViewField = /** @class */ (function (_super) {
        __extends(RobotViewField, _super);
        function RobotViewField(robot) {
            var _this = _super.call(this) || this;
            _this.robot = robot;
            _this.robotImageSrc = const_robots_1.ROBOTS[_this.robot.group + '_' + _this.robot.name]
                ? _this.robot.group + '_' + _this.robot.name
                : const_robots_1.ROBOTS[_this.robot.group]
                    ? _this.robot.group
                    : null;
            if (_this.robotImageSrc) {
                _this.width = const_robots_1.ROBOTS[_this.robotImageSrc]['width'];
                _this.height = const_robots_1.ROBOTS[_this.robotImageSrc]['height'];
                _this.size = new window.goog.math.Size(_this.width, _this.height + 2 * window.Blockly.BlockSvg.INLINE_PADDING_Y);
                _this.ports_ = [];
            }
            else {
                console.error('robot image invalid!');
            }
            return _this;
        }
        RobotViewField.prototype.init = function () {
            if (this.element_) {
                return;
            }
            this.element_ = window.Blockly.createSvgElement('g', {}, null);
            if (!this.visible_) {
                this.element_.style.display = 'none';
            }
            this.initBoardView_();
            this.initPorts_();
            this.sourceBlock_.getSvgRoot().appendChild(this.element_);
        };
        RobotViewField.prototype.initBoardView_ = function () {
            var workspace = window.Blockly.getMainWorkspace();
            this.board_ = window.Blockly.createSvgElement('image', {}, this.element_);
            var robotSrc = workspace.options.pathToMedia + 'robots/' + this.robotImageSrc + '.svg';
            var board = this.board_;
            board.setAttribute('href', robotSrc);
            board.setAttribute('x', 0);
            board.setAttribute('y', 0);
            board.setAttribute('width', this.width);
            board.setAttribute('height', this.height);
        };
        RobotViewField.prototype.initPorts_ = function () {
            var portsGroupSvg = window.Blockly.createSvgElement('g', {}, this.element_);
            var robot = const_robots_1.ROBOTS[this.robot.group + '_' + this.robot.name] || const_robots_1.ROBOTS[this.robot.group];
            this.ports_ = robot['ports'].map(function (props) {
                var name = props.name, position = props.position;
                var port = new port_1.Port(portsGroupSvg, name, position);
                return __assign({ portSvg: port.element }, props);
            });
        };
        RobotViewField.prototype.getPortByName = function (portName) {
            var index = this.ports_['findIndex'](function (port) { return port.name === portName; });
            return this.ports_[index];
        };
        RobotViewField.prototype.setPosition = function (position) {
            if (!position) {
                return;
            }
        };
        RobotViewField.EDITABLE = false;
        RobotViewField.rectElement_ = null;
        return RobotViewField;
    }(window.Blockly.Field));
    function createRobotBlock(robotIdentifier) {
        return {
            init: function () {
                var _this = this;
                this.type_ = 'robConf_robot';
                this.svgPath_.remove();
                this.robot_ = new RobotViewField(identifierToRobot(robotIdentifier));
                this.appendDummyInput()
                    .setAlign(window.Blockly.ALIGN_CENTRE)
                    .appendField(this.robot_, 'ROBOT');
                this.getPortByName = function (portName) {
                    return _this.robot_.getPortByName(portName);
                };
            },
        };
    }
    exports.createRobotBlock = createRobotBlock;
    function identifierToRobot(robotIdentifier) {
        var splits = robotIdentifier.split('_');
        var robot = {};
        robot['group'] = splits[0];
        robot['name'] = splits[1];
        return robot;
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm9ib3RCbG9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvY29uZmlnVmlzdWFsaXphdGlvbi9yb2JvdEJsb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUdBO1FBQTZCLGtDQUFnRDtRQWN6RSx3QkFBWSxLQUFLO1lBQWpCLFlBQ0ksaUJBQU8sU0FlVjtZQWRHLEtBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1lBQ25CLEtBQUksQ0FBQyxhQUFhLEdBQUcscUJBQU0sQ0FBQyxLQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0JBQ2pFLENBQUMsQ0FBQyxLQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsS0FBSSxDQUFDLEtBQUssQ0FBQyxJQUFJO2dCQUMxQyxDQUFDLENBQUMscUJBQU0sQ0FBQyxLQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztvQkFDMUIsQ0FBQyxDQUFDLEtBQUksQ0FBQyxLQUFLLENBQUMsS0FBSztvQkFDbEIsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNYLElBQUksS0FBSSxDQUFDLGFBQWEsRUFBRTtnQkFDcEIsS0FBSSxDQUFDLEtBQUssR0FBRyxxQkFBTSxDQUFDLEtBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDakQsS0FBSSxDQUFDLE1BQU0sR0FBRyxxQkFBTSxDQUFDLEtBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDbkQsS0FBSSxDQUFDLElBQUksR0FBRyxJQUFVLE1BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFJLENBQUMsS0FBSyxFQUFFLEtBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxH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