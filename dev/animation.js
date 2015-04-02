/*
 *
 * WebGL Core Teaching Framework
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Animation
 *
 * An Animation object allows to start/stop/continue an animation loop
 * in which a user-provided callback function is called.
 *
 */

/* requireJS module definition */
define([
], function() {

    "use strict";

    /*
     * The code below this comment is:
     * Copyright 2010, Google Inc.
     * All rights reserved.
     *
     * Redistribution and use in source and binary forms, with or without
     * modification, are permitted provided that the following conditions are
     * met:
     *
     *     * Redistributions of source code must retain the above copyright
     * notice, this list of conditions and the following disclaimer.
     *     * Redistributions in binary form must reproduce the above
     * copyright notice, this list of conditions and the following disclaimer
     * in the documentation and/or other materials provided with the
     * distribution.
     *     * Neither the name of Google Inc. nor the names of its
     * contributors may be used to endorse or promote products derived from
     * this software without specific prior written permission.
     *
     * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
     * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
     * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
     * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
     * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
     * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
     * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
     * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
     * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
     * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
     * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
     */

    /**
     * Provides requestAnimationFrame in a cross browser way.
     * (C)opyright 2010, Google Inc.
     */
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
                return window.setTimeout(callback, 1000 / 60);
            };
    })();

    /**
     * Provides cancelRequestAnimationFrame in a cross browser way.
     * (C)opyright 2010, Google Inc.
     */
    window.cancelRequestAnimFrame = (function() {
        return window.cancelCancelRequestAnimationFrame ||
            window.webkitCancelRequestAnimationFrame ||
            window.mozCancelRequestAnimationFrame ||
            window.oCancelRequestAnimationFrame ||
            window.msCancelRequestAnimationFrame ||
            window.clearTimeout;
    })();

    /*

       Animation object allows to start/stop/continue an animation loop
       in which a user-provided callback function is called.
       
       The user-provided callback function can accept up to two parameters:
       - the total time elapsed since start() of the animation 
       - the "delta" time elapsed since the last call to the update function
       
       Arguments to the constructor:
       - updateFunction: function(totalElapsedTime, timeSinceLastCall)
       
       Methods:
       - start()    starts the animation and resets the timer
       - stop()     stops the animation
       - resume() continues the animation after a stop() event. 
       
    */
       
    var Animation = function(updateFunction, startNow) {

        // store callback function
        this.updateFunction = updateFunction;
        
        // time when the animation was played the first time
        this.firstTime = 0;
        
        // the last known time the animation was called
        this.lastTime = 0;
        
        // the time the animation was paused
        this.waitingTime = 0;
        
        // flag to signal whether the animation is started or stopped
        if(startNow) {
            this.start();
        } else {
            this.stop();
        };

    }; 

    // query animation status
    Animation.prototype.isRunning = function() {
        return !this.isStopped;
    };
    
    // start a new animation loop with time = 0
    Animation.prototype.start = function() {
        this.firstTime   = 0;
        this.lastTime    = 0;
        this.waitingTime = 0;
        this.isStopped   = false;
        this.update();
    };
    
    // pause / stop the animation
    Animation.prototype.stop = function() {
        this.isStopped = true;
    };
    
    // continue after a pause/stop:
    // - the total elapsed time is calculated relative to the 
    //   original start time
    // - the time "delta" will start with 0 again
    Animation.prototype.resume = function() {
        if(this.lastTime == 0) {
            // first time? then init firstTime and lastTime
            this.firstTime = new Date().getTime();
            this.lastTime  = new Date().getTime();
        } else {
            // continuation? then just update the waiting time
            var delta = new Date().getTime() - this.lastTime;
            this.waitingTime += delta;
            this.lastTime    += delta; 
        };
        this.isStopped = false;
        this.update();
    };
    
    // toggle animation on/off
    Animation.prototype.toggleAnimation = function() {
        if(this.isRunning()) 
            this.stop();
        else 
            this.resume();
    };

    // update() is called regularly; it calculates the elapsed time
    //   and then calls the update function provided by the user
    Animation.prototype.update = function() {
    
        // only do something if animation is not stopped:
        if(!this.isRunning()) {
            return;
        };
            
        // calculate elapsed time, remember current time
        var timeNow = new Date().getTime();
        var totalTime = timeNow - this.firstTime - this.waitingTime;
        var timeDelta = timeNow - this.lastTime;
        this.lastTime = timeNow;
        
        // register animation callback
        var _animation = this; // pass animation object via closure
        requestAnimFrame( (function() {_animation.update();}) );
            
        // call the actual update function
        this.updateFunction(totalTime, timeDelta);

    };
    
    // this module returns only the Animation constructor function
    return Animation;        

}); // define


