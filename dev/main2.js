requirejs.config({
    paths: {
        // require.js plugins
        hgn: '../bower_components/requirejs-hogan-plugin/hgn',
        text: '../bower_components/requirejs-hogan-plugin/text',
        hogan: '../bower_components/requirejs-hogan-plugin/hogan',

        threejs: '../bower_components/three.js/three',
        controls: 'vendor/TrackballControls'
    },

    shim: {
        threejs: {
            exports: 'THREE'
        },
        controls: {
            deps: [ 'threejs' ],
            exports: 'THREE.TrackballControls'
        }
    },

    // configure hgn! plugin
    hgn: {
        // load "*.mustache" files, set to empty string if you
        // want to specify the template extension for each individual file
        // the default value is ".mustache"
        templateExtension: '',

        // if you need to set custom options it can be done through the
        // "compilationOptions" setting, check hogan documentation:
        // https://github.com/twitter/hogan.js#compilation-options
        compilationOptions: {
            // delimiters : '<% %>',
            // sectionTags: [{o: '_foo', c: 'foo'}],
            // disableLambda : true
        }
    }
});

define([
    'hgn!../shaders/pathtracing.vert',
    'hgn!../shaders/pathtracing.frag',
    'hgn!../shaders/texture.vert',
    'hgn!../shaders/texture.frag',
    'controls'
], function( pathtracingVert, pathtracingFrag, textureVert, textureFrag ) {
    var scene = new THREE.Scene(),
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 1000),
        controls = new THREE.TrackballControls(camera),
        renderer = new THREE.WebGLRenderer(),
        geometry,
        material,
        plane,
        time = new Date().getTime(),
        now;

    controls.target = new THREE.Vector3(0, 0, -2);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [ 65, 83, 68 ];
    controls.addEventListener('change', render);

    renderer.setSize(256, 256);
    document.body.appendChild(renderer.domElement);

    geometry = new THREE.PlaneGeometry(2, 2);
    material = new THREE.ShaderMaterial({
        uniforms: {
            eyePosition: { type: 'v3', value: new THREE.Vector3(0, 0, 0) },
            La: { type: 'v3', value: new THREE.Vector3(0.133, 0.133, 0.133) },

            // light
            'spheres[0].center': { type: 'v3', value: new THREE.Vector3(0, -20, -20) },
            'spheres[0].radius': { type: 'f', value: 10 },
            'sphereMaterials[0].isPerfectMirror': { type: 'i', value: 0 },
            'sphereMaterials[0].isDiffuse': { type: 'i', value: 0 },
            'sphereMaterials[0].Le': { type: 'v3', value: new THREE.Vector3(1, 1, 1) },
            'sphereMaterials[0].Kd': { type: 'v3', value: new THREE.Vector3(1, 1, 1) },

            // object
            'spheres[1].center': { type: 'v3', value: new THREE.Vector3(0, 0, -20) },
            'spheres[1].radius': { type: 'f', value: 5 },
            'sphereMaterials[1].isPerfectMirror': { type: 'i', value: 0 },
            'sphereMaterials[1].isDiffuse': { type: 'i', value: 1 },
            'sphereMaterials[1].Le': { type: 'v3', value: new THREE.Vector3(0, 0, 0) },
            'sphereMaterials[1].Kd': { type: 'v3', value: new THREE.Vector3(1, 0, 0) },

            secondsSinceStart: { type: 'f', value: 0 }
        },
        vertexShader: pathtracingVert(),
        fragmentShader: pathtracingFrag({
            hasSpheres: true,
            numberOfSpheres: 2,
            numberOfSphericalLights: 1,
            hasCornellBox: false,
            hasMesh: false,
            meshSamplerWidth: 256
        })
    });
    plane = new THREE.Mesh(geometry, material);
    plane.position.z = -2;

    scene.add(plane);

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
    }

    function render() {
        now = new Date().getTime();

        material.uniforms.secondsSinceStart.value = (now - time) * 0.001;
        renderer.render(scene, camera);
        stats.update();
    }

    animate();
    render();
});