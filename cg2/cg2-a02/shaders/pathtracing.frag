precision mediump float;

float T_MIN = 0.1;
float INFINITY = 1000000.0;

struct Sphere {
      vec3 center;
      float radius;
};

uniform Sphere spheres[2];
uniform vec3 eyePosition;

varying vec3 rayDirection;

/**
 *
 */
float intersectSphere(Sphere sphere) {
      vec3 toSphere = eyePosition - sphere.center;

      // Terme der Mitternachtsformel
      float a = dot(rayDirection, rayDirection);
      float b = 2.0 * dot(toSphere, rayDirection);
      float c = dot(toSphere, toSphere) - sphere.radius * sphere.radius;
      float discriminant = b * b - 4.0 * a * c; // Wurzel

      if (discriminant < 0.0) return INFINITY; // keine Lösung

      if (discriminant == 0.0) { // eine Lösung
            float t0 = -b / (2.0 * a);

            if (t0 <= T_MIN) return INFINITY; // Rundungsfehler abfangen

            return t0;
      } else { // zwei Lösungen
            float t0 = (-b + sqrt(discriminant)) / (2.0 * a);
            float t1 = (-b - sqrt(discriminant)) / (2.0 * a);

            if (t0 <= T_MIN || t1 <= T_MIN) return INFINITY; // Rundungsfehler abfangen

            if (t0 <= t1) {
                  return t0;
            } else {
                  return t1;
            }
      }
}

/**
 *
 */
vec4 traceRay() {
      // hit objects
      float t = INFINITY;
      for (int i = 0; i < 2; i++) {
            float tmpT = intersectSphere(spheres[i]);
            if (tmpT < t) {
                  t = tmpT;
            }
      }

      if (t == INFINITY) return vec4(0, 0, 0, 1); // kein Schnittpunkt

      return vec4(0, 1, 0, 1);
      
}

void main() {
      gl_FragColor = traceRay();
}
