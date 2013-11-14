/**
 * @author Niels Garve, niels.garve.yahoo.de
 */
define([
    'scene',
    'animation',
    'scene_explorer',
    'html_controller'
], function(Scene, Animation, SceneExplorer, HtmlController) {

    'use strict';

    var PathtracingRT = function(gl) {
        this.scene = new Scene(gl);

        // TODO create an animation for timing and regular calls of Scene.draw()
        var animation = new Animation(function(t) {
            this.scene.draw(t);
        }.bind(this)); // do not start yet

        new SceneExplorer(gl.canvas, false, this.scene);
        // create HTML controller that handles all the interaction of
        // HTML elements with the scene and the animation
        new HtmlController(this.scene, animation);
    };

    PathtracingRT.prototype.drawFirstFrame = function() {
        this.scene.draw(0.0);
    };

    return PathtracingRT;
});