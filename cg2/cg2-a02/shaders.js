/*
 * WebGL core teaching framework 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Shaders
 *
 * This module loads required shaders using the require.js text plugin, 
 * see https://github.com/requirejs/text 
 *
 */


/* requireJS module definition */
define([
    "text!shaders/pathtracing.vert",    "text!shaders/pathtracing.frag",
    "text!shaders/texture.vert",        "text!shaders/texture.frag"
    ], (function(
    pathtracing_vert,       pathtracing_frag,
    texture_vert,           texture_frag
    ) {

    "use strict";
    
    // return source code of a vertex shader
    var shaders = function(name) {
        var shader = eval(name);
        if(!shader) {
            throw "module shaders: shader " + name + " undefined.";
        }
        return shader;
    };
    
    // module returns the function shaders
    return shaders;    
    
})); // define module
        

