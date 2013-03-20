/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: straight_line
 *
 * A StraighLine knows how to draw itself into a specified 2D context,
 * can tell whether a certain mouse position "hits" the object,
 * and implements the function createDraggers() to create a set of
 * draggers to manipulate itself.
 *
 */


/* requireJS module definition */
define(["util", "vec2", "scene", "point_dragger"], 
       (function(Util,vec2,Scene,PointDragger) {
       
    "use strict";

    /**
     *  A simple straight line that can be dragged 
     *  around by its endpoints.
     *  Parameters:
     *  - point0 and point1: array objects representing [x,y] coordinates of start and end point
     *  - lineStyle: object defining width and color attributes for line drawing, 
     *       begin of the form { width: 2, color: "#00FF00" }
     */ 

    var StraightLine = function(point0, point1, lineStyle) {

        console.log("creating straight line from [" + 
                    point0[0] + "," + point0[1] + "] to [" +
                    point1[0] + "," + point1[1] + "].");
        
        // draw style for drawing the line
        this.lineStyle = lineStyle || { width: "2", color: "#0000AA" };

        // convert to Vec2 just in case the points were given as arrays
        this.p0 = point0 || [0,0];
        this.p1 = point1 || [0,0];
        
    };

    // draw this line into the provided 2D rendering context
    StraightLine.prototype.draw = function(context) {

        // draw actual line
        context.beginPath();
        
        // set points to be drawn
        context.moveTo(this.p0[0],this.p0[1]);
        context.lineTo(this.p1[0],this.p1[1]);
        
        // set drawing style
        context.lineWidth = this.lineStyle.width;
        context.strokeStyle = this.lineStyle.color;
        
        // actually start drawing
        context.stroke(); 
        
    };

    // test whether the mouse position is on this line segment
    StraightLine.prototype.isHit = function(context,pos) {
    
        // project point on line, get parameter of that projection point
        var t = vec2.projectPointOnLine(pos, this.p0, this.p1);
                
        // outside the line segment?
        if(t<0.0 || t>vec2.length(vec2.sub(this.p0,this.p1))) {
            return false; 
        }
        
        // coordinates of the projected point 
        var p = vec2.add(this.p0, vec2.mult( vec2.sub(this.p1,this.p0), t ));

        // distance of the point from the line
        var d = vec2.length(vec2.sub(p,pos));
        
        // allow 2 pixels extra "sensitivity"
        return d<=(this.lineStyle.width/2)+2;
        
    };
    
    // return list of draggers to manipulate this line
    StraightLine.prototype.createDraggers = function() {
    
        var draggerStyle = { radius:4, color: this.lineStyle.color, width:0, fill:true }
        var draggers = [];
        
        // create closure and callbacks for dragger
        var _line = this;
        var getP0 = function() { return _line.p0; };
        var getP1 = function() { return _line.p1; };
        var setP0 = function(dragEvent) { _line.p0 = dragEvent.position; };
        var setP1 = function(dragEvent) { _line.p1 = dragEvent.position; };
        draggers.push( new PointDragger(getP0, setP0, draggerStyle) );
        draggers.push( new PointDragger(getP1, setP1, draggerStyle) );
        
        return draggers;
        
    };
    
    // this module only exports the constructor for StraightLine objects
    return StraightLine;

})); // define

    
