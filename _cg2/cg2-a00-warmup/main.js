/*
 * Configure libraries/paths for this project.
 * using RequireJS from http://requirejs.org/
 *
 */

requirejs.config({
    enforceDefine: true,
    paths: {
    
        // jquery library to simplify working with the DOM 
        "jquery": [
            // try content delivery network location first
            'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
            //If the load via CDN fails, load locally
            '../lib/jquery-1.7.2.min'],
            
        // gl-matrix library for WebGL matrix operations 
        "gl-matrix": "../lib/gl-matrix-1.3.7"

    }
});


/*
 * The function defined below is the "main" function,
 * it will be called once all prerequisites listed in the
 * define() statement are loaded.
 *
 */

define(["jquery", "util", "scene", "straight_line", "webgl-demo"], 
       (function($, Util, Scene, StraightLine, webgldemo) {
        
    try {

        /*
         *  Canvas 2D drawing example
         */ 
        window.console.log("Executing 2D canvas test.");
        canvas=document.getElementById("drawing_area");
        context=canvas.getContext("2d");
        
        // create a scene with a curve in it
        var scene = new Scene(context, "#EDEDED"); 

        var line = new StraightLine(context, scene, [50,100], [250,100]);
        scene.add(line);
        
        // local function called whenever a form input field is changed
        // current closure contains line, surve, scene, etc.
        var updateParams = function() {
    
            var showDraggers = $("#showDraggers").attr("checked");
            line.showDraggers = showDraggers;            
            
            scene.draw();
        };
        
        // update and draw the scene according to the input fields
        updateParams();

        /*
         *  File API check
         */ 
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            window.console.log("The File-related APIs seems to exist.");
        } else {
            throw new Util.RuntimeError('The File APIs are not fully supported in this browser.');
        }
        
        /*
         *  WebGL / Texture test
         */ 
        window.console.log("Executing WebGL 3D / texture test.");
        webgldemo();

    } catch (err) {
        Util.fatalError(err);
    };


})); // define
        

