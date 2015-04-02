/*
 * WebGL core teaching framwork 
 * (C)opyright Hartmut Schirmacher, hschirmacher.beuth-hochschule.de 
 *
 * Fragment Shader: texture
 *
 * This module expects a 2D texture in texture0 and 2D texture coordinates
 * in varying texCoords, and uses the texture value as fragment color.
 *
 */

precision mediump float;

uniform sampler2D texture0;

varying vec2 texCoords;

void main() {
    gl_FragColor = texture2D(texture0, texCoords);
}


