'use strict';

// modules
global.THREE = require('./vendor/three.js');
var Handlebars = require('handlebars');
var fs = require('fs');
var pathtracingVert = Handlebars.compile(fs.readFileSync(__dirname + '/shaders/pathtracing.vert', 'utf8'));
var pathtracingFrag = Handlebars.compile(fs.readFileSync(__dirname + '/shaders/pathtracing.frag', 'utf8'));
var textureVert = Handlebars.compile(fs.readFileSync(__dirname + '/shaders/texture.vert', 'utf8'));
var textureFrag = Handlebars.compile(fs.readFileSync(__dirname + '/shaders/texture.frag', 'utf8'));

// engine code
var scene = new THREE.Scene();
var scene2 = new THREE.Scene();
var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 1000);

var swappy = [
    new THREE.WebGLRenderTarget(256, 256, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBFormat
    }),
    new THREE.WebGLRenderTarget(256, 256, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBFormat
    })
];

var geometry = new THREE.PlaneGeometry(2, 2);
var material = new THREE.ShaderMaterial({
    uniforms: {
        La: { type: 'v3', value: new THREE.Vector3(0.133, 0.133, 0.133) },

        // light
        'spheres[0].center': { type: 'v3', value: new THREE.Vector3(0, 12.5, -14.5) },
        'spheres[0].radius': { type: 'f', value: 10 },
        'sphereMaterials[0].isPerfectMirror': { type: 'i', value: 0 },
        'sphereMaterials[0].isDiffuse': { type: 'i', value: 0 },
        'sphereMaterials[0].Le': { type: 'v3', value: new THREE.Vector3(1, 1, 1) },
        'sphereMaterials[0].Kd': { type: 'v3', value: new THREE.Vector3(1, 1, 1) },

        // object
        'spheres[1].center': { type: 'v3', value: new THREE.Vector3(0, -10, -20) },
        'spheres[1].radius': { type: 'f', value: 5 },
        'sphereMaterials[1].isPerfectMirror': { type: 'i', value: 1 },
        'sphereMaterials[1].isDiffuse': { type: 'i', value: 0 },
        'sphereMaterials[1].Le': { type: 'v3', value: new THREE.Vector3(0, 0, 0) },
        'sphereMaterials[1].Kd': { type: 'v3', value: new THREE.Vector3(0, 0, 0) },

        // left
        'cornellBox.planes[0].n': { type: 'v3', value: new THREE.Vector3(1, 0, 0) },
        'cornellBox.planes[0].p': { type: 'v3', value: new THREE.Vector3(-15, 0, 0) },
        'cornellBox.materials[0].isPerfectMirror': { type: 'i', value: 0 },
        'cornellBox.materials[0].isDiffuse': { type: 'i', value: 1 },
        'cornellBox.materials[0].Le': { type: 'v3', value: new THREE.Vector3(0.0, 0.0, 0.0) },
        'cornellBox.materials[0].Kd': { type: 'v3', value: new THREE.Vector3(0.4, 0.0, 0.4) },

        // right
        'cornellBox.planes[1].n': { type: 'v3', value: new THREE.Vector3(-1, 0, 0) },
        'cornellBox.planes[1].p': { type: 'v3', value: new THREE.Vector3(15, 0, 0) },
        'cornellBox.materials[1].isPerfectMirror': { type: 'i', value: 0 },
        'cornellBox.materials[1].isDiffuse': { type: 'i', value: 1 },
        'cornellBox.materials[1].Le': { type: 'v3', value: new THREE.Vector3(0.0, 0.0, 0.0) },
        'cornellBox.materials[1].Kd': { type: 'v3', value: new THREE.Vector3(0.0, 0.4, 0.0) },

        // top
        'cornellBox.planes[2].n': { type: 'v3', value: new THREE.Vector3(0, -1, 0) },
        'cornellBox.planes[2].p': { type: 'v3', value: new THREE.Vector3(0, 5, 0) },
        'cornellBox.materials[2].isPerfectMirror': { type: 'i', value: 0 },
        'cornellBox.materials[2].isDiffuse': { type: 'i', value: 1 },
        'cornellBox.materials[2].Le': { type: 'v3', value: new THREE.Vector3(0.0, 0.0, 0.0) },
        'cornellBox.materials[2].Kd': { type: 'v3', value: new THREE.Vector3(0.8, 0.8, 0.8) },

        // bottom
        'cornellBox.planes[3].n': { type: 'v3', value: new THREE.Vector3(0, 1, 0) },
        'cornellBox.planes[3].p': { type: 'v3', value: new THREE.Vector3(0, -15, 0) },
        'cornellBox.materials[3].isPerfectMirror': { type: 'i', value: 0 },
        'cornellBox.materials[3].isDiffuse': { type: 'i', value: 1 },
        'cornellBox.materials[3].Le': { type: 'v3', value: new THREE.Vector3(0.0, 0.0, 0.0) },
        'cornellBox.materials[3].Kd': { type: 'v3', value: new THREE.Vector3(0.2, 0.2, 0.2) },

        // near
        'cornellBox.planes[4].n': { type: 'v3', value: new THREE.Vector3(0, 0, -1) },
        'cornellBox.planes[4].p': { type: 'v3', value: new THREE.Vector3(0, 0, 1) },
        'cornellBox.materials[4].isPerfectMirror': { type: 'i', value: 0 },
        'cornellBox.materials[4].isDiffuse': { type: 'i', value: 1 },
        'cornellBox.materials[4].Le': { type: 'v3', value: new THREE.Vector3(0.0, 0.0, 0.0) },
        'cornellBox.materials[4].Kd': { type: 'v3', value: new THREE.Vector3(0.8, 0.8, 0.8) },

        // far
        'cornellBox.planes[5].n': { type: 'v3', value: new THREE.Vector3(0, 0, 1) },
        'cornellBox.planes[5].p': { type: 'v3', value: new THREE.Vector3(0, 0, -29) },
        'cornellBox.materials[5].isPerfectMirror': { type: 'i', value: 0 },
        'cornellBox.materials[5].isDiffuse': { type: 'i', value: 1 },
        'cornellBox.materials[5].Le': { type: 'v3', value: new THREE.Vector3(0.0, 0.0, 0.0) },
        'cornellBox.materials[5].Kd': { type: 'v3', value: new THREE.Vector3(0.8, 0.8, 0.8) },

        secondsSinceStart: { type: 'f', value: 0 },
        texture0: { type: 't', value: swappy[ 0 ] },
        textureWeight: { type: 'f', value: 0 }
    },
    vertexShader: pathtracingVert(),
    fragmentShader: pathtracingFrag({
        hasSpheres: true,
        numberOfSpheres: 2,
        numberOfSphericalLights: 1,
        hasCornellBox: true,
        hasMesh: false,
        meshSamplerWidth: 256
    })
});
var material2 = new THREE.ShaderMaterial({
    uniforms: {
        texture0: { type: 't', value: swappy[ 0 ] }
    },
    vertexShader: textureVert(),
    fragmentShader: textureFrag()
});

