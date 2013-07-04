/* using require js to define a module with dependencies */ 
define(["util", "vec2", "scene"], 
       (function(Util,Vec2,Scene) {

    /**
     * @class Dragger
     * A dragger is a visible handle to move a 2D point around
     * using the 2D rendering features of the HTML5 canvas element. 
     * @param {vanvas 2D context object} context 
     *        the canvas' 2D rendering context
     * @param {Object} scene
     *        an object with a draw() method used to trigger a redraw
     * @param {Vec2} pointPosition 
     *        an object of type Vec2 that stores the coordinates
     *        of the point to be controlled by the dragger. This 
     *        object will be modified directly by the dragger.
     * @param {Object} drawStyle       
     *        drawing style object with attributes 
     *        - radius [int, in pixels], 
     *        - color [String, e.g. "#00FF00"]
     *        - fill [Boolean]
     * 
     */

    Dragger = function(context, scene, pointPosition, drawStyle) {

        this.pos         = pointPosition;
        this.context     = context || fatalError("Dragger: no context");
        this.canvas      = context.canvas  || fatalError("Dragger: no canvas");
        this.scene       = scene || fatalError("Dragger: no scene");
        this.isDragging  = false;
        
        this.drawStyle   = drawStyle || { radius:5, width:2, color: "#ff0000", fill: false };
        
        // create event handlers with a closure containing 
        // "tool" as a reference to this dragger
        var tool = this;
        this.canvas.addEventListener('mousedown', (function(ev) { tool.mousedown(ev); }), false);
        this.canvas.addEventListener('mousemove', (function(ev) { tool.mousemove(ev); }), false);
        this.canvas.addEventListener('mouseup',   (function(ev) { tool.mouseup(ev);   }), false);
                                
    };

    Dragger.prototype.draw = function () {
        
        this.context.beginPath();
        this.context.arc(this.pos.x, this.pos.y, this.drawStyle.radius, 0.0, Math.PI*2, true);
        this.context.closePath();
        this.context.lineWidth   = this.drawStyle.width;
        this.context.strokeStyle = this.drawStyle.color;
        this.context.fillStyle   = this.drawStyle.color;
        this.context.stroke();
        if(this.drawStyle.fill) {
            this.context.fill();
        };
    };

    // Event handler: called when any mouse button is pressed down
    Dragger.prototype.mousedown = function (event) {

        // get relative mouse position within canvas
        var pos=Util.canvasPosition(event);

        // is the mouse close to a dragger?
        if(Math.abs(pos[0] - this.pos.x) < 5 && 
            Math.abs(pos[1] - this.pos.y) < 5   ) {
            // remember we are in dragging mode now
            this.isDragging = true; 
            event.stopPropagation();
        }                
    };
        
    // Event handler: called whenever mouse is moving 
    //                (with buttons up or down, regardless)
    Dragger.prototype.mousemove = function (event) {
      
        // get relative mouse position within canvas
        var pos=Util.canvasPosition(event);

        if(this.isDragging) {

            event.stopPropagation();

            // change position of the original object
            this.pos.x = pos[0]; 
            this.pos.y = pos[1]; 
            
            // redraw scene
            this.scene.draw();
        }

    };

    // Event handler: called when mouse button is released
    Dragger.prototype.mouseup = function (event) {
        this.isDragging = false;
        event.stopPropagation();
    };


    // this module exposes only the constructor for Dragger objects
    return Dragger;

})); // define
