/* using require js to define a module with dependencies */ 
define([], 
       (function() {

    /** 
        @class Vec2
        represents a 2D point position or direction, 
        consists of two public attributes "x" and "y".
      */
    Vec2 = function(x,y) {
        this.x = x;
        this.y = y;
    }

    return Vec2;

})); // define
