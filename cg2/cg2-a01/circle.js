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

        Circle.prototype.isHit = function (pos) {

        };

        Circle.prototype.createDraggers = function () {
            var draggers = [],
                draggerStyle = {radius: 4, color: this.circleStyle.color, width: 0, fill: true},
                _circle = this,

                getPoint = function () {
                    return _circle.point;
                },

                setPoint = function (dragEvent) {
                    _circle.point = dragEvent.position;
                };

            draggers.push(new PointDragger(getPoint, setPoint, draggerStyle));

            return draggers;
        };

        return Circle;
    })
);