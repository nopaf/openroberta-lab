define(["require", "exports"], function (require, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEFAULT_COLORS = { '5V': '#f01414', GND: '#333333' };
    var DARK = 50;
    var Point = /** @class */ (function () {
        function Point(x, y) {
            this.x = x;
            this.y = y;
        }
        return Point;
    }());
    var WirePoint = /** @class */ (function () {
        function WirePoint(position) {
            this.pos = position;
            this.next = null;
        }
        Object.defineProperty(WirePoint.prototype, "position", {
            get: function () {
                return this.pos;
            },
            enumerable: false,
            configurable: true
        });
        return WirePoint;
    }());
    function distance(first, second) {
        return Math.abs(first - second);
    }
    function chooseByDistance(selectBetween, comparisonPoint, comparator) {
        if (comparator === void 0) { comparator = function (x1, x2) { return x1 > x2; }; }
        var comparison = comparator(distance(selectBetween[0], comparisonPoint), distance(selectBetween[1], comparisonPoint));
        if (comparison) {
            return selectBetween[0];
        }
        return selectBetween[1];
    }
    var WireDrawer = /** @class */ (function () {
        function WireDrawer(origin, destination, portIndex, blockCorners) {
            this.blockCorners = blockCorners;
            if (blockCorners)
                this.left = this.blockCorners.upperLeft.x === origin.x;
            this.portIndex = portIndex;
            this.head = new WirePoint(origin);
            this.head.next = new WirePoint(destination);
            this.toOrthoLines_();
        }
        WireDrawer.prototype.addPoint_ = function (prevPoint, position) {
            var newPoint = new WirePoint(position);
            newPoint.next = prevPoint.next;
            prevPoint.next = newPoint;
        };
        WireDrawer.prototype.toOrthoLines_ = function () {
            var _a = this.head.pos, originX = _a.x, originY = _a.y;
            var _b = this.head.next.pos, destinationX = _b.x, destinationY = _b.y;
            if (originX === destinationX || originY === destinationY)
                return;
            var x = originX < destinationX ? Math.max(originX, destinationX) : Math.min(originX, destinationX);
            var y = originY < destinationY ? Math.min(originY, destinationY) : Math.max(originY, destinationY);
            if (!this.blockCorners) {
                this.addPoint_(this.head, { x: x, y: y });
                return;
            }
            // Adjust path around block
            var _c = this.blockCorners, lowerRight = _c.lowerRight, upperLeft = _c.upperLeft;
            var separatorByPortIndex = (this.portIndex + 1) * WireDrawer.SEPARATOR;
            y = chooseByDistance([lowerRight.y + separatorByPortIndex, upperLeft.y - separatorByPortIndex], destinationY, function (x, y) { return x < y; });
            var xExtra = this.left ? originX - separatorByPortIndex : originX + separatorByPortIndex;
            this.addPoint_(this.head, { x: x, y: y });
            this.addPoint_(this.head, {
                x: xExtra,
                y: y,
            });
            this.addPoint_(this.head, {
                x: xExtra,
                y: originY,
            });
        };
        Object.defineProperty(WireDrawer.prototype, "path", {
            get: function () {
                var moveto = this.head.position;
                var path = "M " + moveto.x + " " + moveto.y;
                var current = this.head.next;
                while (current !== null) {
                    var lineto = current.position;
                    path = path + " L " + lineto.x + " " + lineto.y;
                    current = current.next;
                }
                return path;
            },
            enumerable: false,
            configurable: true
        });
        WireDrawer.darken = function (color) {
            var dark = -DARK;
            color = color.slice(1);
            var num = parseInt(color, 16);
            var r = (num >> 16) + dark;
            r = r < 0 ? 0 : r;
            var b = ((num >> 8) & 0x00ff) + dark;
            b = b < 0 ? 0 : b;
            var g = (num & 0x0000ff) + dark;
            g = g < 0 ? 0 : g;
            var darkColor = g | (b << 8) | (r << 16);
            return '#' + darkColor.toString(16);
        };
        WireDrawer.getColor = function (block, name) {
            return DEFAULT_COLORS[name] ? DEFAULT_COLORS[name] : WireDrawer.darken(block.colour_);
        };
        WireDrawer.SEPARATOR = 6;
        return WireDrawer;
    }());
    exports.default = WireDrawer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lyZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9PcGVuUm9iZXJ0YVdlYi9zcmMvYXBwL2NvbmZpZ1Zpc3VhbGl6YXRpb24vd2lyZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFBQSxJQUFNLGNBQWMsR0FBRyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxDQUFDO0lBQzNELElBQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUVoQjtRQUlJLGVBQVksQ0FBUyxFQUFFLENBQVM7WUFDNUIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDWCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNmLENBQUM7UUFDTCxZQUFDO0lBQUQsQ0FBQyxBQVJELElBUUM7SUFFRDtRQUlJLG1CQUFZLFFBQWU7WUFDdkIsSUFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUM7WUFDcEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDckIsQ0FBQztRQUVELHNCQUFJLCtCQUFRO2lCQUFaO2dCQUNJLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUNwQixDQUFDOzs7V0FBQTtRQUNMLGdCQUFDO0lBQUQsQ0FBQyxBQVpELElBWUM7SUFFRCxTQUFTLFFBQVEsQ0FBQyxLQUFhLEVBQUUsTUFBYztRQUMzQyxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDO0lBQ3BDLENBQUM7SUFFRCxTQUFTLGdCQUFnQixDQUNyQixhQUErQixFQUMvQixlQUF1QixFQUN2QixVQUFxRTtRQUFyRSwyQkFBQSxFQUFBLHVCQUFtRCxFQUFFLEVBQUUsRUFBRSxJQUFLLE9BQUEsRUFBRSxHQUFHLEVBQUUsRUFBUCxDQUFPO1FBRXJFLElBQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxFQUFFLGVB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