// vertex shader applying a modelview as well as
// a projection matrix, expecting an attribute "vertexPosition"
// of type vec3.

attribute vec3 vertexPosition;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1.0);
	gl_PointSize = 3.0;
}
