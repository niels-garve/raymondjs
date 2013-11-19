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
 */

/**
 * @author Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 * @author Niels Garve, niels.garve.yahoo.de
 */
define([
    'gl-matrix',
    'program',
    'scene_node',
    'texture',
    'light',
    'material',
    'models/Stage',
    'Config',
    'hgn!../shaders/pathtracing.vert',
    'hgn!../shaders/pathtracing.frag',
    'hgn!../shaders/texture.vert',
    'hgn!../shaders/texture.frag',
    'webgl-obj-loader'
], function(glmatrix, Program, SceneNode, Texture, light, material, Stage, Config, pathtracingVert, pathtracingFrag, textureVert, textureFrag) {

    'use strict';

    /**
     * Initialisiert die zu prog gehörenden uniform Variablen, die die Szene definieren. !!!Achtung: Lichter sind
     * auch Objekte. Sie werden dem Shader immer zu Beginn(!) der entsprechenden Reihung übergeben!!!
     *
     * @param prog
     * @author Niels Garve, niels.garve.yahoo.de
     * @private
     */
    function setUniformScene(prog) {
        prog.setUniform('La', 'vec3', [0.1, 0.1, 0.1]);

        /*
         * spheres
         */
        prog.setUniform('spheres[0].center', 'vec3', [-20, 60, -30]);
        prog.setUniform('spheres[0].radius', 'float', 7.5);
        prog.setUniform('sphereMaterials[0].isPerfectMirror', 'bool', false);
        prog.setUniform('sphereMaterials[0].isDiffuse', 'bool', false);
        prog.setUniform('sphereMaterials[0].Le', 'vec3', [1, 1, 1]);
        prog.setUniform('sphereMaterials[0].Kd', 'vec3', [1, 1, 1]);

        prog.setUniform('spheres[1].center', 'vec3', [0, 85, 85]);
        prog.setUniform('spheres[1].radius', 'float', 35);
        prog.setUniform('sphereMaterials[1].isPerfectMirror', 'bool', false);
        prog.setUniform('sphereMaterials[1].isDiffuse', 'bool', false);
        prog.setUniform('sphereMaterials[1].Le', 'vec3', [0.66, 0.66, 0.66]);
        prog.setUniform('sphereMaterials[1].Kd', 'vec3', [1, 1, 1]);

        /*
         * the mesh, matrial only
         */
        prog.setUniform('meshMaterial.isPerfectMirror', 'bool', false);
        prog.setUniform('meshMaterial.isDiffuse', 'bool', true);
        prog.setUniform('meshMaterial.Le', 'vec3', [0.0, 0.0, 0.0]);
        prog.setUniform('meshMaterial.Kd', 'vec3', [1.0, 1.0, 1.0]);

        /*
         * Cornell Box (128 x 128 x 48)
         */
        /*
         var minCorner = [-64, -1, -16], // [x, y, z]
         maxCorner = [64, 127, 32]; // [x, y, z]

         prog.setUniform('cornellBox.minCorner', 'vec3', minCorner);
         prog.setUniform('cornellBox.maxCorner', 'vec3', maxCorner);

         // left
         prog.setUniform('cornellBox.planes[0].n', 'vec3', [1, 0, 0]);
         prog.setUniform('cornellBox.planes[0].d', 'float', minCorner[0]); // x
         prog.setUniform('cornellBox.materials[0].isPerfectMirror', 'bool', false);
         prog.setUniform('cornellBox.materials[0].isDiffuse', 'bool', true);
         prog.setUniform('cornellBox.materials[0].Le', 'vec3', [0.0, 0.0, 0.0]);
         prog.setUniform('cornellBox.materials[0].Kd', 'vec3', [0.4, 0.0, 0.0]);

         // right
         prog.setUniform('cornellBox.planes[1].n', 'vec3', [-1, 0, 0]);
         prog.setUniform('cornellBox.planes[1].d', 'float', -maxCorner[0]); // x
         prog.setUniform('cornellBox.materials[1].isPerfectMirror', 'bool', false);
         prog.setUniform('cornellBox.materials[1].isDiffuse', 'bool', true);
         prog.setUniform('cornellBox.materials[1].Le', 'vec3', [0.0, 0.0, 0.0]);
         prog.setUniform('cornellBox.materials[1].Kd', 'vec3', [0.0, 0.4, 0.0]);

         // near
         prog.setUniform('cornellBox.planes[2].n', 'vec3', [0, 1, 0]);
         prog.setUniform('cornellBox.planes[2].d', 'float', minCorner[1]); // y
         prog.setUniform('cornellBox.materials[2].isPerfectMirror', 'bool', false);
         prog.setUniform('cornellBox.materials[2].isDiffuse', 'bool', true);
         prog.setUniform('cornellBox.materials[2].Le', 'vec3', [0.0, 0.0, 0.0]);
         prog.setUniform('cornellBox.materials[2].Kd', 'vec3', [0.8, 0.8, 0.8]);

         // far
         prog.setUniform('cornellBox.planes[3].n', 'vec3', [0, -1, 0]);
         prog.setUniform('cornellBox.planes[3].d', 'float', -maxCorner[1]); // y
         prog.setUniform('cornellBox.materials[3].isPerfectMirror', 'bool', false);
         prog.setUniform('cornellBox.materials[3].isDiffuse', 'bool', true);
         prog.setUniform('cornellBox.materials[3].Le', 'vec3', [0.0, 0.0, 0.0]);
         prog.setUniform('cornellBox.materials[3].Kd', 'vec3', [0.8, 0.8, 0.8]);

         // bottom
         prog.setUniform('cornellBox.planes[4].n', 'vec3', [0, 0, 1]);
         prog.setUniform('cornellBox.planes[4].d', 'float', minCorner[2]); // z
         prog.setUniform('cornellBox.materials[4].isPerfectMirror', 'bool', false);
         prog.setUniform('cornellBox.materials[4].isDiffuse', 'bool', true);
         prog.setUniform('cornellBox.materials[4].Le', 'vec3', [0.0, 0.0, 0.0]);
         prog.setUniform('cornellBox.materials[4].Kd', 'vec3', [0.2, 0.2, 0.2]);

         // top
         prog.setUniform('cornellBox.planes[5].n', 'vec3', [0, 0, -1]);
         prog.setUniform('cornellBox.planes[5].d', 'float', -maxCorner[2]); // z
         prog.setUniform('cornellBox.materials[5].isPerfectMirror', 'bool', false);
         prog.setUniform('cornellBox.materials[5].isDiffuse', 'bool', false);
         prog.setUniform('cornellBox.materials[5].Le', 'vec3', [0.4, 0.4, 0.4]);
         prog.setUniform('cornellBox.materials[5].Kd', 'vec3', [1.0, 1.0, 1.0]); // Lichtfarbe
         */
    }

    /**
     * Füllt die Textur folgendermaßen:
     *  ----------------------------------------------------s
     * | Face_1  (a, b, c) ... Face_samplerWidth  (a, b, c)
     * | Vertex_1(x, y, z) ... Vertex_samplerWidth(x, y, z)
     * | Normal_1(x, y, z) ... Normal_samplerWidth(x, y, z)
     * t
     *
     * Das spart teure Adressierung im Shader: jedem Array gehört eine Zeile in der Textur. Die Indizes stimmen!
     * Außerdem lässt die aktuelle Implementierung nur maximal 256 Vertizes zu, da sonst das eine Byte pro Index
     * "gesprengt" wird. Eine Zeile sollte also erstmal reichen.
     *
     * @param mesh
     * @param samplerWidth
     * @param samplerHeight
     * @returns {Uint8Array}
     * @author Niels Garve, niels.garve.yahoo.de
     * @private
     */
    function meshToUint8Array(mesh, samplerWidth, samplerHeight) {
        if(!mesh.indices || !mesh.vertices || !mesh.vertexNormals) {
            throw new Error('bad parameter: mesh');
        }

        if(mesh.indices.length > 3 * samplerWidth ||
            mesh.vertices.length > 3 * samplerWidth ||
            mesh.vertexNormals.length > 3 * samplerWidth ||
            samplerHeight < 3) {
            throw new Error("mesh doesn't fit the sampler");
        }

        var res = new Uint8Array(samplerWidth * samplerHeight * 3),
            i, j, k;

        for (i = 0; i < mesh.indices.length; i++) {
            res[i] = mesh.indices[i];
        }

        for (j = 0; j < mesh.vertices.length; j++) {
            res[3 * samplerWidth + j] = mesh.vertices[j];
        }

        for (k = 0; k < mesh.vertexNormals.length; k++) {
            res[6 * samplerWidth + k] = mesh.vertexNormals[k] * 127; // Rundungsfehler verringern
        }

        return res;
    }

    /**
     * a simple scene is an object with a few objects and a draw() method
     *
     * @param gl
     * @author Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
     * @author Niels Garve, niels.garve.yahoo.de
     * @constructor
     */
    var Scene = function(gl) {
        // store the WebGL rendering context
        this.gl = gl;

        // vars
        var config = new Config(),
            MESH_SAMPLER_WIDTH = config.get('MESH_SAMPLER_WIDTH'),
            MESH_SAMPLER_HEIGHT = config.get('MESH_SAMPLER_HEIGHT'),
            canvas = gl.canvas,
            mesh = new obj_loader.Mesh(document.getElementById('mesh').innerHTML),
            meshData = meshToUint8Array(mesh, MESH_SAMPLER_WIDTH, MESH_SAMPLER_HEIGHT); // zum Laden in eine Textur

        // 1. initialisiere framebuffer
        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        this.framebuffer.width = canvas.width;
        this.framebuffer.height = canvas.height;

        // 2. initialisiere textures
        var swapTexture = new Texture.Texture2D(gl).init_2(this.framebuffer.width, this.framebuffer.height, null),
            meshTexture = new Texture.Texture2D(gl).init_2(MESH_SAMPLER_WIDTH, MESH_SAMPLER_HEIGHT, meshData);

        swapTexture.setTexParameter(gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        swapTexture.setTexParameter(gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        meshTexture.setTexParameter(gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        meshTexture.setTexParameter(gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        // 3. initialisiere evtl. framebufferTexture
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, swapTexture.glTextureObject(), 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // 4. initialisiere camera
        this.camera = {};
        this.camera.viewMatrix = mat4.lookAt([0, 0, 0], [-0.2, 1, -0.6], [0, 0, 1]); // eye, center, up
        // set up the projection matrix: orthographic projection, aspect ratio: 1:1
        this.camera.projectionMatrix = mat4.ortho(-1, 1, -1, 1, 0.01, 100);

        // 5. initialisiere WebGL programs
        this.prog_pathtracing = new Program(gl,
            pathtracingVert({}),
            pathtracingFrag({
                hasSpheres: true,
                numberOfSpheres: 2,
                numberOfSphericalLights: 2,
                hasCornellBox: false,
                hasMesh: true,
                meshSamplerWidth: config.get('MESH_SAMPLER_WIDTH')
            })
        );

        this.prog_texture = new Program(gl,
            textureVert({}),
            textureFrag({})
        );

        this.prog_texture.use();
        this.prog_texture.setUniform('projectionMatrix', 'mat4', this.camera.projectionMatrix);
        this.prog_texture.setTexture('texture0', 0, swapTexture);

        this.prog_pathtracing.use();
        this.prog_pathtracing.setUniform('projectionMatrix', 'mat4', this.camera.projectionMatrix);
        this.prog_pathtracing.setTexture('texture0', 0, swapTexture);
        this.prog_pathtracing.setTexture('mesh.data', 1, meshTexture);
        this.prog_pathtracing.setUniform('mesh.onePixel', 'vec2', [1 / MESH_SAMPLER_WIDTH, 1 / MESH_SAMPLER_HEIGHT]);
        this.prog_pathtracing.setUniform('eyePosition', 'vec3', [0, 0, 0]); // eye
        setUniformScene(this.prog_pathtracing);

        // 6. create some objects to be drawn
        this.stage = new Stage(gl);
        this.stageNode = new SceneNode('StageNode', [this.stage], null); // program to null, it changes while drawing
        // the world node - this is potentially going to be accessed from outside
        this.world = new SceneNode('world', [this.stageNode], null);

        this.sampleCounter = 0;
    }; // Scene constructor

    /**
     * draw the scene, starting at the root node
     *
     * @param msSinceStart
     * @author Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
     * @author Niels Garve, niels.garve.yahoo.de
     */
    Scene.prototype.draw = function(msSinceStart) {
        // shortcut
        var gl = this.gl;

        this.prog_pathtracing.use();
        this.prog_pathtracing.setUniform('secondsSinceStart', 'float', msSinceStart * 0.001); // vgl. Evan Wallace
        this.prog_pathtracing.setUniform('textureWeight', 'float', this.sampleCounter / (this.sampleCounter + 1)); // vgl. Evan Wallace

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
}); // define module
        

