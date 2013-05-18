precision mediump float;

const float T_MIN = 0.1;
const float T_MAX = 1000000.0;

struct Ray {
      vec3 start;
      vec3 direction;
};

struct Sphere {
      vec3 center;
      float radius;
};

uniform Sphere spheres[2];
uniform vec3 eyePosition;

varying vec3 rayDirection;

/**
 * Intersects ray with sphere and returns t (scalar).
 */
float intersectSphere(Sphere sphere, Ray ray) {
      vec3 toSphere = ray.start - sphere.center;

      // Terme der Mitternachtsformel
      float a = dot(ray.direction, ray.direction);
      float b = 2.0 * dot(toSphere, ray.direction);
      float c = dot(toSphere, toSphere) - sphere.radius * sphere.radius;
      float discriminant = b * b - 4.0 * a * c; // Wurzel

      if (discriminant < 0.0) return T_MAX; // keine Lösung

      if (discriminant == 0.0) { // eine Lösung
            float t0 = -b / (2.0 * a);

            if (t0 <= T_MIN) return T_MAX; // Rundungsfehler abfangen

            return t0;
      } else { // zwei Lösungen
            float t0 = (-b + sqrt(discriminant)) / (2.0 * a);
            float t1 = (-b - sqrt(discriminant)) / (2.0 * a);

            if (t0 <= T_MIN || t1 <= T_MIN) return T_MAX; // Rundungsfehler abfangen

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
vec4 traceRay(Ray ray) {
      // hit objects
      float t = T_MAX;
      for (int i = 0; i < 2; i++) {
            float tmpT = intersectSphere(spheres[i], ray);
            if (tmpT < t) {
                  t = tmpT;
            }
      }

      if (t == T_MAX) return vec4(0, 0, 0, 1); // kein Schnittpunkt

      return vec4(0, 1, 0, 1);
      
}

void main() {
      Ray primary;
      primary.start = eyePosition;
      primary.direction = rayDirection;

      gl_FragColor = traceRay(primary);
}
