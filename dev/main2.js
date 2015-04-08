requirejs.config({
    paths: {
        // require.js plugins
        hgn: '../bower_components/requirejs-hogan-plugin/hgn',
        text: '../bower_components/requirejs-hogan-plugin/text',
        hogan: '../bower_components/requirejs-hogan-plugin/hogan'
    },

    shim: {},

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
    'hgn!../shaders/texture.frag'
], function( pathtracingVert, pathtracingFrag, textureVert, textureFrag ) {
    var scene = new THREE.Scene(),
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 1000),
        renderer = new THREE.WebGLRenderer(),
        geometry,
        material,
        plane;

    renderer.setSize(256, 256);
    document.body.appendChild(renderer.domElement);

    geometry = new THREE.PlaneGeometry(2, 2);
    material = new THREE.ShaderMaterial({
        uniforms: {
            eyePosition: { type: 'v3', value: camera.position },

            sphere1Center: { type: 'v3', value: new THREE.Vector3(0, 0, -20) },
            sphere1Radius: { type: 'f', value: 10 }
        },
        vertexShader: pathtracingVert(),
        fragmentShader: pathtracingFrag()
    });
    plane = new THREE.Mesh(geometry, material);

    scene.add(plane);
    camera.position.z = 2;

    function render() {
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }

    render();
});