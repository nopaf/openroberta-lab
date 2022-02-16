/**
 * @fileOverview Math for a simple robot simulation
 * @author Beate Jost <beate.jost@smail.inf.h-brs.de>
 * @version 0.1
 */
define(["require", "exports", "simulation.constants"], function (require, exports, simulation_constants_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getColor = exports.rgbToHsv = exports.checkObstacle = exports.isPointInsideRectangle = exports.getDistanceToLine = exports.getDistance = exports.sqr = exports.getDistanceToCircle = exports.getLinesFromObj = exports.isLineAlignedToPoint = exports.getIntersectionPointsCircle = exports.getClosestIntersectionPointCircle = exports.getIntersectionPoint = exports.toDegree = exports.toRadians = void 0;
    /**
     * exports helper for calculations in ORsimulation
     *
     * @namespace
     */
    /**
     * Convert from degree to radians.
     *
     * @memberOf exports
     * @param {Number}
     *            degree to convert
     * @returns {Number} radians
     */
    exports.toRadians = function (degree) {
        return degree * (Math.PI / 180);
    };
    /**
     * Convert from radians to degree.
     *
     * @memberOf exports
     * @param {Number}
     *            radians to convert
     * @returns {Number} degree
     */
    exports.toDegree = function (radians) {
        return radians * (180 / Math.PI);
    };
    /**
     * Get intersection point from two lines.
     *
     * @memberOf exports
     * @param {line1}
     *            one line
     * @param {line2}
     *            another line
     * @returns {point} or null, if no intersection found
     */
    exports.getIntersectionPoint = function (line1, line2) {
        var d = (line1.x1 - line1.x2) * (line2.y1 - line2.y2) - (line1.y1 - line1.y2) * (line2.x1 - line2.x2);
        if (d === 0) {
            return null;
        }
        var xi = ((line2.x1 - line2.x2) * (line1.x1 * line1.y2 - line1.y1 * line1.x2) - (line1.x1 - line1.x2) * (line2.x1 * line2.y2 - line2.y1 * line2.x2)) / d;
        var yi = ((line2.y1 - line2.y2) * (line1.x1 * line1.y2 - line1.y1 * line1.x2) - (line1.y1 - line1.y2) * (line2.x1 * line2.y2 - line2.y1 * line2.x2)) / d;
        if (!this.isLineAlignedToPoint(xi, yi, line1)) {
            return null;
        }
        if (!this.isLineAlignedToPoint(xi, yi, line2)) {
            return null;
        }
        return {
            x: xi,
            y: yi,
        };
    };
    /**
     * Finds the closest intersection from the intersections of a line
     * @memberOf exports
     * @param  {line}
     *              a line
     * @return {x, y}
     *              closest intersection point (coordinate)
     */
    exports.getClosestIntersectionPointCircle = function (line, circle) {
        var intersections = this.getIntersectionPointsCircle(line, circle);
        if (intersections.length == 1) {
            return intersections[0]; // one intersection
        }
        if (intersections.length == 2) {
            var dist1 = getDistance({ x: line.x1, y: line.y1 }, intersections[0]);
            var dist2 = getDistance({ x: line.x1, y: line.y1 }, intersections[1]);
            if (dist1 < dist2) {
                return intersections[0];
            }
            else {
                return intersections[1];
            }
        }
        return null; // no intersections at all
    };
    /**
     * Finds the intersection between a circles border
     * and a line from the origin to the otherLineEndPoint.
     * @memberOf exports
     * @param  {line}
     *              a line
     * @return {{x, y}[]}
     *              array with point(s) of the intersection
     */
    exports.getIntersectionPointsCircle = function (line, circle) {
        var dx, dy, A, B, C, det, t;
        dx = line.x2 - line.x1;
        dy = line.y2 - line.y1;
        A = dx * dx + dy * dy;
        B = 2 * (dx * (line.x1 - circle.x) + dy * (line.y1 - circle.y));
        C = (line.x1 - circle.x) * (line.x1 - circle.x) + (line.y1 - circle.y) * (line.y1 - circle.y) - circle.r * circle.r;
        det = B * B - 4 * A * C;
        if (A <= 0.0000001 || det < 0) {
            return [];
        }
        else if (det == 0) {
            // One solution.
            t = -B / (2 * A);
            var intersection1 = { x: line.x1 + t * dx, y: line.y1 + t * dy };
            if (this.isLineAlignedToPoint(intersection1.x, intersection1.y, line))
                return [intersection1];
            return [];
        }
        else {
            // Two solutions.
            t = (-B + Math.sqrt(det)) / (2 * A);
            var intersection1 = { x: line.x1 + t * dx, y: line.y1 + t * dy };
            t = (-B - Math.sqrt(det)) / (2 * A);
            var intersection2 = { x: line.x1 + t * dx, y: line.y1 + t * dy };
            if (this.isLineAlignedToPoint(intersection1.x, intersection1.y, line) && this.isLineAlignedToPoint(intersection2.x, intersection2.y, line))
                return [intersection1, intersection2];
            return [];
        }
    };
    /**
     * Checks if Alignment of lines is correct to sensor
     *
     * @memberOf exports
     * @param {xi}
     *            x coordinate of point
     * @param {yi}
     *            y coordinate of point
     * @param {line}
     *            a line
     * @returns {boolean}
     */
    exports.isLineAlignedToPoint = function (xi, yi, line) {
        if (xi < Math.min(line.x1, line.x2) - 0.01 || xi > Math.max(line.x1, line.x2) + 0.01) {
            return false;
        }
        if (yi < Math.min(line.y1, line.y2) - 0.01 || yi > Math.max(line.y1, line.y2) + 0.01) {
            return false;
        }
        return true;
    };
    /**
     * Get four lines from a rectangle.
     *
     * @memberOf exports
     * @param {rect}
     *            a rectangle
     * @returns {Array} four lines
     */
    exports.getLinesFromObj = function (obj) {
        switch (obj.form) {
            case 'rectangle':
                return [
                    {
                        x1: obj.x,
                        x2: obj.x,
                        y1: obj.y,
                        y2: obj.y + obj.h,
                    },
                    {
                        x1: obj.x,
                        x2: obj.x + obj.w,
                        y1: obj.y,
                        y2: obj.y,
                    },
                    {
                        x1: obj.x + obj.w,
                        x2: obj.x,
                        y1: obj.y + obj.h,
                        y2: obj.y + obj.h,
                    },
                    {
                        x1: obj.x + obj.w,
                        x2: obj.x + obj.w,
                        y1: obj.y + obj.h,
                        y2: obj.y,
                    },
                ];
            case 'robot':
                return [
                    {
                        x1: obj.backLeft.rx,
                        x2: obj.frontLeft.rx,
                        y1: obj.backLeft.ry,
                        y2: obj.frontLeft.ry,
                    },
                    {
                        x1: obj.frontLeft.rx,
                        x2: obj.frontRight.rx,
                        y1: obj.frontLeft.ry,
                        y2: obj.frontRight.ry,
                    },
                    {
                        x1: obj.frontRight.rx,
                        x2: obj.backRight.rx,
                        y1: obj.frontRight.ry,
                        y2: obj.backRight.ry,
                    },
                    {
                        x1: obj.backRight.rx,
                        x2: obj.backLeft.rx,
                        y1: obj.backRight.ry,
                        y2: obj.backLeft.ry,
                    },
                ];
            case 'triangle':
                return [
                    {
                        x1: obj.ax,
                        x2: obj.bx,
                        y1: obj.ay,
                        y2: obj.by,
                    },
                    {
                        x1: obj.bx,
                        x2: obj.cx,
                        y1: obj.by,
                        y2: obj.cy,
                    },
                    {
                        x1: obj.ax,
                        x2: obj.cx,
                        y1: obj.ay,
                        y2: obj.cy,
                    },
                ];
            default:
                return false;
        }
    };
    /**
     * Get distance from a point to a circle's border.
     *
     * @memberOf exports
     * @param {point}
     *            a point
     * @param {circle}
     *            a circle object
     * @returns {distance}
     *           distance
     */
    exports.getDistanceToCircle = function (point, circle) {
        var vX = point.x - circle.x;
        var vY = point.y - circle.y;
        var magV = Math.sqrt(vX * vX + vY * vY);
        var aX = circle.x + (vX / magV) * circle.r;
        var aY = circle.y + (vY / magV) * circle.r;
        return {
            x: aX,
            y: aY,
        };
    };
    /**
     * Calculate the square of a number.
     *
     * @memberOf exports
     * @param { Number }
     * x value to square
     * @returns { Number } square of x
     */
    exports.sqr = function (x) {
        return x * x;
    };
    /**
     * Get the distance of two points.
     *
     * @memberOf exports
     * @param {p1}
     *            one point
     * @param {p1}
     *            x another point
     * @returns {distance}
     */
    function getDistance(p1, p2) {
        return exports.sqr(p1.x - p2.x) + exports.sqr(p1.y - p2.y);
    }
    exports.getDistance = getDistance;
    /**
     * Get the shortest distance from a point to a line as a vector.
     *
     * @memberOf exports
     * @param {p}
     *            one point
     * @param {p1}
     *            start point of line
     * @param {p2}
     *            p2 end point of line
     * @returns {distance}
     */
    function getDistanceToLine(p, p1, p2) {
        var d = getDistance(p1, p2);
        if (d == 0) {
            return p1;
        }
        var t = ((p.x - p1.x) * (p2.x - p1.x) + (p.y - p1.y) * (p2.y - p1.y)) / d;
        if (t < 0) {
            return p1;
        }
        if (t > 1) {
            return p2;
        }
        return {
            x: p1.x + t * (p2.x - p1.x),
            y: p1.y + t * (p2.y - p1.y),
        };
    }
    exports.getDistanceToLine = getDistanceToLine;
    exports.isPointInsideRectangle = function (p, rect) {
        var p1 = rect.p1;
        var p2 = rect.p2;
        var p3 = rect.p3;
        var p4 = rect.p4;
        var t1 = getDistance(p, getDistanceToLine(p, p1, p2));
        var t2 = getDistance(p, getDistanceToLine(p, p2, p3));
        var t3 = getDistance(p, getDistanceToLine(p, p3, p4));
        var t4 = getDistance(p, getDistanceToLine(p, p4, p1));
        var s1 = getDistance(p1, p2);
        var s2 = getDistance(p2, p3);
        if (t1 <= s2 && t3 <= s2 && t2 <= s1 && t4 <= s1) {
            return true;
        }
        else {
            return false;
        }
    };
    exports.checkObstacle = function (robot, p) {
        var x = robot.frontLeft.rx;
        var y = robot.frontLeft.ry;
        robot.frontLeft.bumped = robot.frontLeft.bumped || check(p, x, y);
        x = robot.frontRight.rx;
        y = robot.frontRight.ry;
        robot.frontRight.bumped = robot.frontRight.bumped || check(p, x, y);
        x = robot.backLeft.rx;
        y = robot.backLeft.ry;
        robot.backLeft.bumped = robot.backLeft.bumped || check(p, x, y);
        x = robot.backRight.rx;
        y = robot.backRight.ry;
        robot.backRight.bumped = robot.backRight.bumped || check(p, x, y);
        return robot.frontLeft.bumped || robot.frontRight.bumped ? 1 : 0;
    };
    check = function (p, x, y) {
        switch (p.form) {
            case 'rectangle':
                return x > p.x && x < p.x + p.w && y > p.y && y < p.y + p.h;
            case 'triangle':
                var areaOrig = Math.floor(Math.abs((p.bx - p.ax) * (p.cy - p.ay) - (p.cx - p.ax) * (p.by - p.ay)));
                var area1 = Math.floor(Math.abs((p.ax - x) * (p.by - y) - (p.bx - x) * (p.ay - y)));
                var area2 = Math.floor(Math.abs((p.bx - x) * (p.cy - y) - (p.cx - x) * (p.by - y)));
                var area3 = Math.floor(Math.abs((p.cx - x) * (p.ay - y) - (p.ax - x) * (p.cy - y)));
                if (area1 + area2 + area3 <= areaOrig) {
                    return true;
                }
                return false;
            case 'circle':
                return (x - p.x) * (x - p.x) + (y - p.y) * (y - p.y) <= p.r * p.r;
            case 'robot':
                return exports.isPointInsideRectangle({
                    x: x,
                    y: y,
                }, {
                    p1: {
                        x: p.backLeft.rx,
                        y: p.backLeft.ry,
                    },
                    p2: {
                        x: p.frontLeft.rx,
                        y: p.frontLeft.ry,
                    },
                    p3: {
                        x: p.frontRight.rx,
                        y: p.frontRight.ry,
                    },
                    p4: {
                        x: p.backRight.rx,
                        y: p.backRight.ry,
                    },
                });
            default:
                return false;
        }
    };
    /**
     * Convert a rgb value to hsv value.
     *
     * @memberOf exports
     * @param {Number}
     *            r red value
     * @param {Number}
     *            g green value
     * @param {Number}
     *            b blue value
     * @returns {Array} hsv value
     */
    //copy from http://stackoverflow.com/questions/2348597/why-doesnt-this-javascript-rgb-to-hsl-code-work
    exports.rgbToHsv = function (r, g, b) {
        var min = Math.min(r, g, b), max = Math.max(r, g, b), delta = max - min, h, s, v = max;
        v = Math.floor((max / 255) * 100);
        if (max !== 0) {
            s = Math.floor((delta / max) * 100);
        }
        else {
            // black
            return [0, 0, 0];
        }
        if (r === max) {
            h = (g - b) / delta; // between yellow & magenta
        }
        else if (g === max) {
            h = 2 + (b - r) / delta; // between cyan & yellow
        }
        else {
            h = 4 + (r - g) / delta; // between magenta & cyan
        }
        h = Math.floor(h * 60); // degrees
        if (h < 0) {
            h += 360;
        }
        return [h, s, v];
    };
    /**
     * Map a hsv value to a color name.
     *
     * @memberOf exports
     * @param {Array}
     *            hsv value
     * @returns {Enum} color
     */
    exports.getColor = function (hsv) {
        if (hsv[2] <= 10) {
            return simulation_constants_1.default.COLOR_ENUM.BLACK;
        }
        if ((hsv[0] < 10 || hsv[0] > 350) && hsv[1] > 90 && hsv[2] > 50) {
            return simulation_constants_1.default.COLOR_ENUM.RED;
        }
        if (hsv[0] > 40 && hsv[0] < 70 && hsv[1] > 90 && hsv[2] > 50) {
            return simulation_constants_1.default.COLOR_ENUM.YELLOW;
        }
        if (hsv[0] < 50 && hsv[1] > 50 && hsv[1] < 100 && hsv[2] < 50) {
            return simulation_constants_1.default.COLOR_ENUM.BROWN;
        }
        if (hsv[1] < 10 && hsv[2] > 90) {
            return simulation_constants_1.default.COLOR_ENUM.WHITE;
        }
        if (hsv[0] > 70 && hsv[0] < 160 && hsv[1] > 80) {
            return simulation_constants_1.default.COLOR_ENUM.GREEN;
        }
        if (hsv[0] > 200 && hsv[0] < 250 && hsv[1] > 90 && hsv[2] > 50) {
            return simulation_constants_1.default.COLOR_ENUM.BLUE;
        }
        return simulation_constants_1.default.COLOR_ENUM.NONE;
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL09wZW5Sb2JlcnRhV2ViL3NyYy9hcHAvc2ltdWxhdGlvbi9zaW11bGF0aW9uTG9naWMvbWF0aC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7OztHQUlHOzs7O0lBSUg7Ozs7T0FJRztJQUVIOzs7Ozs7O09BT0c7SUFDVSxRQUFBLFNBQVMsR0FBRyxVQUFVLE1BQU07UUFDckMsT0FBTyxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ3BDLENBQUMsQ0FBQztJQUVGOzs7Ozs7O09BT0c7SUFDVSxRQUFBLFFBQVEsR0FBRyxVQUFVLE9BQU87UUFDckMsT0FBTyxPQUFPLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3JDLENBQUMsQ0FBQztJQUVGOzs7Ozs7Ozs7T0FTRztJQUNVLFFBQUEsb0JBQW9CLEdBQUcsVUFBVSxLQUFLLEVBQUUsS0FBSztRQUN0RCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUNULE9BQU8sSUFBSSxDQUFDO1NBQ2Y7UUFDRCxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFLEdBQUcsS0FBSyxDQUFD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LEVBQUUsRUFBRTtZQUM1QixPQUFPLDhCQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQztTQUNyQztRQUNELElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDNUMsT0FBTyw4QkFBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUM7U0FDckM7UUFDRCxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDNUQsT0FBTyw4QkFBUyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7U0FDcEM7UUFDRCxPQUFPLDhCQUFTLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztJQUNyQyxDQUFDLENBQUMifQ==