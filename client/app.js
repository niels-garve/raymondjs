(function( Raymond, undefined ) {
    document.addEventListener('DOMContentLoaded', function() {

        // engine
        try {
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
            controls.keys = [65, 83, 68];
            controls.addEventListener('change', function() {
                engine.resetSampleCounter();
            });

            engine.setControls(controls);
            engine.setRenderCallback(function() {
                controls.update();
            });

            var element = document.getElementById('canvas');

            element.appendChild(engine.renderer.domElement);

            function animate() {
                requestAnimationFrame(animate);
                engine.render();
            }

            animate();
        } catch (e) {
            // @todo JavaScript breaks in Chrome ==> check! Keeping JS alive for now...
            console.log(e);
        }

        // dismiss alert
        var alertElements = document.querySelectorAll('.alert-dismissable');
        var alertElementsLength = alertElements.length;

        for (var i = 0; i < alertElementsLength; i++) {
            var alertElement = alertElements[i];
            var closeElement = alertElement.querySelector('.close');

            if (closeElement) {
                closeElement.addEventListener('click', function close() {
                    this.remove();
                }.bind(alertElement));
            }
        }
    });
})(window.Raymond);
