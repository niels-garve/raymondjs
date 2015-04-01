/*
 * JavaScript / Canvas teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Module: SceneNode 
 *
 * A SceneNode is a container for a transformation, a program, 
 * and a list of drawable objects.
 *
 * The drawable objects can themselves be SceneNodes, so that 
 * hierarchical modeling is supported.
 *
 * The node has a public attribute "visible" that determines whether
 * the node and its children will actually be drawn or not.
 *
 * The program and the transformation are optional; however 
 * at a minimum you must specify a program for the root node. 
 *
 * - the transformation associated with the node can be  
 *   accessed directly via the attribute "transformation".
 *
 * - the program associated with the node can be accessed 
 *   directly via the attribute "program".
 *
 * - drawable objects can be added via the addObjects() method,
 *   and can be removed again using the removeObjects() method.
 *
 * - the draw() method 
 *   - multiplies the model-view matrix passed as an argument 
 *     with its own model-view matrix from the right
 *   - for each drawable object it refers to:
 *     - activates the program to be used
 *       (either the node's own program, or if that is not
 *       defined, the program passed as an argument)
 *     - sets the uniform "modelViewMAtrix" in the active program
 *     - calls the object's draw() method using the current
 *       program and matrix
 *
 * The SceneNode also allows to easily create custom SceneNode objects
 * that consist simply of a custom draw() method. Example:
 *
 * var SceneNode = new SceneNode();
 * var clear = new SceneNode.Custom((function(gl,program,mvMatrix) {
 *      gl.clearColor(0,0,0,1);
 *      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
 * }));
 * ... 
 * SceneNode.addObjects([clear,...]);
 * SceneNode.draw(gl,program);
 */



/* requireJS module definition */
define(["util", "gl-matrix"], 
       (function(util, dummy) {

    "use strict";
    
    /* 
     * SceneNode constructor
     * A SceneNode holds a collection of things to be drawn, 
     * plus an associated transformation and program (both optional).
     *
     * The constructor takes the following arguments:
     * - name      : string defining the name of the SceneNode for UI/debugging purposes,
     * - objects   : array of objects to be contained in this SceneNode 
     * - program   : a Program object (see program.js)
     * - transform : local transformation matrix (of type mat4, see lib/gl-matrix.js)
     *  
     */ 
    var SceneNode = function(name, objects, program, transform, visible) {
    
        // name for UI / debugging
        this.name = name;
        
        // optional list of objects contained in this node
        this.drawableObjects = objects || [];
        
        // optional GPU program for this node
        this.program         = program || null;

        // optional transformation for this node
        this.transformation  = transform || mat4.identity();
        
        // flag: draw this node and its children, or not?
        this.visible = visible===undefined? true : visible;
        
        window.console.log("created " + (visible? "invisible " : "") + "node " + this.name +
                           " with " + this.drawableObjects.length + " children.");
        
    };
    
    
    /*
     * draw() simply calls the draw() method of each object,
     * in the order they were added to the SceneNode. Before that,
     * the SceneNode node's own model-view matrix is chained  
     * with the model-view matrix passed as an argument,
     * and the shader variable "modelViewMatrix" is set;
     * also the inverse-transpose of MV-Matrix is calculated and
     * set as the shader variable "normalMatrix".  
     * - gl              : the WebGL rendering context 
     * - progam          : the (WebGL) Program to be used
     * - modelViewMatrix : the current modelview matrix 
     */
    SceneNode.prototype.draw = function(gl, program, modelViewMatrix) {

        if(!this.visible) 
            return;

        if(!gl) {
            throw "no WebGL context specified in scene node " + this.name;
            return;
        };
    
        // take program passed as a parameter, or the program from the constructor
        var newProgram = this.program || program;
        if(!newProgram) {
            throw "no program specified in scene node " + this.name;
            return;
        };
            
        // copy  the matrix passed as a parameter, or identity if undefined
        var newMatrix = mat4.create(modelViewMatrix || mat4.identity());
        
        // multiply the local transformation from the right so it will be executed FIRST
        mat4.multiply(newMatrix, this.transformation); 
        
        // calculate the normal matrix
        var normalMatrix =  mat4.toInverseMat3(newMatrix);
        mat3.transpose(normalMatrix,normalMatrix);
    
        // loop over all drawable objects and call their draw() methods
        for(var i=0; i<this.drawableObjects.length; ++i) {
            // set new program and new model view matrix for each child
            newProgram.use();
            newProgram.setUniform("modelViewMatrix", "mat4", newMatrix);
            newProgram.setUniform("normalMatrix",    "mat3", normalMatrix, false);

            // child may manipulate the program and/or matrix!
            this.drawableObjects[i].draw(gl, newProgram, newMatrix);
        };
        
    };
    
    /* 
     * add multiple objects to the SceneNode, in drawing order
     * - objects: ARRAY of objects to be added
     */
    SceneNode.prototype.addObjects = function(objects) {

        for(var i=0; i<objects.length; i++) {
            var o = objects[i];
            if(!o.draw) {
                throw "addObjects(): object " + i + " has no draw() method.";
            } else {
                this.drawableObjects.push(o);
            }
            
        };
        window.console.log("added " + objects.length + " objects to SceneNode " + this.name + ".");
            
    };
    
    /*
     * remove drawable objects from the SceneNode (provided in an array)
     */
    SceneNode.prototype.removeObjects = function(objects) {

        for(var i=0; i<objects.length; i++) {
            // find obj in array
            var idx = this.drawableObjects.indexOf(objects[i]); 
            if(idx === -1) {
                // window.console.log("warning: SceneNode.remove(): object not found.");
            } else {
                // remove obj from array
                this.drawableObjects.splice(idx,1);
            };
        };
            
    };


    /* Allow to easily create a custom SceneNode object
     * that consists simply of a user-provided draw() method.
     * thie drawFunc must should take up to three parameters:
     * gl, program, and mvMatrix [ see SceneNode.draw() ]
     */
    SceneNode.prototype.Custom = function(drawFunc) { 
        this.draw = drawFunc;
    };
    
    
    // this module only exports the constructor for SceneNode objects
    return SceneNode;

})); // define

    
