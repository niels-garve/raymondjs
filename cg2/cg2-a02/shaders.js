/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Shaders
 *
 * This module provides some basic shaders as source code.
 *
 */


/* requireJS module definition */
define(["util"], 
       (function(Util) {
       
    "use strict";
    
    var mod = {};
    
    /* 
     * vertex shader applying a modelview as well as
     * a projection matrix, expecting an attribute "vertexPosition" 
     * of type vec3.
     */ 
    mod.vs_NoColor = function() {
    
        return [
            "attribute vec3 vertexPosition;" ,
            "uniform mat4 modelViewMatrix;" ,
            "uniform mat4 projectionMatrix;" ,
            "" ,
            "void main() {" ,
            "  gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition,1.0);" ,
            "  gl_PointSize = 3.0;" ,
            "}" 
            ].join("\n");
    };

    /* 
     * vertex shader applying a modelview as well as
     * a projection matrix, expecting an attribute "vertexPosition" 
     * of type vec3 and a per-vertex color of type vec4.
     */ 
    mod.vs_PerVertexColor = function() {
    
        return [
            "attribute vec3 vertexPosition;" ,
            "attribute vec4 vertexColor;" ,
            "uniform mat4 modelViewMatrix;" ,
            "uniform mat4 projectionMatrix;" ,
            "varying vec4 fragColor;",
            "" ,
            "void main() {" ,
            "  gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition,1.0);" ,
            "  gl_PointSize = 3.0;" ,
            "  fragColor = vertexColor;" ,
            "}" 
            ].join("\n");
    };

    /* 
     * simplest possible fragment shader rendering everything using a constant color 
     * (RGBA four floats [0:1]) that defaults to red if not specified.
     */ 
     
    mod.fs_ConstantColor = function(color) {
    
        color = color || [1.0,0.0,0.0,1.0];
    
        return [
            "precision mediump float;" ,
            "void main() {" ,
            "  gl_FragColor = vec4("+color.join(",")+");" ,
            "}" 
            ].join("\n");
    };

    /* 
     * fragment shader expecting a varying "fragColor" containing an 
     * RGBA color of type vec4. 
     */ 
     
    mod.fs_PerVertexColor = function() {
        
        return [
            "precision mediump float;" ,
            "varying vec4 fragColor;" ,
            "void main() {" ,
            "  gl_FragColor = fragColor;" ,
            "}" ].join("\n");
    };

                             
    // this module returns an interface containing multiple functions    
    return mod;

})); // define


