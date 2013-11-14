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

/**
 * @author Niels Garve, niels.garve.yahoo.de
 */
define([
], function() {

    "use strict";

    var HtmlController = function(engine) {

        document.getElementById('anim_Toggle').onchange = function(event) {
            if(event.target.checked) {
                engine.resume();
            } else {
                engine.stop();
            }
        }

    };

    return HtmlController;
});
