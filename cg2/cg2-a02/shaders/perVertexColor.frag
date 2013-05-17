// fragment shader expecting a varying "fragColor" containing an
// RGBA color of type vec4.

precision mediump float;
varying vec4 fragColor;

void main() {
	gl_FragColor = fragColor;
}
