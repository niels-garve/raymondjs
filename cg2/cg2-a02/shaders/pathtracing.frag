precision mediump float;

uniform vec3 sphere1Center;
uniform float sphere1Radius;
uniform vec3 eyePosition;

varying vec3 rayDirection;

vec4 intersectSphere() {
      vec3 toSphere = eyePosition - sphere1Center;

      // Mitternachtsformel
      float a = dot(rayDirection, rayDirection);
      float b = 2.0 * dot(toSphere, rayDirection);
      float c = dot(toSphere, toSphere) - sphere1Radius * sphere1Radius;
      float discriminant = b * b - 4.0 * a * c; // Wurzel

      if(discriminant > 0.0) {
            float t1 = (-b - sqrt(discriminant)) / (2.0 * a);
            return vec4(0, 1, 0, 1); // return constant color green
      }
      return vec4(0, 0, 0, 1); // "world"-color
}

void main() {
      gl_FragColor = intersectSphere();
}
