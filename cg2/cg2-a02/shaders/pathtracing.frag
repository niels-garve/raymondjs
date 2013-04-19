precision mediump float;
uniform sampler2D scene;
uniform vec2 sceneSize;
uniform vec3 sphere1Center;
uniform float sphere1Radius;
uniform vec3 eyePosition;
varying vec3 rayDirection;
vec2 onePixel;

vec4 intersectSphere() {
      vec3 toSphere = eyePosition - sphere1Center;

      // Mitternachtsformel
      float a = dot(rayDirection, rayDirection);
      float b = 2.0 * dot(toSphere, rayDirection);
      float c = dot(toSphere, toSphere) - sphere1Radius * sphere1Radius;
      float discriminant = b * b - 4.0 * a * c; // Wurzel

      if(discriminant > 0.0) {
            float t1 = (-b - sqrt(discriminant)) / (2.0 * a);
            vec2 coord = vec2(0, 0) * onePixel;
            return texture2D(scene, coord);
      }
      return vec4(0,0,0,1);
}

void main() {
      onePixel = vec2(1.0, 1.0) / sceneSize;
      gl_FragColor = intersectSphere();
}
