/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Material
 *
 * This module defines different types of materials for shading.
 *
 */


/* requireJS module definition */
define([], 
       ( function() {

    "use strict";
    
    /* 
        Object: PhongMaterial
        
        Sets uniform variables in the shader to define 
        a Phong or Blinn-Phong material.
        
        Parameters specified via a config object:
        - uniformName: the name of the uniform struct to be used in the shader
        - config: a configuration object defining the following optional attributes:
          - ambient  [3 floats]: ambient reflection coefficient
          - diffuse  [3 floats]: diffuse reflection coefficient
          - specular [3 floats]: specular reflection coefficient
          - shininess [float]: Phong exponent
            
        Key Methods:
        - draw(): sets uniform variables in the shader
    */
        
    var PhongMaterial = function(uniformName, config) {
    
        config = config || {};
        this.uniformName = uniformName || "material";
        this.ambient   = config.ambient  || [0.0, 0.0, 0.0];
        this.diffuse   = config.diffuse  || [0.4, 0.0, 0.0];
        this.specular  = config.specular || [0.6, 0.6, 0.6];
        this.shininess = config.shininess|| 40;
        
    };
        
        // activate this light by setting the respective uniform variables
    PhongMaterial.prototype.draw = function(gl, program, mvMatrix) {
    
        var name = this.uniformName;

        program.use();
        program.setUniform(name+".ambient",   "vec3",  this.ambient);
        program.setUniform(name+".diffuse",   "vec3",  this.diffuse);
        program.setUniform(name+".specular",  "vec3",  this.specular);
        program.setUniform(name+".shininess", "float", this.shininess);

    };
    
    // this module returns constructors for various light types
    return { "PhongMaterial": PhongMaterial };

})); // define module
        

                                     
