// vertex shader applying a modelview as well as
// a projection matrix, expecting an attribute "vertexPosition"
// of type vec3 and a per-vertex color of type vec4.

attribute vec3 vertexPosition;
attribute vec4 vertexColor;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
varying vec4 fragColor;

void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition,1.0);
      gl_PointSize = 3.0;
      fragColor = vertexColor;
}
