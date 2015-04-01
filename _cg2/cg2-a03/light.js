/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Light
 *
 * This module defines different types of light sources.
 *
 */


/* requireJS module definition */
define([], 
       ( function() {

    "use strict";
    
    var LIGHT_DIRECTIONAL = 0;
    var LIGHT_POINT = 1;
    var LIGHT_SPOT = 2;

    /* 
        Object: DirectionalLight
        
        Sets uniform variables in the shader to define 
        a directional light source.
        
        Parameters to the constructor:
        - uniformName: the name of the uniform struct variable to be used in the shader
        - config: a configuration object with the following optional parameters:
          - direction [3 floats]: direction in which the light is travelling
          - color [3 floats]: light color / intensities (RGB)
          - on [bool]: light on/off
        
        Key Methods:
        - draw(): sets the uniforms in the shader (does not call any draw command!)
    */
        
    var DirectionalLight = function(uniformName, config) {

        config = config || {};
        this.uniformName = uniformName      || "light"
        this.direction   = config.direction || [-1,0,0];
        this.color       = config.color     || [1,0,0];
        this.on          = config.on        || true;
        
    };
        
    // transform light direction and set all light struct elements in the shader
    DirectionalLight.prototype.draw = function(gl, program, mvMatrix) {    
    
        // calculate the normal matrix
        var normalMatrix =  mat4.toInverseMat3(mvMatrix || mat4.identity());
        mat3.transpose(normalMatrix,normalMatrix);

        // transform light direction vector using normal matrix
        var dir = vec3.create(this.direction);
        mat3.multiplyVec3(normalMatrix,dir);

        // set uniforms
        var name = this.uniformName;
        program.use();
        program.setUniform(name + ".type",      "int",  LIGHT_DIRECTIONAL);
        program.setUniform(name + ".on",        "bool", this.on);
        program.setUniform(name + ".direction", "vec3", dir);
        program.setUniform(name + ".color",     "vec3", this.color);
    };
    
    // this module returns constructors for various light types
    return { "DirectionalLight": DirectionalLight };

})); // define module
        

                                     
