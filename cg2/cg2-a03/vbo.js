/*
 *
 * WebGL Core Teaching Framework
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: VBO (Vertex Buffer Objects)
 *
 * The VBO module simpifies the creation and usage of vertex attribute 
 * buffers and index/element buffers. There are two constructors in the
 * interface of this module: vbo.Attribute() and vbo.Indices(). See comments
 * below.
 *
 */

/* requireJS module definition */
define(["util"], 
       (function(util) {

    "use strict";
    
    // the interface of this module
    var vbo = {};

    /* 

       Constructor: Attribute
       Creates a Vertex Buffer Object (VBO) representing a single 
       vertex attribute.
        
       Parameters to the constructor:
       - gl is the WebGL context to be used for drawing
       - config.numComponents is the number of primitive data elements 
         per attribute, e.g. 3 for a vec3
       - config.data is the actual data, e.g. a Float32Array for 
         float-typed attributes. If this is a native JavaScript Array, 
         it will be copied and converted to Float32Array.
       - config.dataType is the primitive data type used (default gl.FLOAT)
       - config.warnUnused is a flag indicating whether to show a warning if 
         the program does not use this attribute (i.e. wrong shader variable 
         name)
       
       Results of the constructor:
       - creates and returns a wrapper to a WebGL vertex buffer 
         object (VBO) for the specified vertex attribute data
       - the data from the dataArray will be copied into the VBO 
         residing in graphics (or driver) memory; it is safe to 
         delete the dataArray after the constructor call

       Methods:
       - bind(gl, program, attribName) binds the VBO to the shader variable
         given by the string attribName.
         If another VBO is bound to the same shader variable later,
         the newer one takes precedence over the older one.
         
       Example to create VBO consisting of three floats per vertex, 
       and use it for the attribute "vertexPosition" :
       var coords = [-1,0,0, 1,0,0, 0.5,1,0]; // triangle
       var buf = new vbo.VertexAttribute(gl, {"numComponents": 3, 
                                              "dataType": gl.FLOAT,
                                              "data": coords } );       
       ...
       buf.bind(gl, program, "vertexPosition");
       ...
       gl.drawArrays(...);
       
    */ 

    vbo.Attribute = function(gl, config) {

        // store the parameters as attributes
        this.numComponents = config.numComponents;
        this.dataType      = config.dataType || gl.FLOAT;
        this.warnUnused    = config.warnUnused;
        if(this.warnUnused === undefined) { this.warnUnused = false; };
        var data = config.data;
        
        // calculate number of vertices from array length
        this.numVert = data.length / this.numComponents;
        
        // convert array to typed array if the user just provided a normal array
        if(!(data instanceof Float32Array))
            data = new Float32Array(data);

        // create the WebGL buffer object and copy the data
        this.glBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        
        // "data" is no longer used after this.
        
    };

    /*
     * bind() method of Attribute objects 
     * binds the VBO to its respective shader variable
     */
    vbo.Attribute.prototype.bind = function(gl, program, attribName) {
        
        // get location to which this attribute is bound 
        // in the currently active WebGL program
        program.use();
        var location = program.getAttribLocation(attribName);
        if(location < 0) {
            if(this.warnUnused) {
                window.console.log("vertex attribute " + attribName + 
                           " not used in vertex shader.");
            }
            return;
        }; 
            
        // bind the buffer object to the current vertex array 
        gl.bindBuffer(gl.ARRAY_BUFFER, this.glBuffer);

        // which part of the buffer is to be used for this object
        gl.vertexAttribPointer(location, this.numComponents, 
                               this.dataType, false, 0, 0);
            
        // enable this array / buffer
        gl.enableVertexAttribArray(location);
        
    };
    
    /*
     * numVertices() method returns number of vertices in the VBO 
     */
    vbo.Attribute.prototype.numVertices = function() {
        return this.numVert;
    };

    /* 

       Constructor: Indices
       Creates a Vertex Buffer Object (VBO) that contains indices pointing
       to vertices, i.e. for connecting the vertices with lines or triangles.
        
       Parameters to the constructor:
       - gl is the WebGL context to be used for drawing
       - config.indices: a Uint16Array of indices. If it is a native JavaScript 
         array, it will be copied and converted to a typed array.
    
       Methods:
       - bind() makes this VBO the active element buffer. 
       - numIndices() returns the number of elements/indices in the buffer. 
    */
    vbo.Indices = function(gl, config) {

        var indices = config.indices;
        this.numElements = indices.length;
        
        // create a WebGL buffer object
        this.glBuffer = gl.createBuffer();
        
        // convert array to Uint16Array if necessary
        if(! (indices instanceof Uint16Array)) 
            indices = new Uint16Array(indices);
        
        // copy the index data over 
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        
    };
    
    /*
     * method numIndices(): return number of indices contained in the VBO
     */
    vbo.Indices.prototype.numIndices = function() {
        return this.numElements;  
    };

    /*
     * method bind(): make this VBO the active element buffer 
     */ 
    vbo.Indices.prototype.bind = function(gl) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.glBuffer);
    };


    // this module returns an interface with two constructors
    return vbo;

})); // end define

            