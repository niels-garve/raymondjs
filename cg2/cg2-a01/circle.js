define(["util", "vec2", "scene", "point_dragger"],
    (function () {
        "use strict";

        var Circle = function (point, radius) {
            console.log("creating circle with: ");

            var _circle = this;
            this.point = point || [10, 10];
            this.radius = radius || 5;
        };

        Circle.prototype.draw = function (context) {
            context.beginPath();
            context.arc(this.point[0], this.point[1], this.radius, 0, 360, false);
            context.stroke();
        };

        Circle.prototype.isHit = function (pos) {

        };

        Circle.prototype.createDraggers = function () {

        };

        return Circle;
    })
);