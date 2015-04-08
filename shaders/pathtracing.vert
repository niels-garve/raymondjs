/**
 * Pathtracing
 *
 * @author Niels Garve, niels.garve.yahoo.de
 */
// #version 100
// precision mediump float;

// attribute vec3 vertexPosition;
// attribute vec2 vertexTexCoords;

// uniform mat4 modelViewMatrix;
// uniform mat4 projectionMatrix;
uniform vec3 eyePosition;

varying vec3 rayDirection;
varying vec2 texCoords;

/**
 * Liefert die inverse Matrix zu mat. Der Algorithmus ist gl-matrix-1.3.7.js entnommen und von mir auf GLSL portiert
 * worden. Achtung: In der gl-matrix-1.3.7.js-Bibliothek passiert die Initialisierung der Matrizen in Reihen, in der 
 * GLSL in Spalten!
 * @author vgl. Brandon Jones, Colin MacKenzie IV
 */
mat4 inverse(mat4 mat) {
	// Cache the matrix values (makes for huge speed increases!)
	float a00 = mat[0].x; float a01 = mat[0].y; float a02 = mat[0].z; float a03 = mat[0].w;
	float a10 = mat[1].x; float a11 = mat[1].y; float a12 = mat[1].z; float a13 = mat[1].w;
	float a20 = mat[2].x; float a21 = mat[2].y; float a22 = mat[2].z; float a23 = mat[2].w;
	float a30 = mat[3].x; float a31 = mat[3].y; float a32 = mat[3].z; float a33 = mat[3].w;

	float b00 = a00 * a11 - a01 * a10;
	float b01 = a00 * a12 - a02 * a10;
	float b02 = a00 * a13 - a03 * a10;
	float b03 = a01 * a12 - a02 * a11;
	float b04 = a01 * a13 - a03 * a11;
	float b05 = a02 * a13 - a03 * a12;
	float b06 = a20 * a31 - a21 * a30;
	float b07 = a20 * a32 - a22 * a30;
	float b08 = a20 * a33 - a23 * a30;
	float b09 = a21 * a32 - a22 * a31;
	float b10 = a21 * a33 - a23 * a31;
	float b11 = a22 * a33 - a23 * a32;

	float d = (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
	float invDet;

	// Calculate the determinant
	if (d == 0.0) {
		/**
		 * liefer Identität TODO ok?
		 * @author Niels Garve, niels.garve.yahoo.de
		 */
		return mat4(1.0);
	}
	invDet = 1.0 / d;

	return mat4(
		(a11 * b11 - a12 * b10 + a13 * b09) * invDet,
		(-a10 * b11 + a12 * b08 - a13 * b07) * invDet,
		(a10 * b10 - a11 * b08 + a13 * b06) * invDet,
		(-a10 * b09 + a11 * b07 - a12 * b06) * invDet,
		(-a01 * b11 + a02 * b10 - a03 * b09) * invDet,
		(a00 * b11 - a02 * b08 + a03 * b07) * invDet,
		(-a00 * b10 + a01 * b08 - a03 * b06) * invDet,
		(a00 * b09 - a01 * b07 + a02 * b06) * invDet,
		(a31 * b05 - a32 * b04 + a33 * b03) * invDet,
		(-a30 * b05 + a32 * b02 - a33 * b01) * invDet,
		(a30 * b04 - a31 * b02 + a33 * b00) * invDet,
		(-a30 * b03 + a31 * b01 - a32 * b00) * invDet,
		(-a21 * b05 + a22 * b04 - a23 * b03) * invDet,
		(a20 * b05 - a22 * b02 + a23 * b01) * invDet,
		(-a20 * b04 + a21 * b02 - a23 * b00) * invDet,
		(a20 * b03 - a21 * b01 + a22 * b00) * invDet
		);
}

void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

	// rayDirection = (vec4(position - eyePosition, 1.0) * inverse(modelViewMatrix)).xyz;
	rayDirection = position - eyePosition;
	texCoords = uv;
}
