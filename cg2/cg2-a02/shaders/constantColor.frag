// simplest possible fragment shader rendering everything using a constant color
// (RGBA four floats [0:1]) that defaults to red if not specified.

precision mediump float;

void main() {
	gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
