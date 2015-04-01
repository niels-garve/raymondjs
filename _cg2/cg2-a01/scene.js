/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: scene
 *
 * A Scene is a depth-sorted collection of things to be drawn, 
 * plus a background fill style.
 *
 */



/* requireJS module definition */
define(["util"], 
       (function(Util) {

    "use strict";

    /* 
     * Scene constructor
     * A Scene is a depth-sorted collection of things to be drawn, 
     * plus a background fill style.
     */ 
    var Scene = function(bgFillStyle) {

        // remember background color
        this.bgFillStyle = bgFillStyle || "#DDDDDD";

        // list of objects that can be drawn 
        this.drawableObjects = [];
        
    };

    /*
     * add multiple drawable objects (provided in an array) to the scene.
     * objects are added in "drawing order", so objects added later are
     * considered "on top" of older objects.
     * 
     * Each object must at least define a method draw(context) for rendering
     * itself into a 2D rendering context.
     *
     */
    Scene.prototype.addObjects = function(objects) {

        for(var i=0; i<objects.length; i++) {
            this.drawableObjects.push(objects[i]);
        }
            
    };

    /*
     * remove drawable objects from the scene (provided in an array)
     */
    Scene.prototype.removeObjects = function(objects) {

        for(var i=0; i<objects.length; i++) {
            // find obj in array
            var idx = this.drawableObjects.indexOf(objects[i]); 
            if(idx === -1) {
                window.console.log("warning: Scene.remove(): object not found.");
            } else {
                // remove obj from array
                this.drawableObjects.splice(idx,1);
            };
        };
            
    };

    /*
     * return array of all objects in the scene,
     * sorted back-to-front or front-to-back
     * Parameters:
     * - sortOrder [optional]: string indicating the order of the objects
     *    - "back-to-front" [default]
     *    - "front-to-back"
     */
    Scene.prototype.getObjects = function(sortOrder) {
    
        var order = sortOrder || "back-to-front";
        var clone = this.drawableObjects.slice(0); 
        
        if(order == "back-to-front") {
            return clone;
        } else {
            return clone.reverse();
        };

    };

    /*
     * drawing the scene means first clearing the canvas 
     * and then drawing each object in back-to-front order
     */
    Scene.prototype.draw = function(context) {

        if(!context) {
            throw new Util.RuntimeError("Scene.draw(): no context",this);
        };
            
        // first we draw a rectangle in background color, same size as canvas
        var width  = context.canvas.width;
        var height = context.canvas.height; 
        
        if(this.bgFillStyle == "clear") {
            // clear canvas to the color of th underlying document
            context.clearRect(0,0,width,height);
        } else {
            // clear canvas with specified background color
            context.fillStyle=this.bgFillStyle;
            context.fillRect(0,0,width,height);
        }

        // loop over all drawable objects and call their draw() methods
        var objs = this.getObjects("back-to-front");
        for(var i=0; i<objs.length; i+=1) {
            objs[i].draw(context);
        }
            
    };
    
    // this module only exports the constructor for Scene objects
    return Scene;

})); // define

    
