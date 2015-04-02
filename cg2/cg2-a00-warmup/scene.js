/* using require js to define a module with dependencies */ 
define(["util"], 
       (function(Util) {

    /** 
     * @class Scene
     * a simple scene is a collection of things to be drawn, 
     * plus a background color
     */ 
    Scene = function(context, bgFillStyle) {

        // remember the drawing context
        this.context = context;
        if(!context) 
            throw new Util.RuntimeError("Scene: no context provided",this);
            
        // remember background color
        this.bgFillStyle = bgFillStyle || "#DDDDDD";

        // list of objects that can be drawn 
        this.drawableObjects = [];
        
    };

    // add a drawable object to the scene
    Scene.prototype.add = function(drawableObject) {

        this.drawableObjects.push(drawableObject);
            
    };

    // call the specfied function for each object in the scene
    Scene.prototype.foreach = function(func) {

        for(var i=0; i<this.drawableObjects.length; i++) {
            func(this.drawableObjects[i]);
        };

    };

    // drawing the scene means first clearing the canvas 
    //   and then drawing each object
    Scene.prototype.draw = function() {

        var width = this.context.canvas.width;
        var height = this.context.canvas.height; 
        
        if(this.bgFillStyle == "clear") {
            // clear canvas to the color of th underlying document
            this.context.clearRect(0,0,width,height);
        } else {
            // clear canvas with specified background color
            this.context.fillStyle=this.bgFillStyle;
            this.context.fillRect(0,0,width,height);
        }

        // loop over all drawable objects and call their draw() methods
        for(var i=0; i<this.drawableObjects.length; i++) {
            var obj = this.drawableObjects[i]; 
            obj.draw();
        }
            
    };
    
    // this module only exports the constructor for Scene objects
    return Scene;

})); // define

    
