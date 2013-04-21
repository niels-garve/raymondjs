attribute vec3 vertexPosition;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 eyePosition;

varying vec3 rayDirection;

void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1.0);
      rayDirection = vertexPosition - eyePosition;
}
