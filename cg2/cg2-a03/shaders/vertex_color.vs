/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Vertex Shader: Per-Vertex-Color
 *
 * This shader expects each vertex to come with two attributes:
 * vertexPosition and vertexColor.
 *
 * the vertex position is transformed by modelViewMatrix and
 * projectionMatrix; vertexColor is "passed through" to the 
 * fragment shader using a varying variable named fragColor.
 *
 */


attribute vec3 vertexPosition;
attribute vec4 vertexColor;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec4 fragColor;

void main() {
     gl_Position = projectionMatrix *
                   modelViewMatrix *
                   vec4(vertexPosition,1.0);
     gl_PointSize = 3.0;
     fragColor = vertexColor;
}
