define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Port = void 0;
    var Port = /** @class */ (function () {
        function Port(parent, name, position, connectedTo) {
            this.position_ = position;
            this.element_ = window.Blockly.createSvgElement('rect', {
                class: 'port',
                width: 5,
                height: 5,
                fill: 'red',
                stroke: 'black',
                'stroke-width': 1,
                transform: "translate(" + position.x + ", " + position.y + ")",
                r: 3,
            }, parent);
            this.connectedTo = connectedTo;
            if (name) {
                this.element_.tooltip = name;
                window.Blockly.Tooltip.bindMouseEvents(parent);
            }
        }
        Port.prototype.moveTo = function (position) {
            this.position_ = position;
            this.element_.setAttribute('transform', "translate(" + position.x + ", " + position.y + ")");
        };
        Object.defineProperty(Port.prototype, "element", {
            get: function () {
                return this.element_;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Port.prototype, "position", {
            get: function () {
                return this.position_;
            },
            enumerable: false,
            configurable: true
        });
        return Port;
    }());
    exports.Port = Port;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9ydC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvY29uZmlnVmlzdWFsaXphdGlvbi9wb3J0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUFBO1FBS0ksY0FBWSxNQUFNLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxXQUFpQjtZQUNqRCxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztZQUMxQixJQUFJLENBQUMsUUFBUSxHQUFTLE1BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQ2xELE1BQU0sRUFDTjtnQkFDSSxLQUFLLEVBQUUsTUFBTTtnQkFDYixLQUFLLEVBQUUsQ0FBQztnQkFDUixNQUFNLEVBQUUsQ0FBQztnQkFDVCxJQUFJLEVBQUUsS0FBSztnQkFDWCxNQUFNLEVBQUUsT0FBTztnQkFDZixjQUFjLEVBQUUsQ0FBQztnQkFDakIsU0FBUyxFQUFFLGVBQWEsUUFBUSxDQUFDLENBQUMsVUFBSyxRQUFRLENBQUMsQ0FBQyxNQUFHO2dCQUNwRCxDQUFDLEVBQUUsQ0FBQzthQUNQLEVBQ0QsTUFBTSxDQUNULENBQUM7WUFDRixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztZQUMvQixJQUFJLElBQUksRUFBRTtnQkFDTixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7Z0JBQ3ZCLE1BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN6RDtRQUNMLENBQUM7UUFFRCxxQkFBTSxHQUFOLFVBQU8sUUFBUTtZQUNYLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1lBQzFCLElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLFdBQVcsRUFBRSxlQUFhLFFBQVEsQ0FBQyxDQUFDLFVBQUssUUFBUSxDQUFDLENBQUMsTUFBRyxDQUFDLENBQUM7UUFDdkYsQ0FBQztRQUVELHNCQUFJLHlCQUFPO2lCQUFYO2dCQUNJLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUN6QixDQUFDOzs7V0FBQTtRQUVELHNCQUFJLDBCQUFRO2lCQUFaO2dCQUNJLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUMxQixDQUFDOzs7V0FBQTtRQUNMLFdBQUM7SUFBRCxDQUFDLEFBeENELElBd0NDO0lBeENZLG9CQUFJIn0=