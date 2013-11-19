/**
 * @author Niels Garve, niels.garve.yahoo.de
 */
define([
    'scene',
    'animation',
    'scene_explorer'
], function(Scene, Animation, SceneExplorer) {

    'use strict';

    var Raymond = function(gl) {
        this.scene = new Scene(gl);

        // TODO create an animation for timing and regular calls of Scene.draw()
        this.animation = new Animation(function(t) {
            this.scene.draw(t);
        }.bind(this)); // do not start yet

        new SceneExplorer(gl.canvas, false, this.scene);
    };

    Raymond.prototype.drawFirstFrame = function() {
        this.scene.draw(0.0);
    };

    Raymond.prototype.start = function() {
        this.scene.sampleCounter = 0;
        this.animation.start();
    };

    Raymond.prototype.stop = function() {
        this.animation.stop();
    };

    Raymond.prototype.resume = function() {
        this.animation.resume();
    };

    return Raymond;
});