var plane = new THREE.Mesh(geometry, material);
var plane2 = new THREE.Mesh(geometry, material2);
plane.position.z = plane2.position.z = -2;

scene.add(plane);
scene2.add(plane2);

var time = new Date().getTime();
var now;
var sampleCounter = 0;

function render() {
    if (this.controls) {
        this.controls.update();
    }

    now = new Date().getTime();
    material.uniforms.secondsSinceStart.value = (now - time) * 0.001;
    material.uniforms.textureWeight.value = sampleCounter / (sampleCounter + 1);
    material.uniforms.texture0.value = swappy[ sampleCounter % 2 ];
    material2.uniforms.texture0.value = swappy[ sampleCounter % 2 ];

    this.renderer.clear();
    this.renderer.render(scene, camera, swappy[ (sampleCounter + 1) % 2 ], false);
    this.renderer.render(scene2, camera);

    sampleCounter++;
}

/**
 * @todo
 * @param options
 * @constructor
 */
var Engine = function( options ) {
    this.renderer = new THREE.WebGLRenderer(options);
    this.renderer.setSize(256, 256);
    this.renderer.autoClear = false;
};

/**
 * @todo
 * @type {render}
 */
Engine.prototype.render = render;

/**
 * @todo
 * @param controls
 */
Engine.prototype.setControls = function( controls ) {
    this.controls = controls;
};

/**
 * @todo
 * @returns {THREE.OrthographicCamera}
 */
Engine.prototype.getCamera = function() {
    return camera;
};

/**
 * @todo
 */
Engine.prototype.resetSampleCounter = function() {
    sampleCounter = 0;
};

module.exports = Engine;
