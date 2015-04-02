/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Parametric Surface
 *
 *
 */


    
/* requireJS module definition */
define(["util", "vbo"], 
       (function(Util, vbo) {

/*

   Object: GenerateParametricSurface  
   
   This is basically a function generating vertex attribute buffers 
   and a draw() method for the specified parametric surface object
    
   Parameters to the constructor:
   - gl: WebGL context
   - definition: object that defines the methods position(), normal(), and texCoords().
     These methods take (u,v) as input, and output the desired attribute (3 floats or 2 floats).
   - config: a configuration object defining the following optional attribtues:
     - uSegments, vSegments: generate how many surface segments in each dimension
     - uMin, uMax: parameter domain for the u coordinate
     - vMin, vMax: parameter domain for the v coordinate
     - solid, wireframe: flags indicating whether to draw triangles and/or wireframe lines
     
   Result:
   - an object with a draw() method that knows how to draw itself 
   
   */ 

    var ParametricSurface = function(gl, definition, config) {

        // dummy/test object defines an X-Y-plane
        definition = definition || {
            "position":   function(u,v) { return [u,v,0]; },
            "normal":     function(u,v) { return [0,0,1]; },
            "texCoords":  function(u,v) { return [u,v];   },
        };

        config = config || {};
        var uSegments = config.uSegments || 10; 
        var vSegments = config.vSegments || 10; 
        var uMin      = config.uMin      || 0; 
        var uMax      = config.uMax      || 1; 
        var vMin      = config.vMin      || 0; 
        var vMax      = config.vMax      || 1; 
        
        // solid and wireframe are public attributes
        this.wireframe = config.wireframe===undefined? false : config.wireframe;
            
        // arrays for the buffer obects
        var numVertices = (uSegments+1)*(vSegments+1);
        var numPatches  = uSegments*vSegments;
        var vposition = new Float32Array(numVertices*3);
        var vnormal   = new Float32Array(numVertices*3);
        var vtexcoord = new Float32Array(numVertices*2);
        var triangles = new Uint16Array(numPatches*6);
        var lines     = new Uint16Array(numPatches*4);

        window.console.log("creating a parametric surface with " + (uSegments+1) 
                             + "*" + (vSegments+1) + "="+ numVertices + " vertices.");
                             window.console.log("wireframe="+this.wireframe);
        
        // loop over u and v to define per-vertex attributes
        var maxindex = 0;
        for(var i=0; i<=uSegments; i++) {
            for(var j=0; j<=vSegments; j++) {

                // current position (u,v) on the surface 
                var u = uMin + i * (uMax-uMin) / uSegments;
                var v = vMin + j * (vMax-vMin) / vSegments;
                
                // current index into the vertex buffers
                var vindex = i*(vSegments+1) + j;

                // calculate and store per-vertex attributes
                if(definition.position) {
                    var p = definition.position(u,v);
                    vposition[vindex*3]   = p[0];
                    vposition[vindex*3+1] = p[1];
                    vposition[vindex*3+2] = p[2];
                };
                if(definition.normal) {
                    var n = definition.normal(u,v);
                    vnormal[vindex*3]   = n[0];
                    vnormal[vindex*3+1] = n[1];
                    vnormal[vindex*3+2] = n[2];
                };
                if(definition.texCoords) {
                    var t = definition.texCoords(u,v);
                    vtexcoord[vindex*2]   = t[0];
                    vtexcoord[vindex*2+1] = t[1];
                };
                
                // index inside the 
                var iindex = i*vSegments + j;
                                                                
                // indices for drawing two triangles per patch
                if(i<uSegments && j<vSegments) {
                    var ii = iindex*6;
                    triangles[ii++] = vindex;
                    triangles[ii++] = vindex+(vSegments+1);
                    triangles[ii++] = vindex+(vSegments+1)+1;
                    triangles[ii++] = vindex+(vSegments+1)+1;
                    triangles[ii++] = vindex+1;
                    triangles[ii++] = vindex;
                };
                // indices for drawing two lines per patch
                if(i<uSegments && j<vSegments) {
                    var ii = iindex*4;
                    lines[ii++] = vindex;
                    lines[ii++] = vindex+(vSegments+1);
                    lines[ii++] = vindex;
                    lines[ii++] = vindex+1;
                };
            }; // for j
        }; // for i

                    
        // create attribute buffers
        if(definition.position) 
            this.posBuffer = new vbo.Attribute(gl, {"numComponents": 3, "dataType": gl.FLOAT, "data": vposition} );
        if(definition.normal) 
            this.normalBuffer = new vbo.Attribute(gl, {"numComponents": 3, "dataType": gl.FLOAT, "data": vnormal} );
        if(definition.texCoords) 
            this.texCoordsBuffer = new vbo.Attribute(gl, {"numComponents": 2, "dataType": gl.FLOAT, "data": vtexcoord} );
        // create index buffers
        this.triangleBuffer = new vbo.Indices(gl, {"indices": triangles});
        this.lineBuffer     = new vbo.Indices(gl, {"indices": lines});
    };

    // add a draw method to the object
    ParametricSurface.prototype.draw = function(gl, program) {
        
        // go through all vertex attribute buffers 
        // and enable them before drawing
        if(this.posBuffer) 
            this.posBuffer.bind(gl, program, "vertexPosition");
        if(this.normalBuffer)
            this.normalBuffer.bind(gl, program, "vertexNormal");
        if(this.texCoordsBuffer)
            this.texCoordsBuffer.bind(gl, program, "vertexTexCoords");
         
        if(this.wireframe) {
            // draw wireframe lines
            this.lineBuffer.bind(gl);
            program.gl.drawElements(gl.LINES, this.lineBuffer.numIndices(), gl.UNSIGNED_SHORT, 0);
        } else {
            // draw as solid / surface
            this.triangleBuffer.bind(gl);
            gl.polygonOffset(2.0,2.0);
            gl.enable(gl.POLYGON_OFFSET_FILL);
            program.gl.drawElements(gl.TRIANGLES, this.triangleBuffer.numIndices(), gl.UNSIGNED_SHORT, 0);
            gl.disable(gl.POLYGON_OFFSET_FILL);
        };
        
        
    }; // draw()
            
/*

       Object: Torus
       
       Defines position, normal, and some texture coordinates for a torus.
       Uses GenerateParaetricSurface to create the respective 
       vertex attributes. 

    */
        
        
    Torus = function(gl, radius, radius2, config) {
    
        config = config || {};

        var torus = {};
        
        // vertex position for a given (u,v)
        torus.position = function(u,v) {
            return [ (radius + radius2 * Math.cos(v)) * Math.cos(u),
                     (radius + radius2 * Math.cos(v)) * Math.sin(u),
                     radius2 * Math.sin(v) ];
        };
        // vertex normal for a given (u,v)
        torus.normal = function(u,v) {
            return [  Math.cos(u) * Math.cos(v),
                      Math.sin(u) * Math.cos(v),
                      Math.sin(v)];
        };
        // texture coords for a given (u,v)
        torus.texCoords = function(u,v) {
            return [ u/(2.0*Math.PI),
                     v/(2.0*Math.PI) ];

        };
        
        var conf = {"uMin": 0, "uMax": 2*Math.PI, 
                    "vMin": 0, "vMax": 2*Math.PI, 
                    "uSegments": config.uSegments || 40,
                    "vSegments": config.vSegments || 20,
                    "wireframe": config.wireframe };
    
        return new ParametricSurface(gl, torus, conf);

    };        
       
    Sphere = function(gl, radius, config) {

        config = config || {};

        var sphere = {};
        sphere.position = function(u,v) {
            return [ radius * Math.sin(u) * Math.sin(v),
                     radius * Math.cos(u) * Math.sin(v),
                     radius * Math.cos(v) ];
        };

        // on a sphere, the normal direction is the same as the position
        sphere.normal = sphere.position;

        sphere.texCoords = function(u,v) {
            return [ 0.5 + u/(Math.PI*2), v/(Math.PI) ];
        };
        
        var conf = {"uMin": 0, "uMax": 2*Math.PI, 
                    "vMin": 0, "vMax": Math.PI, 
                    "uSegments": config.uSegments || 40,
                    "vSegments": config.vSegments || 20,
                    "wireframe": config.wireframe };
    
        return new ParametricSurface(gl, sphere, conf);

    };
    
    return { "ParametricSurface": ParametricSurface,
             "Sphere": Sphere,
             "Torus": Torus };
    

})); // define

