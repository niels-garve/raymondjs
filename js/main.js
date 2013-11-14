/*
 * Module main: CG2 Aufgabe 2, Winter 2012/2013
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 */


/**
 * RequireJS alias/path configuration (http://requirejs.org/)
 *
 * @author Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 * @author Niels Garve, niels.garve.yahoo.de
 */
requirejs.config({
    shim: {
        'webgl-obj-loader': {
            deps: ['jquery']
        }
    },

    paths: {
        // jquery library
        jquery: [
            // try content delivery network location first
            'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min',
            // if the load via CDN fails, load locally
            'lib/jquery-1.7.2.min'
        ],

        // gl-matrix library
        'gl-matrix': 'lib/gl-matrix-1.3.7',

        'webgl-obj-loader': 'loaders/webgl-obj-loader',

        Stage: 'models/Stage'
    }
});

/*
 * The function defined below is the "main" module,
 * it will be called once all prerequisites listed in the
 * define() statement are loaded.
 *
 */

/* requireJS module definition */
define(["jquery", "gl-matrix", "webgl-debug", "scene", "animation", "scene_explorer", "html_controller" ], 
       (function($, glmatrix, WebGLDebugUtils, Scene, Animation, SceneExplorer, HtmlController ) {

        "use strict";

        /**
         * This function asks the HTML Canvas element with id canvas_name to create
         * a context object for WebGL rendering.
         *
         * It also creates awrapper around it for debugging
         * purposes, using webgl-debug.js
         *
         * @param canvas_name
         * @returns {*}
         */
        var makeWebGLContext = function (canvas_name) {
            // get the canvas element to be used for drawing
            var canvas = $("#" + canvas_name).get(0);
            if (!canvas) {
                throw "HTML element with id '" + canvas_name + "' not found";
            }

            // get WebGL rendering context for canvas element
            var options = {alpha: true, depth: true, antialias: true},
                gl = canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options);

            if (!gl) {
                throw "could not create WebGL rendering context";
            }

            // create a debugging wrapper of the context object
/*
            var throwOnGLError = function (err, funcName, args) {
                throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
            };

            gl = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError);
*/
            return gl;
        };

        /**
         * create an animation for timing and regular calls of Scene.draw()
         *
         * @author Niels Garve, niels.garve.yahoo.de
         * @param scene
         * @returns {Animation}
         */
        var makeAnimation = function (scene) {
            // create animation to rotate the scene
            return new Animation((function (t) {
                // (re-) draw the scene
                scene.draw(t);

            })); // end animation callback
        };

        /**
         * main program, to be called once the document has loaded
         * and the DOM has been constructed
         *
         * @author Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
         * @author Niels Garve, niels.garve.yahoo.de
         */
        $(document).ready((function () {
            // catch errors for debugging purposes
            try {
                log("document ready - starting!");

                // create WebGL context object for the named canvas object
                var gl = makeWebGLContext("drawing_area"),
                // create scene and animation, and start drawing
                    scene = new Scene(gl),
                    animation = makeAnimation(scene), // do not start yet
                    explorer = new SceneExplorer(gl.canvas, false, scene),
                // create HTML controller that handles all the interaction of
                // HTML elements with the scene and the animation
                    controller = new HtmlController(scene, animation);

                scene.draw(0.0);
            } catch (err) {
                var $error = $("#error");
                if ($error) {
                    $error.text(err.message || err);
                    $error.css('display', 'block');
                }
                log("exception: " + (err.message || err));
                throw err;
            }
        })); // $(document).ready()
    }) // self executing function
); // define module
