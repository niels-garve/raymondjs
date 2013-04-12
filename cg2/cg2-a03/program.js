/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Program
 *
 * A Program encapsulates a WebGL program object and has methods
 * to create the program from shader source code, enable the program,
 * query for attribute locations, and set attributes.
 *
 * Method Overview:
 * - use()              : makes this the active program
 * - getAttribLocation(): returns the "handle" for a named attribute
 * - setUniform()       : define the value of a uniform shader variable
 * - setTexture()       : define a texture to be used in the shaders
 * - glRenderContext()  : returns associated (native) WebGL rendering context
 * - glProgram()        : returns associated (native) WebGL program object
 *
 */


/* requireJS module definition */
define(["util"], 
       (function(util) {
       
    "use strict";
    
    /* 
     * "private static" variable within this module, keeping track of the currently active program
     * for each rendering context
     *
     */
    window.console.log("executing module program.js");
    var _currentProgramList = [];
    
    /* private function to check compilation status */
    var checkCompilationStatus = function(gl, shader, name) {
    
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        
        if (!compiled) {
            // Something went wrong during compilation; get the error
            var error = gl.getShaderInfoLog(shader);
            throw name + ": " + error;
            gl.deleteShader(shader);
            return false;
        };
        return true;
    };
 
    /* 

        Object: Program
        The program holds a set of compiled shaders. During rendering of a scene,
        it is possible to switch between programs by calling their
        respective use() methods. The program is associated with a 
        specific rendering context.
       
        Parameters to the constructor function:
        - progName             : string containing the name of the program for UI purposes
        - gl                   : WebGL rendering context created via initWebGL()
        - vertexShaderSource   : string containing source code of the vertex shader. 
        - fragmentShaderSource : string containing source code of the fragment shader. 
         
       
    */ 

    var Program = function(gl, vertexShaderSource, fragmentShaderSource) {

        // store associated WebGL rendering context
        this.gl = gl;

        // create a new WebGL program object
        this.glProgram = gl.createProgram();
        
        // compile and attach vertex shader
        var vshader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vshader, vertexShaderSource);
        gl.compileShader(vshader);
        if(!checkCompilationStatus(gl, vshader,"vertex shader")) {
            return null;
        };
        gl.attachShader(this.glProgram, vshader);

        // compile and attach fragment shader
        var fshader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fshader, fragmentShaderSource);
        gl.compileShader(fshader);
        if(!checkCompilationStatus(gl, fshader,"fragment shader")) {
            return null;
        }
        gl.attachShader(this.glProgram, fshader);

        // link the program so it can be used
        gl.linkProgram(this.glProgram);
        
        // check for linking errors
        
        if (!gl.getProgramParameter(this.glProgram, gl.LINK_STATUS)) {
            throw "linking error: " + gl.getProgramInfoLog(this.glProgram);
            return null;
        }

    }; 

    /* 
     * method use(): switch between WebGL programs, activate this program. 
     * Please note that for performance reasons, the program will only
     * be switched if it is not already the active program.
     *
     */
    Program.prototype.use = function() {
    
        if(_currentProgramList[this.gl] === this) {
            // do nothing because a gl.useProgram() is expensive!!!
        } else {
            this.gl.useProgram(this.glProgram);
            _currentProgramList[this.gl] = this;
        };
        
    };
    
    /* 
     * method getAttributeLocation() is a wrapper for the WebGL getAttributeLocation. 
     *
     */
    Program.prototype.getAttribLocation = function(name) {
    
        return this.gl.getAttribLocation(this.glProgram, name);
        
    };

    
    /* method: return WebGL rendering context */
    Program.prototype.glRenderContext = function() {
        return this.gl;
    };
    
    /* method: return WebGL program object */
    Program.prototype.glProgramObject = function() {
        return this.glProgram;
    };

    /*
        method: Set the value of a uniform variable in a WebGL shader.
   
        parameters:
        - name [string]: the name of the uniform variable as it appears
          in the shader source code
        - type [string]: "float", "vec3", "vec4", "mat3", "mat4"
        - value [any type]: the actual value of the variable, with a type
          matching the respective WebGL type
     
        return Value:
        - true if the uniform was set successfully, else false.
    */

    Program.prototype.setUniform = function(name, type, value, showWarning) {
    
        if(showWarning === undefined) {
            showWarning = true;
        };

        // get the location of the uniform within the program object
        var location = this.gl.getUniformLocation(this.glProgram, name);
        if(location == null) {
            if(showWarning) {
                window.console.log("WARNING: uniform variable " + name + " not used in shader.");
            };
        } else {
        
            switch(type) {
                case "mat4":
                    this.gl.uniformMatrix4fv(location, false, value);
                    return true;
                case "mat3":
                    this.gl.uniformMatrix3fv(location, false, value);
                    return true;
                case "mat2":
                    this.gl.uniformMatrix2fv(location, false, value);
                    return true;
                case "vec4":
                    this.gl.uniform4fv(location, value);
                    return true;
                case "vec3":
                    this.gl.uniform3fv(location, value);
                    return true;
                case "vec2":
                    this.gl.uniform2fv(location, value);
                    return true;
                case "float":
                    this.gl.uniform1f(location, value);
                    return true;
                case "int":
                    this.gl.uniform1i(location, value);
                    return true;
                case "bool": // bool is transferred as integer!
                    this.gl.uniform1i(location, value);
                    return true;
                default: 
                    throw new util.RuntimeError("setUniform(): unknown uniform type '"+type+"'", this);
                    return false;
            }; // end switch
            
        }; // end else
    
        return false;
        
    }; // end setUniform()
    
    /* 
        method setTexture(): bind a texture to a name and a texture unit in this program 
        parameters: 
        - uniformName: a string containing the name of the uniform variable in the shader
        - textureUnit: an integer specifying which texture unit shall be used
        - texture:     a wrapper object for a WebGL texture (specifics see below)
        - showWarning: optional flag whether to show warnings or not (default: true)
        
        the texture object must be a wrapper for a WebGL texture providing 
        the following two methods:
        - isLoaded() returns true if the associated image data has already been loaded
        - glTextureObject() returns the associated native WebGL texture object
    */
    Program.prototype.setTexture = function(uniformName, textureUnit, texture, showWarning) {
    
        // by default, show warnings
        if(showWarning === undefined) {
            showWarning = true;
        };

        // does the texture object have an isLoaded() method?
        if( !texture.isLoaded ) {
            throw new util.RuntimeError("setTexture(): not a valid texture wrapper object.");
            return false; 
        };
        
        // has the texture already been loaded?
        if( !texture.isLoaded() ) {
            window.console.log("info: image file for texture "+uniformName+" not loaded yet.");
            return false;
        };

        // is the desired texture unit within the allowed range?
        var max = this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS;
        if(textureUnit < 0 || textureUnit >= max) {
            fatalError("ERROR: setTexture(): texture unit " + textureUnit + 
                       " out of range [0 ... " + max-1) + "]";
            return false;
        };
        
        // find location of texture's uniform variable
        var location = this.gl.getUniformLocation(glProgram, uniformName);
        if(location === null) {
            logWarning("uniform sampler " + uniformName + " not used in shader.");
            return;
        };
        
        // window.console.log("using texture unit "+textureUnit+" for sampler "+samplerName);

        // bind the texture unit to the sampler's location/name
        this.gl.uniform1i(location, textureUnit);

        // activate the right texture unit
        this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
        
        // bind the actual texture object to the texture unit
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture.glTextureObject());
      
    }; // setTexture()
                             
    // this module only returns the Program constructor function    
    return Program;

})); // define

    
