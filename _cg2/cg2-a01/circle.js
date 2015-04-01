define(["util", "vec2", "scene", "point_dragger"],
    (function (Util, vec2, Scene, PointDragger) {
        "use strict";

        var Circle = function (point, radius, circleStyle) {
            console.log("creating circle with: ");

            this.point = point || [50, 50];
            this.radius = radius || 25;
            this.circleStyle = circleStyle || {width: "2", color: "#0000AA"};
        };

        Circle.prototype.draw = function (context) {
            context.beginPath();
            context.arc(this.point[0], this.point[1], this.radius, 0, 360, false);

            context.lineWidth = this.circleStyle.width;
            context.strokeStyle = this.circleStyle.color;

            context.stroke();
        };

        Circle.prototype.isHit = function (context, pos) {
            // Kreisgleichung
            var term = (pos[0] - this.point[0]) * (pos[0] - this.point[0]) +
                    (pos[1] - this.point[1]) * (pos[1] - this.point[1]),
                minSquaredRadius = ((2 * this.radius - parseInt(this.circleStyle.width) - 4) / 2)
                    * ((2 * this.radius - parseInt(this.circleStyle.width) - 4) / 2),
                maxSquaredRadius = ((2 * this.radius + parseInt(this.circleStyle.width) + 4) / 2)
                    * ((2 * this.radius + parseInt(this.circleStyle.width) + 4) / 2);

            return minSquaredRadius <= term && term <= maxSquaredRadius;
        };

        Circle.prototype.createDraggers = function () {
            var draggers = [],
                draggerStyle = {radius: 4, color: this.circleStyle.color, width: 0, fill: true},
                _circle = this,

                getPointCallback1 = function () {
                    return _circle.point;
                },

                setPointCallback1 = function (dragEvent) {
                    _circle.point = dragEvent.position;
                },

                getPointCallback2 = function () {
                    return [_circle.point[0], _circle.point[1] + _circle.radius];
                },

                setPointCallback2 = function (dragEvent) {
                    var newRadius = dragEvent.position[1] - _circle.point[1],
                        minRadius = 2 * (draggerStyle.radius + draggerStyle.width);

                    if (newRadius > minRadius) {
                        _circle.radius = newRadius;
                    } else {
                        _circle.radius = minRadius;
                    }
                };

            draggers.push(new PointDragger(getPointCallback1, setPointCallback1, draggerStyle));
            draggers.push(new PointDragger(getPointCallback2, setPointCallback2, draggerStyle));

            return draggers;
        };

        return Circle;
    })
);