
/* using RequireJS to define a module with dependencies */ 
define(["util", "scene", "dragger"], 
       (function(Util,Scene,Dragger) {

    /**
     *  A simple straight line that can be dragged 
     *  around by its endpoints.
     *  Parameters:
     *  - context: result of Canvas.getContext("2d")
     *  - scene:   Scene object for redrawing the canvas
     *  - point0 and point: Vec2 objects representing the start and end point
     *  - lineStyle: object defining width and color attributes for line drawing
     */ 

    StraightLine = function(context, scene, point0, point1, lineStyle) {

        console.log("creating straight line...");
        this.context = context || fatalError("StraightLine2D: no context.");
        
        // draw style for drawing the line
        this.lineStyle = lineStyle || { width: "2", color: "green" };

        // convert to Vec2 just in case the points were given as arrays
        var p0 = new Vec2(point0[0],point0[1]);
        var p1 = new Vec2(point1[0],point1[1]);
        
        // store control points as an array of type Vec2
        this.cp = [p0,p1];
            
        // create draggers
        var draggerStyle = { radius:4, color: "green", width:0, fill:true }
        this.draggers = [];
        this.showDraggers = true;
        this.draggers.push( new Dragger(context, scene, this.cp[0], draggerStyle) );
        this.draggers.push( new Dragger(context, scene, this.cp[1], draggerStyle) );
        
    };

    StraightLine.prototype.draw = function() {

        // draw actual line
        this.context.beginPath();
        
        // set points to be drawn
        this.context.moveTo(this.cp[0].x,this.cp[0].y);
        this.context.lineTo(this.cp[1].x,this.cp[1].y);
        
        // set drawing style
        this.context.lineWidth = this.lineStyle.width;
        this.context.strokeStyle = this.lineStyle.color;
        
        // actually start drawing
        this.context.stroke(); 
        
        // draw draggers (on top)
        if(this.showDraggers) {
            for(var i=0; i<this.draggers.length; i++) {
                this.draggers[i].draw();
            }
        }

    };
    
    // this module only exports the constructor for StraightLine objects
    return StraightLine;

})); // define

    
