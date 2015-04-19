(function( Raymond ) {

    var engine = new Raymond();

    var controls = new THREE.TrackballControls(engine.getCamera());
    controls.target = new THREE.Vector3(0, 0, -2);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [ 65, 83, 68 ];
    controls.addEventListener('change', function() {
        engine.resetSampleCounter();
    });

    engine.setControls(controls);

    document.body.appendChild(engine.renderer.domElement);

    function animate() {
        requestAnimationFrame(animate);
        engine.render();
    }

    animate();
})(window.Raymond);
