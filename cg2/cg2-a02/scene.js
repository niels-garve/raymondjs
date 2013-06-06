/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Scene
 *
 * This module defines the scene to be drawn.
 *
 * A Scene object has a draw() method to draw itself, plus some
 * public attributes that may be used by animation functions etc:
 *
 * Scene.world:       the root node of the scene, of type SceneNode
 *
 * Scene.camera:      the camera to be used, consisting of two attributes:
 *                    camera.viewMatrix and camera.projectionMatrix.
 * 
 * Scene.drawOptions: array of strings defining on/off drawing options. 
 *                    this is potentially used by HtmlController to create
 *                    the corresponding check boxes in the HTML document.
 *
 */


/* requireJS module definition */
define(["jquery", "gl-matrix", 
        "program", "shaders", "scene_node", "texture", "light", "material",
        "models/Stage"],
       (function($, glmatrix, 
                 Program, shaders, SceneNode, Texture, light, material,
                 Stage ) {

    "use strict";


            function setUniformScene(prog) {
                prog.setUniform("spheres[0].center", "vec3", [0, 0, -10]);
                prog.setUniform("spheres[0].radius", "float", 1);
                prog.setUniform("sphereMaterials[0].isLight", "bool", true);
                prog.setUniform("sphereMaterials[0].isPerfectMirror", "bool", false);
                prog.setUniform("sphereMaterials[0].isDiffuse", "bool", false);

                prog.setUniform("spheres[1].center", "vec3", [-2.5, 0, -10]);
                prog.setUniform("spheres[1].radius", "float", 1);
                prog.setUniform("sphereMaterials[1].isLight", "bool", false);
                prog.setUniform("sphereMaterials[1].isPerfectMirror", "bool", true);
                prog.setUniform("sphereMaterials[1].isDiffuse", "bool", false);

                prog.setUniform("spheres[2].center", "vec3", [2.5, 0 , -10]);
                prog.setUniform("spheres[2].radius", "float", 1);
                prog.setUniform("sphereMaterials[2].isLight", "bool", false);
                prog.setUniform("sphereMaterials[2].isPerfectMirror", "bool", true);
                prog.setUniform("sphereMaterials[2].isDiffuse", "bool", false);

                prog.setUniform("cornellBox.minCorner", "vec3", [-4.0, -2.0, -12.0]);
                prog.setUniform("cornellBox.maxCorner", "vec3", [4.0, 2.0, 12.0]);
                prog.setUniform("cornellBoxMaterial.isLight", "bool", false);
                prog.setUniform("cornellBoxMaterial.isPerfectMirror", "bool", false);
                prog.setUniform("cornellBoxMaterial.isDiffuse", "bool", true);
            }

            // a simple scene is an object with a few objects and a draw() method
            var Scene = function(gl) {

                // store the WebGL rendering context 
                this.gl = gl;

                var canvas = gl.canvas,
                    framebuffer = gl.createFramebuffer();

                gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
                framebuffer.width = canvas.width;
                framebuffer.height = canvas.height;

                var texture = new Texture.Texture2D(gl).init_2(framebuffer.width, framebuffer.height, null);
                texture.setTexParameter(gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                texture.setTexParameter(gl.TEXTURE_MIN_FILTER, gl.NEAREST);

                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.glTextureObject(), 0);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);

                // create WebGL programs
                var prog_pathtracing = new Program(gl,
                        shaders("pathtracing_vert"),
                        shaders("pathtracing_frag")
                    ),
                    prog_texture = new Program(gl,
                        shaders("texture_vert"),
                        shaders("texture_frag")
                    );

                prog_texture.use();
                prog_texture.setTexture("texture0", 0, texture);

                prog_pathtracing.use();
                prog_pathtracing.setTexture("texture0", 0, texture);
                prog_pathtracing.setUniform("eyePosition", "vec3", [0, 0, 2.0]); // TODO
                setUniformScene(prog_pathtracing);

                // register all programs in this list for setting the projection matrix later
                this.programs = [prog_pathtracing, prog_texture];
                this.prog_pathtracing = prog_pathtracing;

                // create some objects to be drawn
                this.stage = new Stage(gl);
                this.stageNode = new SceneNode("StageNode", [this.stage], prog_pathtracing);

                // the world node - this is potentially going to be accessed from outside
                this.world  = new SceneNode("world", [this.stageNode], prog_pathtracing);
                
                // initial camera parameters
                var aspectRatio = canvas.width / canvas.height;
                this.camera = {};
                this.camera.viewMatrix = mat4.lookAt([0,0.5,3], [0,0,0], [0,1,0]); // TODO
                this.camera.projectionMatrix = mat4.perspective(45, aspectRatio, 0.01, 100); // TODO
                // or mat4.ortho(-1, 1, -1, 1, -1, 1) // set up the projection matrix: orthographic projection, aspect ratio: 1:1

                // for the UI - this will be accessed directly by HtmlController
                this.drawOptions = {
                    "Stage": true
                };

                this.sampleCounter = 0;
            }; // Scene constructor
            
            // draw the scene, starting at the root node
            Scene.prototype.draw = function(msSinceStart) {
            
                // shortcut
                var gl = this.gl;
                
                // set camera's projection matrix in all programs
                for(var i=0; i<this.programs.length; i++) {
                    var p = this.programs[i];
                    p.use();
                    p.setUniform("projectionMatrix", "mat4", this.camera.projectionMatrix);
                }

                this.prog_pathtracing.use();
                this.prog_pathtracing.setUniform("secondsSinceStart", "float", msSinceStart * 0.001); // vgl. Evan Wallace
                this.prog_pathtracing.setUniform("textureWeight", "float", this.sampleCounter / (this.sampleCounter + 1)); // vgl. Evan Wallace

                // initially set model-view matrix to the camera's view matrix
                var modelView = this.camera.viewMatrix;
                
                // enable depth testing, keep fragments with smaller depth values
                gl.enable(gl.DEPTH_TEST); 
                gl.depthFunc(gl.LESS);  
                                
                // clear color and depth buffers
                gl.clearColor(1.0, 1.0, 1.0, 1.0); 
                gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 

                // start drawing with the root node
                this.world.draw(gl, null, modelView);

                /*
                 gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
                 this.stage.draw(gl, this.prog_pathtracing);
                 gl.bindFramebuffer(gl.FRAMEBUFFER, null);

                 this.stage.draw(gl, this.prog_texture);
                 */

                this.sampleCounter++;
            }; // Scene draw()
            
        return Scene;
    
})); // define module
        

