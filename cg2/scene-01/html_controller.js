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
    var HtmlController = function(scene,animation) {
    
        // internal function: turn a draw option name into a valid HTML element ID
        var drawOptionId = function(name) {
            return "drawOpt_"+name.replace(" ", "_");
        }
    

        // event handler for changes in HTML input elements
        var updateParams = function() {
        
            // toggle animation on/off
            if( $("#anim_Toggle").attr("checked") == undefined ) {
                animation.stop();
            } else {
                /**
                 * reset sampleCounter
                 * @author Niels Garve, niels.garve.yahoo.de
                 * @type {number}
                 */
                scene.sampleCounter = 0;
                animation.resume();
            };

            // modify the drawOptions attribute depending on checkboxes
            for(var o in scene.drawOptions) {
                var element_selector = "#"+drawOptionId(o);
                scene.drawOptions[o] = $(element_selector).attr("checked") == "checked"? true : false;
            };
            
            // in case the animation is not playing, redraw the scene
            scene.draw();
            
        };
        
        // set initial values for the input elements
        $("#anim_Toggle").attr("checked", undefined);

        // create one input element for each object in "objects"
        for(var o in scene.drawOptions) {
            /**
             * put together valid HTML code for a new checkbox
             * @author Niels Garve, niels.garve.yahoo.de
             * @type {string}
             */
            var sNewLabel = '<label class="checkbox inline">' +
                '<input type="checkbox" id="' +
                drawOptionId(o) +
                '" class="inputParam">' +
                o +
                '</label>';

            $('label:last', '#param_area').after(sNewLabel);

            // if object is in the scene now, check it
            if(scene.drawOptions[o] == true) {
                $("#"+drawOptionId(o)).attr("checked","checked");

            };
        };
        
        // set up event handler and execute it once so everything is set consistently
        $(".inputParam").change( updateParams ); 
        updateParams();
        
    }; // end of HtmlController constructor function
        

    // return the constructor function 
    return HtmlController;


})); // require 



            
