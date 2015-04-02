/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Vertex Shader: minimal vertex shader
 *
 * This shader simply applies a model-view matrix and
 * a projection matrix, without assuming any vertex 
 * attributes other than vertexPosition.
 *
 * It also sets the point size for rendering with gl.POINTS
 *
 */


attribute vec3 vertexPosition;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
    gl_Position = projectionMatrix * 
                  modelViewMatrix * 
                  vec4(vertexPosition,1.0);
    gl_PointSize = 3.0;
}

