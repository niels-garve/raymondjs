/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: html_controller
 *
 * Defines callback functions for communicating with various 
 * HTML elements on the page, e.g. buttons and parameter fields.
 *
 * Also handles key press events.
 *
 */

 
/* requireJS module definition */
define(["jquery"], 
       (function($) {

    "use strict"; 
                
    /*
     * define callback functions to react to changes in the HTML page
     * and provide them with a closure defining context and scene
     *
     */
    var HtmlController = function(scene,lightAnimation) {
    
        // internal function: turn a draw option name into a valid HTML element ID
        var drawOptionId = function(name) {
            return "drawOpt_"+name.replace(" ", "_");
        }
    

        // event handler for changes in HTML input elements
        var updateParams = function() {
                    
            // toggle animation on/off
            if( $("#lightanim_Toggle").attr("checked") == undefined ) {
                lightAnimation.stop();
            } else {
                lightAnimation.resume();
            };

            // set animation speed
            lightAnimation.customSpeed = parseFloat($("#lightanim_Speed").attr("value"));
            
            // modify the drawOptions attribute depending on checkboxes
            for(var o in scene.drawOptions) {
                var element_selector = "#"+drawOptionId(o);
                scene.drawOptions[o] = $(element_selector).attr("checked") == "checked"? true : false;
            };
            
            // in case the animation is not playing, redraw the scene
            scene.draw();
            
        };
        
        // set initial values for the input elements
        $("#lightanim_Toggle").attr("checked", undefined);
        $("#lightanim_Speed").attr("value", 20);
        
        // create one input element for each object in "objects"
        for(var o in scene.drawOptions) {
            
            // put together valid HTML code for a new table row 
            var newRow = '<tr><td>'+o+'</td>'+
                         '<td><input id="'+drawOptionId(o)+'" type="checkbox" class="inputParam"></input></td></tr>\n';
                         
            // insert HTML code after the last table row so far.
            $('#param_table tr:last').after(newRow);
            
            // if object is in the scene now, check it
            if(scene.drawOptions[o] == true) {
                $("#"+drawOptionId(o)).attr("checked","checked");

            };
        };
        
        // change robot's rotation angles on key press
        $(document).keypress((function(event) {
            window.console.log("key " + event.which + " pressed");
            // you can add any function call here yourself
        }));

                
        // set up event handler and execute it once so everything is set consistently
        $(".inputParam").change( updateParams ); 
        updateParams();
        
    }; // end of HtmlController constructor function
        

    // return the constructor function 
    return HtmlController;


})); // require 



            
