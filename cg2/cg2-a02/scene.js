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
    (function ($, glmatrix, Program, shaders, SceneNode, Texture, light, material, Stage) {

        "use strict";

        /**
         * sets the uniform variables defining the scene to be "traced". !!! Attention: lights are scene objects as well
         * and must be added at the beginning of the corresponding arrays!!!
         *
         * @param prog
         * @author Niels Garve, niels.garve.yahoo.de
         * @private
         */
        function setUniformScene(prog) {
            prog.setUniform("La", "vec3", [0.1, 0.1, 0.1]);

            /*
             * spheres
             */
            prog.setUniform("spheres[0].center", "vec3", [9.5, -0.5, -10.5]); // "unten, mittig an der rechten Wand"
            prog.setUniform("spheres[0].radius", "float", 0.499);
            prog.setUniform("sphereMaterials[0].isLight", "bool", true);
            prog.setUniform("sphereMaterials[0].isPerfectMirror", "bool", false);
            prog.setUniform("sphereMaterials[0].isDiffuse", "bool", false);
            prog.setUniform("sphereMaterials[0].Le", "vec3", [0.66, 0.66, 0.66]);
            prog.setUniform("sphereMaterials[0].Kd", "vec3", [1.0, 1.0, 1.0]); // TODO Lichtfarbe?

            prog.setUniform("spheres[1].center", "vec3", [1.0, -0.5, -2.0]); // Kamera-Zentrum
            prog.setUniform("spheres[1].radius", "float", 0.499);
            prog.setUniform("sphereMaterials[1].isLight", "bool", false);
            prog.setUniform("sphereMaterials[1].isPerfectMirror", "bool", false);
            prog.setUniform("sphereMaterials[1].isDiffuse", "bool", true);
            prog.setUniform("sphereMaterials[1].Le", "vec3", [0.0, 0.0, 0.0]);
            prog.setUniform("sphereMaterials[1].Kd", "vec3", [0.4, 0.4, 0.4]);

            prog.setUniform("spheres[2].center", "vec3", [1.0, -0.5, 0.5]);
            prog.setUniform("spheres[2].radius", "float", 0.499);
            prog.setUniform("sphereMaterials[2].isLight", "bool", false);
            prog.setUniform("sphereMaterials[2].isPerfectMirror", "bool", false);
            prog.setUniform("sphereMaterials[2].isDiffuse", "bool", true);
            prog.setUniform("sphereMaterials[2].Le", "vec3", [0.0, 0.0, 0.0]);
            prog.setUniform("sphereMaterials[2].Kd", "vec3", [0.2, 0.2, 0.2]);

            prog.setUniform("spheres[3].center", "vec3", [-3.0, 0.0, -1.0]);
            prog.setUniform("spheres[3].radius", "float", 0.99);
            prog.setUniform("sphereMaterials[3].isLight", "bool", false);
            prog.setUniform("sphereMaterials[3].isPerfectMirror", "bool", true);
            prog.setUniform("sphereMaterials[3].isDiffuse", "bool", false);
            prog.setUniform("sphereMaterials[3].Le", "vec3", [0.0, 0.0, 0.0]);
            prog.setUniform("sphereMaterials[3].Kd", "vec3", [0.0, 0.0, 0.0]);

            /*
             * Cornell Box (14 x 3 x 21)
             */
            prog.setUniform("cornellBox.minCorner", "vec3", [-4.0, -1.0, -20.0]);
            prog.setUniform("cornellBox.maxCorner", "vec3", [10.0, 2.0, 1.0]);

            // left
            prog.setUniform("cornellBoxMaterials[0].isLight", "bool", false);
            prog.setUniform("cornellBoxMaterials[0].isPerfectMirror", "bool", false);
            prog.setUniform("cornellBoxMaterials[0].isDiffuse", "bool", true);
            prog.setUniform("cornellBoxMaterials[0].Le", "vec3", [0.0, 0.0, 0.0]);
            prog.setUniform("cornellBoxMaterials[0].Kd", "vec3", [0.0, 0.0, 0.0]);

            // right
            prog.setUniform("cornellBoxMaterials[1].isLight", "bool", false);
            prog.setUniform("cornellBoxMaterials[1].isPerfectMirror", "bool", false);
            prog.setUniform("cornellBoxMaterials[1].isDiffuse", "bool", true);
            prog.setUniform("cornellBoxMaterials[1].Le", "vec3", [0.0, 0.0, 0.0]);
            prog.setUniform("cornellBoxMaterials[1].Kd", "vec3", [1.0, 0.4, 0.0]); // eine Art Orange

            // bottom
            prog.setUniform("cornellBoxMaterials[2].isLight", "bool", false);
            prog.setUniform("cornellBoxMaterials[2].isPerfectMirror", "bool", false);
            prog.setUniform("cornellBoxMaterials[2].isDiffuse", "bool", true);
            prog.setUniform("cornellBoxMaterials[2].Le", "vec3", [0.0, 0.0, 0.0]);
            prog.setUniform("cornellBoxMaterials[2].Kd", "vec3", [0.2, 0.2, 0.2]);

            // top
            prog.setUniform("cornellBoxMaterials[3].isLight", "bool", false);
            prog.setUniform("cornellBoxMaterials[3].isPerfectMirror", "bool", false);
            prog.setUniform("cornellBoxMaterials[3].isDiffuse", "bool", true);
            prog.setUniform("cornellBoxMaterials[3].Le", "vec3", [0.0, 0.0, 0.0]);
            prog.setUniform("cornellBoxMaterials[3].Kd", "vec3", [0.8, 0.8, 0.8]);

            // far
            prog.setUniform("cornellBoxMaterials[4].isLight", "bool", true);
            prog.setUniform("cornellBoxMaterials[4].isPerfectMirror", "bool", false);
            prog.setUniform("cornellBoxMaterials[4].isDiffuse", "bool", false);
            prog.setUniform("cornellBoxMaterials[4].Le", "vec3", [0.66, 0.66, 0.66]);
            prog.setUniform("cornellBoxMaterials[4].Kd", "vec3", [1.0, 1.0, 1.0]); // TODO Lichtfarbe?

            // near
            prog.setUniform("cornellBoxMaterials[5].isLight", "bool", true);
            prog.setUniform("cornellBoxMaterials[5].isPerfectMirror", "bool", false);
            prog.setUniform("cornellBoxMaterials[5].isDiffuse", "bool", false);
            prog.setUniform("cornellBoxMaterials[5].Le", "vec3", [0.66, 0.66, 0.66]);
            prog.setUniform("cornellBoxMaterials[5].Kd", "vec3", [1.0, 1.0, 1.0]); // TODO Lichtfarbe?
        }

        /**
         * a simple scene is an object with a few objects and a draw() method
         *
         * @param gl
         * @author Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
         * @author Niels Garve, niels.garve.yahoo.de
         * @constructor
         */
        var Scene = function (gl) {
            // store the WebGL rendering context
            this.gl = gl;

            var canvas = gl.canvas;

            // 1. framebuffer
            this.framebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
            this.framebuffer.width = canvas.width;
            this.framebuffer.height = canvas.height;

            // 2. texture
            var texture = new Texture.Texture2D(gl).init_2(this.framebuffer.width, this.framebuffer.height, null);
            texture.setTexParameter(gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            texture.setTexParameter(gl.TEXTURE_MIN_FILTER, gl.NEAREST);

            // 3. framebufferTexture
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.glTextureObject(), 0);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            // initial camera parameters
            this.camera = {};
            this.camera.viewMatrix = mat4.lookAt([0, 0, 0], [1.0, -0.5, -2.0], [0, 1, 0]); // eye, center, up
            // set up the projection matrix: orthographic projection, aspect ratio: 1:1
            this.camera.projectionMatrix = mat4.ortho(-1, 1, -1, 1, 0.01, 100);

            // create WebGL programs
            this.prog_pathtracing = new Program(gl,
                shaders("pathtracing_vert"),
                shaders("pathtracing_frag")
            );

            this.prog_texture = new Program(gl,
                shaders("texture_vert"),
                shaders("texture_frag")
            );

            this.prog_texture.use();
            this.prog_texture.setTexture("texture0", 0, texture);
            this.prog_texture.setUniform("projectionMatrix", "mat4", this.camera.projectionMatrix);

            this.prog_pathtracing.use();
            this.prog_pathtracing.setTexture("texture0", 0, texture);
            this.prog_pathtracing.setUniform("eyePosition", "vec3", [0, 0, 0]); // eye
            setUniformScene(this.prog_pathtracing);

            // create some objects to be drawn
            this.stage = new Stage(gl);
            this.stageNode = new SceneNode("StageNode", [this.stage], null); // program to null, it changes while drawing

            // the world node - this is potentially going to be accessed from outside
            this.world = new SceneNode("world", [this.stageNode], null); // program to null, it changes while drawing

            // for the UI - this will be accessed directly by HtmlController
            this.drawOptions = {
                "Stage": true
            };

            this.sampleCounter = 0;
        }; // Scene constructor

        /**
         * draw the scene, starting at the root node
         *
         * @param msSinceStart
         * @author Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
         * @author Niels Garve, niels.garve.yahoo.de
         */
        Scene.prototype.draw = function (msSinceStart) {

            // shortcut
            var gl = this.gl;

            this.prog_pathtracing.use();
            this.prog_pathtracing.setUniform("projectionMatrix", "mat4", this.camera.projectionMatrix);
            this.prog_pathtracing.setUniform("secondsSinceStart", "float", msSinceStart * 0.001); // vgl. Evan Wallace
            this.prog_pathtracing.setUniform("textureWeight", "float", this.sampleCounter / (this.sampleCounter + 1)); // vgl. Evan Wallace

            // initially set model-view matrix to the camera's view matrix
            var modelView = this.camera.viewMatrix;

            // enable depth testing, keep fragments with smaller depth values
            gl.enable(gl.DEPTH_TEST);
            gl.depthFunc(gl.LESS);

            // clear color and depth buffers
            gl.clearColor(1.0, 1.0, 1.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // start drawing with the root node
            gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
            this.world.draw(gl, this.prog_pathtracing, modelView);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            this.world.draw(gl, this.prog_texture, modelView);

            this.sampleCounter++;
        }; // Scene draw()

        return Scene;
    }) // self executing function
); // define module
        

