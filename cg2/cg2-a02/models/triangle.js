/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Triangle
 *
 * The Triangle lies in the X-Y plane and consists of three vertices:
 *
 *                     C 
 *    y                .
 *    |               / \
 *    |              /   \
 *    |             /     \    
 *    0-----x      /       \   
 *   /            /         \  
 *  /            /           \ 
 * z            .-------------.  
 *              A             B
 *
 * *
 */


/* requireJS module definition */
define(["util", "vbo"], 
       (function(Util, vbo) {
       
    "use strict";
    
    // constructor, takes WebGL context object as argument
    var Triangle = function(gl) {
    
        // generate vertex coordinates and store in an array
        var coords = [ -0.5, -0.5,  0,  // coordinates of A
                        0.5, -0.5,  0,  // coordinates of B
                          0,  0.5,  0   // coordinates of C
                     ];

        // create vertex buffer object (VBO) for the coordinates
        this.coordsBuffer = new vbo.Attribute(gl, { "numComponents": 3,
                                                    "dataType": gl.FLOAT,
                                                    "data": coords 
                                                  } );
                     
    };

    // draw triangle as points 
    Triangle.prototype.draw = function(gl,program) {

        // bind the attribute buffers
        this.coordsBuffer.bind(gl, program, "vertexPosition");
        
        // connect the vertices with triangles
        gl.drawArrays(gl.POINTS, 0, this.coordsBuffer.numVertices()); 
         
    };
        
    // this module only returns the constructor function    
    return Triangle;

})); // define

    
