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
    paths: {
        // require.js plugins
        domReady: '../components/requirejs-domready/domReady',
        hgn: '../components/requirejs-hogan-plugin/hgn',
        text: '../components/requirejs-hogan-plugin/text',
        hogan: '../components/requirejs-hogan-plugin/hogan',

        'gl-matrix': '../components/gl-matrix/dist/gl-matrix'
    },

    shim: {
    },

    // configure hgn! plugin
    hgn: {
        // load "*.mustache" files, set to empty string if you
        // want to specify the template extension for each individual file
        // the default value is ".mustache"
        templateExtension: '',

        // if you need to set custom options it can be done through the
        // "compilationOptions" setting, check hogan documentation:
        // https://github.com/twitter/hogan.js#compilation-options
        compilationOptions: {
            // delimiters : '<% %>',
            // sectionTags: [{o: '_foo', c: 'foo'}],
            // disableLambda : true
        }
    },

    bDebugMode: true
});

/*
 * The function defined below is the "main" module,
 * it will be called once all prerequisites listed in the
 * define() statement are loaded.
 *
 */

define([
    'gl-matrix',
    'domReady',
    'webgl-debug',
    'raymond',
    'html_controller'
], function(glmatrix, domReady, WebGLDebugUtils, Raymond, HtmlController) {

    'use strict';

    // TODO Config
    glmatrix.glMatrix.setMatrixArrayType(Float32Array);

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
        if(!canvas) {
            throw 'HTML element with id "' + canvasName + '" not found';
        }

        // get WebGL rendering context for canvas element
        var options = {alpha: true, depth: true, antialias: true},
            gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);

        if(!gl) {
            throw 'could not create WebGL rendering context';
        }

        // create a debugging wrapper of the context object
        if(require.s.contexts._.config.bDebugMode) {
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
    domReady(function() {
        // catch errors for debugging purposes
        try {
            var gl = makeWebGLContext('drawing_area'),
                engine = new Raymond(gl);

            new HtmlController(engine);

            engine.drawFirstFrame();

        } catch (err) {
            var errorElement = document.getElementById('error');
            if(errorElement) {
                errorElement.innerHTML = err.message || err;
                errorElement.style.display = 'block';
            }
            log('exception: ' + (err.message || err));
            throw err;
        }
    });
}); // define module
