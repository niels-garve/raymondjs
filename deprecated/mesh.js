/*
 * Copyright (c) 2013 Aaron Boman and aaronboman.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.
 */

// Thanks to CMS for the startsWith function
// http://stackoverflow.com/questions/646628/javascript-startswith/646643#646643
if(typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function(str) {
        return this.slice(0, str.length) === str;
    };
}

define([
], function() {

    var Mesh = function(objectData) {

        'use strict';

        /*
         With the given elementID or string of the OBJ, this parses the
         OBJ and creates the mesh.
         */

        var verts = [],
            vertNormals = [],
            textures = [],

        // unpacking stuff
            packed = {};
        packed.verts = [];
        packed.norms = [];
        packed.textures = [];
        packed.hashindices = {};
        packed.indices = [];
        packed.index = 0;

        // array of lines separated by the newline
        var lines = objectData.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = '';
            // if this is a vertex
            if(lines[ i ].startsWith('v ')) {
                line = lines[ i ].slice(2).split(" ");
                verts.push(line[ 0 ]);
                verts.push(line[ 1 ]);
                verts.push(line[ 2 ]);
            }
            // if this is a vertex normal
            else if(lines[ i ].startsWith('vn')) {
                line = lines[ i ].slice(3).split(" ");
                vertNormals.push(line[ 0 ]);
                vertNormals.push(line[ 1 ]);
                vertNormals.push(line[ 2 ]);
            }
            // if this is a texture
            else if(lines[ i ].startsWith('vt')) {
                line = lines[ i ].slice(3).split(" ");
                textures.push(line[ 0 ]);
                textures.push(line[ 1 ]);
            }
            // if this is a face
            else if(lines[ i ].startsWith('f ')) {
                line = lines[ i ].slice(2).split(" ");
                var quad = false;
                for (var j = 0; j < line.length; j++) {
                    // Triangulating quads
                    // quad: 'f v0/t0/vn0 v1/t1/vn1 v2/t2/vn2 v3/t3/vn3/'
                    // corresponding triangles:
                    //      'f v0/t0/vn0 v1/t1/vn1 v2/t2/vn2'
                    //      'f v2/t2/vn2 v3/t3/vn3 v0/t0/vn0'
                    if(j == 3 && !quad) {
                        // add v2/t2/vn2 in again before continuing to 3
                        j = 2;
                        quad = true;
                    }

                    if(line[ j ] in packed.hashindices) {
                        packed.indices.push(packed.hashindices[ line[ j ] ]);
                    }
                    else {
                        var face = line[ j ].split('/');
                        // vertex position
                        packed.verts.push(verts[ (face[ 0 ] - 1) * 3 + 0 ]);
                        packed.verts.push(verts[ (face[ 0 ] - 1) * 3 + 1 ]);
                        packed.verts.push(verts[ (face[ 0 ] - 1) * 3 + 2 ]);
                        // vertex textures
                        packed.textures.push(textures[ (face[ 1 ] - 1) * 2 + 0 ]);
                        packed.textures.push(textures[ (face[ 1 ] - 1) * 2 + 1 ]);
                        // vertex normals
                        packed.norms.push(vertNormals[ (face[ 2 ] - 1) * 3 + 0 ]);
                        packed.norms.push(vertNormals[ (face[ 2 ] - 1) * 3 + 1 ]);
                        packed.norms.push(vertNormals[ (face[ 2 ] - 1) * 3 + 2 ]);
                        // add the newly created vertex to the list of indices
                        packed.hashindices[ line[ j ] ] = packed.index;
                        packed.indices.push(packed.index);
                        // increment the counter
                        packed.index += 1;
                    }

                    if(j == 3 && quad) {
                        // add v0/t0/vn0 onto the second triangle
                        packed.indices.push(packed.hashindices[ line[ 0 ] ]);
                    }
                }
            }
        }
        this.vertices = packed.verts;
        this.vertexNormals = packed.norms;
        this.textures = packed.textures;
        this.indices = packed.indices;
    };

    return Mesh;

});