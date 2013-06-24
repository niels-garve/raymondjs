attribute vec3 vertexPosition;
attribute vec2 vertexTexCoords;

// uniform mat4 modelViewMatrix;
uniform mat4 inverseModelViewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 eyePosition;

varying vec3 rayDirection;
varying vec2 texCoords;

void main() {
	gl_Position = projectionMatrix *
			  // modelViewMatrix *
			  vec4(vertexPosition, 1.0);

	rayDirection = (vec4(vertexPosition - eyePosition, 1.0) * inverseModelViewMatrix).xyz;
	texCoords = vertexTexCoords;
}
