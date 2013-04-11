/*
 * WebGL core teaching framwork
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 *
 * Module: Stage
 * (C)opyright Niels Garve, niels.garve@yahoo.de
 *
 * The Stage lies in the X-Y plane and consists of four vertices:
 *
 *              D             C
 *    y         .-------------.
 *    |         |             |
 *    |         |             |
 *    |         |             |
 *    0-----x   |             |
 *   /          |             |
 *  /           |             |
 * z            .-------------.
 *              A             B
 *
 * *
 */

/* requireJS module definition */
define(["util", "vbo"],
    (function (Util, vbo) {
        "use strict";

        /**
         * constructor, takes WebGL context object as argument
         * @param gl
         * @constructor
         */
        var Stage = function (gl) {

            // generate vertex coordinates and store in an array
            var coords = [
                -8, -5, 0, // coordinates of A
                8, -5, 0, // coordinates of B
                -8, 5, 0, // coordinates of D
                8, 5, 0 // coordinates of C
            ];

            // create vertex buffer object (VBO) for the coordinates
            this.coordsBuffer = new vbo.Attribute(gl, { "numComponents": 3,
                "dataType": gl.FLOAT,
                "data": coords
            });
        };

        /**
         * draw stage as points
         * @param gl
         * @param program
         */
        Stage.prototype.draw = function (gl, program) {
            // bind the attribute buffers
            this.coordsBuffer.bind(gl, program, "vertexPosition");

            // connect the vertices with triangles
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.coordsBuffer.numVertices());
        };

        // this module only returns the constructor function
        return Stage;
    })
); // define


