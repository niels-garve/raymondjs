/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: Texture
 *
 * This module provides methods to load and create textures from 
 * image files.
 *
 * // Create/Load a 2D texture:
 * var tex = new texture.2D(gl, "textures/myfile.gif");
 *
 * // Create/Load a cube texture from 6 individual texture files
 * // cube_textures/{posx.png,negx.png,posy.png,negy.png,posz.png,negz.png}
 * var tex = new texture.Cube(gl, "cube_textures", "png");
 *
 * // check whether it has been loaded yet
 * if(tex.isLoaded()) {
 *  . . . 
 * }
 * 
 * // use the texture for the sampler2D shader variable "myTex" 
 * // in texture unit 0
 * program.setTexture("myTex", 0, tex);
 * 
 * // call some function after *all* textures have been loaded:
 * texture.onAllTexturesLoaded( (function() { … start drawing … }) );
 *
 */

/* requireJS module definition */
define(["util"], 
       (function(util) {

    "use strict";
    
    
    /* "global" counter counting how many texture are to be loaded */
    var _numTexturesToBeLoaded = 0;
    
    /* "global" callback function to be triggered once all textures have been loaded */
    var _allTexturesLoadedCallback = function() {
        window.console.log("all textures have been loaded");
    };
    
    /* function to set up an event handler once all textures have been loaded */
    var onAllTexturesLoaded = function(callbackFunc) {
        _allTexturesLoadedCallback = callackFunc;
    }
    
    /* 
        Object: 2D Texture
        
        Parameters to the constructor:
        - gl        : WebGL context object
        - filename  : name of the image file holding the texture 
        - useMipMap : whether or not to use an automatic Mip-Map 
        - callback  : (optional) function to be called after texture is loaded
        
        TODO: global counter and callback once ALL requested textures
              have been loaded
    */ 

    var Texture2D = function(gl, filename, useMipMap, callback) {

        // store configuration parameters
        this.gl = gl;
        this.filename = filename;
        this.useMipMap = useMipMap;
        this.callback = callback;
        
        // create a WebGL texture object
        this.gltex = gl.createTexture();
        
        // flag indicating whether loading has been completed
        this.loadingCompleted = false;
                    
        // increase global counter
        _numTexturesToBeLoaded++;

        // default texture parameters
        this.resetTexParameters();
        
        // the image object including the file name
        var _image = new Image();
        var _texture = this;
        
        // event handler to set up the texture once it is loaded
        _image.onload = function() { _texture.handleLoadedImage(_image); }
        
        // file to be loaded - now loading will start asynchronously
        _image.src = filename;
        
    };

    // method to set the default parameters for 2D textures
    Texture2D.prototype.resetTexParameters = function() {
    
        var gl = this.gl;
        
        gl.bindTexture(gl.TEXTURE_2D, this.gltex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    
        if(this.useMipMap) {    
            // for using Mip-Mapping, set filters accordingly
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        } else {
            // no Mip-Mapping, set filters accordingly
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        };
    };
    
    // method to change a texture parameter
    Texture2D.prototype.setTexParameter = function(param, value) {
        var gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.gltex);
        gl.texParameteri(gl.TEXTURE_2D, param, value);
    };
    
    // method to query whether image file has been loaded yet
    Texture2D.prototype.isLoaded = function() {
        return this.loadingCompleted;
    };
        
    /* return native WebGL texture object */
    Texture2D.prototype.glTextureObject = function() {
        return this.gltex;
    };

    /* method for use by the loaded image only - is there a better way to do this? */
    Texture2D.prototype.handleLoadedImage = function(image) {

        var gl = this.gl;

        // mark texture as loaded
        this.loadingCompleted = true;
        window.console.log("texture " + image.src + " loaded.");

        // assign image data 
        gl.bindTexture(gl.TEXTURE_2D, this.gltex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        
        // now is the right time to generate a MIP-MAP, if desired
        if(this.useMipMap) {
            gl.generateMipmap(gl.TEXTURE_2D);
        };
        
        // trigger the callback if desired
        if(this.callback) { this.callback(); }
        
        // trigger all-textures-loaded callback if desired
        _numTexturesToBeLoaded--;
        if(_numTexturesToBeLoaded == 0) {
            if(_allTexturesLoadedCallback) {
                _allTexturesLoadedCallback();
            };
        };
    };
    
    // dummy for now
    var TextureCube = function() {
        window.console.log("TextureCube not implemented.");
    };
    


    // this module exports two constructor functions and a 
    return { "onAllTexturesLoaded": onAllTexturesLoaded,
             "Texture2D": Texture2D, 
             "TextureCube": TextureCube };
         
})); // define
            

