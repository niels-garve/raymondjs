/*
 * Module main: CG2 Aufgabe 2, Winter 2012/2013
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 *
 */

/*
 * The function defined below is the "main" module,
 * it will be called once all prerequisites listed in the
 * define() statement are loaded.
 *
 */

(function() {

    'use strict';

    /**
     * Module: html_controller
     *
     * Defines callback functions for communicating with various
     * HTML elements on the page, e.g. buttons and parameter fields.
     *
     * Also handles key press events.
     *
     * @author Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
     * @author Niels Garve, niels.garve.yahoo.de
     * @param engine
     * @constructor
     */
    var HtmlController = function(engine) {
        document.getElementById('anim_Toggle').onchange = function(event) {
            if (event.target.checked) {
                engine.resume();
            } else {
                engine.stop();
            }
        }
    };

    /**
     * This function asks the HTML Canvas element with id canvasName to create
     * a context object for WebGL rendering.
     *
     * It also creates awrapper around it for debugging
     * purposes, using webgl-debug.js
     *
     * @author Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
     * @author Niels Garve, niels.garve.yahoo.de
     * @param canvasName
     * @returns {*}
     * @private
     */
    var makeWebGLContext = function(canvasName) {
        // get the canvas element to be used for drawing
        var canvas = document.getElementById(canvasName);
        if (!canvas) {
            throw 'HTML element with id "' + canvasName + '" not found';
        }

        // get WebGL rendering context for canvas element
        var options = {alpha: true, depth: true, antialias: false},
            gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);

        if (!gl) {
            throw 'could not create WebGL rendering context';
        }

        // create a debugging wrapper of the context object
        // TODO config
        if (true) {
            var throwOnGLError = function(err, funcName, args) {
                throw WebGLDebugUtils.glEnumToString(err) + ' was caused by call to: ' + funcName;
            };

            gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError);
        }
        return gl;
    };

    /**
     * main program, to be called once the document has loaded
     * and the DOM has been constructed
     *
     * @author Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
     * @author Niels Garve, niels.garve.yahoo.de
     */
    document.addEventListener('DOMContentLoaded', function() {
        // catch errors for debugging purposes
        try {
            var gl = makeWebGLContext('drawing_area'),
                engine = new Raymond(gl);

            new HtmlController(engine);

            engine.drawFirstFrame();

        } catch (err) {
            var errorElement = document.getElementById('error');
            if (errorElement) {
                errorElement.innerHTML = err.message || err;
                errorElement.style.display = 'block';
            }
            log('exception: ' + (err.message || err));
            throw err;
        }
    });
})();
