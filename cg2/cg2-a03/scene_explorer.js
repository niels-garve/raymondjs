/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Scene Explorer
 * 
 * The scene explorer handles key and mouse events in the canvas 
 * in order to allow interactive exploration of the scene.
 *
 * It can also manipulate a second scene (in a second canvas) in sync.
 *
 */


/* requireJS module definition */
define(["gl-matrix" ], 
       (function(dummy) {

    "use strict";

    /* 

        Object that handles mouse / keyboard interactions and 
        uses them to manipulate the scene's world transformation
        to allow interactive exploration.
        
        Parameters to the constructor:
        - canvas triggering the keyboard/mouse events 
        - flag indicating whether or not the explorer should
          trigger redrawing of the scene (switch off if you are
          using an animation / simulation loop)
        - scene drawn in that canvas, must have a draw() method
        - optional second scene to be manipulated in sync
        
    */

    var SceneExplorer = function(canvas, triggerRedraw, scene, scene2) {

        // the canvas to which this object is attached
        this.canvas = canvas;
        
        // should the explorer trigger redrawing of the scene?
        this.triggerRedraw = triggerRedraw;
        
        // the scene to be manipulated
        this.scene = scene;
        this.scene2 = scene2;
        
        // the scene's camera
        this.camera = scene.camera;
        
        // the current mouse dragging mode
        this.dragMode = "rotation";
        // has the dragging operation started yet?
        this.draggingStarted = false;
        // the last known positions of the mouse
        this.startX = 0;
        this.startY = 0;

        // the currently active modifier keys (Shift, Ctrl, Alt)
        this.KEY_NONE  = 0;
        this.KEY_SHIFT = 1;
        this.KEY_ALT   = 2;
        this.KEY_CTRL  = 4;
        this.KEY_META  = 8;
        this.KEY_ALL   = 1+2+4+8;
        this.activeModifierKeys = this.KEY_NONE;
        
        // mouse sensitivities for rotation and zoom operations
        this.rotSensitivity = 0.01;
        this.zoomSensitivity = 0.01;
        this.transSensitivity = 0.01;
        
        // constructor attaches explorer to the specified canvas
        this.attachToCanvas(this.canvas);
    
    }; // SceneExplorer 
     
    // function to start a mouse drag operation
    // dragType: "rotate", "translate", "zoom"
    SceneExplorer.prototype.startDragging = function(x, y, dragType) {
    
        //window.console.log("start dragging at " + x + "," + y);
        
        this.startX = x;
        this.startY = y;
        if(dragType) {
            this.dragMode = dragType;
        };
        this.draggingStarted = true;
            
    };
   
    // stop the dragging operation after it was started with startDragging()
    // return values:
    // - true: a redraw is recommended
    // - false: no redraw necessary
    SceneExplorer.prototype.stopDragging = function(x,y) {
        
        // first make sure that all events have been processed
        var result = this.continueDragging(x,y);
    
        // end of dragging operation
        this.draggingStarted = false;
        
        return result;
    
    };
        
  
    // function to update a drag operation, i.e. while the mouse is moved 
    //   and a mouse button is pressed down
    // return values:
    // - true: a redraw is recommended
    // - false: no redraw necessary
    SceneExplorer.prototype.continueDragging = function(x, y) {
    
        if(x==undefined || y==undefined) {
            return false;
        };

        // if we haven't started any operation, ignore mouse move
        if(!this.draggingStarted) 
            return false;
    
        // calculate the mouse distance 
        var deltaX = x - this.startX;
        var deltaY = y - this.startY;
        
        // remember the new mouse position
        this.startX = x;
        this.startY = y;
        
        // if virtually no mouse movement, skip the calculations
        if(Math.abs(deltaX) < 2 && Math.abs(deltaY) < 2) 
            return false;
        
        if(this.dragMode == "rotate") {
        
            // rotate the scene's world node, not the camera
            
            // scale values according to mouse sensitivity
            var degreesY = deltaX * this.rotSensitivity;
            var degreesX = deltaY * this.rotSensitivity;
            
            // camera system x and y axes 
            var xAxis = vec3.create([1,0,0]);
            var yAxis = vec3.create([0,1,0]);
            
            // transformation from camera coords to model coords
            var modelToEye = mat4.create(this.camera.viewMatrix);
            var eyeToModel = mat4.inverse(modelToEye, eyeToModel);
            
            // eliminate translation component of matrix
            eyeToModel[12] = 0; eyeToModel[13] = 0; eyeToModel[14] = 0;
            
            // transform axes into model space
            var rotX = mat4.identity();
            var rotY = mat4.identity(); 
            mat4.multiplyVec3(eyeToModel,xAxis,xAxis);
            mat4.multiplyVec3(eyeToModel,yAxis,yAxis);
            mat4.rotate(rotX,degreesX,xAxis,rotX);
            mat4.rotate(rotY,degreesY,yAxis,rotY);
            
            // window.console.log("rotate "+degreesX+" degrees around " + xAxis);
            
            // add to model-view transformation chain from the right
            mat4.multiply(rotX, this.scene.world.transformation, 
                                this.scene.world.transformation);
            mat4.multiply(rotY, this.scene.world.transformation, 
                                this.scene.world.transformation);
            
        } else if(this.dragMode == "translateXY") {

            // translation vector in eye coords
            var trans = vec3.create([deltaX*this.transSensitivity, -deltaY*this.transSensitivity, 0]);
            mat4.translate(this.scene.camera.viewMatrix, trans);
            
        } else if(this.dragMode == "translateZ") {

            // translation vector in eye coords
            var trans = vec3.create([0, 0, -deltaY*this.zoomSensitivity]);
            mat4.translate(this.scene.camera.viewMatrix, trans);
            
        };
        
        // we we have a second scene attached, copy the matrices over
        if(this.scene2 != undefined) {
            this.scene2.world.transformation = mat4.create(this.scene.world.transformation);
            this.scene2.camera.viewMatrix = mat4.create(this.scene.camera.viewMatrix);
        };

        // the scene should be redrawn eventually
        return true;
        
    };
    
    // method to redraw all affected scenes
    SceneExplorer.prototype.redraw = function() {
    
        // only redraw if this is desired at all
        if(!this.triggerRedraw)
            return;
            
        // redraw main scene
        this.scene.draw();
        
        // redraw optional second scene in sync
        if(this.scene2 != undefined) 
            this.scene2.draw();
    };
    
    // attach a scene explorer to the mouse events of a specific canvas
    // this means that the canvas's event handlers will be set to 
    // call the respective functions of the SceneExplorer
    SceneExplorer.prototype.attachToCanvas = function(canvas) {

        // install hook into this object within the canvas (for mouse events)
        var _explorer = this;
        
        // event handler for "mouse down": this is where the mouse 
        // button bindings are defined
        canvas.mouseDown = function(event) {
        
            // shortcut to the explorer object stored in the closure
            var exp = _explorer;
        
            // window.console.log("mouse down!");
            var button = "unknown";
            
            // translate mouse button events depending on browser
            // see "Javascrip Madness: Key Events", 
            // http://unixpapa.com/js/key.html
            if(!event.which) {
                // Micrsosoft/IE buttons 
                if(event.button & 4) button = "middle";
                if(event.button & 2) button = "right";
                if(event.button & 1) button = "left";
            } else {
                // rest of the world
                if(event.which == 3) button = "right";
                if(event.which == 2) button = "middle";
                if(event.which == 1) button = "left";
            };
            
            if(button == "left") {
            
                if(exp.activeModifierKeys == exp.KEY_NONE)
                    exp.startDragging(event.clientX, event.clientY, "rotate");
                else if(exp.activeModifierKeys == exp.KEY_SHIFT)
                    exp.startDragging(event.clientX, event.clientY, "translateXY");
                else if(exp.activeModifierKeys == exp.KEY_ALT)
                    exp.startDragging(event.clientX, event.clientY, "translateZ");
                    
            } else if(button == "right") {
                exp.startDragging(event.clientX, event.clientY, "translateXY");
            } else if(button == "middle") {
                exp.startDragging(event.clientX, event.clientY, "translateZ");
            } else {
                window.console.log("could not recognize mouse button!");
            };
        };
    
        // event handler for "mouse up"
        canvas.mouseUp = function(event) {
        
            // shortcut to the explorer object stored in the closure
            var exp = _explorer;
            
            if(exp.stopDragging(event.clientX, event.clientY))
                exp.redraw();
        };
    
        // event handler for "mouse move"
        canvas.mouseMove = function(event) {

            // shortcut to the explorer object stored in the closure
            var exp = _explorer;
            
            if(exp.continueDragging(event.clientX, event.clientY))
                exp.redraw();
        };
        
        // event handler for "key pressed down"
        canvas.keyDown = function(event) {

            // shortcut to the explorer object stored in the closure
            var exp = _explorer;
            
            // first process any pending events with the previously
            // pressed modifier keys still active
            if(exp.draggingStarted) 
                if(exp.stopDragging(event.clientX, event.clientY))
                    exp.redraw();
            
            // see "Javascrip Madness: Key Events", 
            // http://unixpapa.com/js/key.html

            // now change the currently active modifier keys
            exp.activeModifierKeys = exp.KEY_NONE;
            if(event.shiftKey) exp.activeModifierKeys += exp.KEY_SHIFT;
            if(event.ctrlKey)  exp.activeModifierKeys += exp.KEY_CTRL;
            if(event.altKey)   exp.activeModifierKeys += exp.KEY_ALT;
            if(event.metaKey)  exp.activeModifierKeys += exp.KEY_META;
            //window.console.log("key down, mods="+exp.activeModifierKeys);
        };
        
        
        // event handler for "key is being released"
        canvas.keyUp = function(event) {

            // shortcut to the explorer object stored in the closure
            var exp = _explorer;
            
            // first process any pending events with the previously
            // pressed modifier keys still active
            if(exp.draggingStarted) 
                if(exp.stopDragging(event.clientX, event.clientY))
                    exp.redraw();
            
            // see "Javascrip Madness: Key Events", 
            // http://unixpapa.com/js/key.html

            // now change the currently active modifier keys
            exp.activeModifierKeys = exp.KEY_NONE;
            if(event.shiftKey) exp.activeModifierKeys += exp.KEY_SHIFT;
            if(event.ctrlKey)  exp.activeModifierKeys += exp.KEY_CTRL;
            if(event.altKey)   exp.activeModifierKeys += exp.KEY_ALT;
            if(event.metaKey)  exp.activeModifierKeys += exp.KEY_META;
            //window.console.log("key up, mods="+exp.activeModifierKeys);
        };
        
                
        // install event handlers
        canvas.onmousedown=canvas.mouseDown;
	    canvas.onmouseup=canvas.mouseUp;
	    canvas.onmousemove=canvas.mouseMove;  
	    window.document.onkeydown=canvas.keyDown;  
	    window.document.onkeyup=canvas.keyUp;  
    
    }; // SceneExplorer.attachToCanvas()
    

    // this module only returns the SceneExplorer constructor function
    return SceneExplorer;

})); // define module






            
