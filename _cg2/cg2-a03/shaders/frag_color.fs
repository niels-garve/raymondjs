/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Fragment Shader: constant color fragment shader
 *
 * This shader uses the value of uniform fragColor to render the fragment.
 *
 */


precision mediump float;

uniform vec4 fragColor;

void main() {
    gl_FragColor = fragColor;
}
