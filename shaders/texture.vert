/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de
 * (C)opyright Niels Garve, niels.garve.yahoo.de
 *
 * Vertex Shader: texture
 *
 * This shader expects a 3D vertex position plus a 2D texture coordinate
 * vertexTexCoords per vertex, and passes the texture coordinate through
 * to the fragment shader using the varying texCoords.
 *
 */
 
// #version 100
// precision mediump float;

// attribute vec3 vertexPosition;
// attribute vec2 vertexTexCoords;

// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;

varying vec2 texCoords;

void main() {
	gl_Position = projectionMatrix *
				  modelMatrix *
				  vec4(position, 1.0);

	texCoords = uv;
}
