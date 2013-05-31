precision mediump float;

// Intervallgrenzen für Werte von t (des Skalars) bei der Schnittpunktberechnung (Rundungsfehler abfangen). 
const float T_MIN = 0.0001;
const float T_MAX = 1000000.0;
// Anzahl "bounces"
const int DEPTH = 10;
// Standard-Konstanten
const float M_PI = 3.14159265359;
const float EPSILON = 0.0001;

// structs
struct Ray {
      vec3 start;
      vec3 direction;
};
struct Sphere {
      vec3 center;
      float radius;
};
struct Plane { // Hessesche Normalform
      vec3 n;
      float d;
};
struct CornellBox {
      vec3 minCorner;
      vec3 maxCorner;
};
struct Material {
      bool isLight;
      bool isPerfectMirror;
      bool isDiffuse;
};
struct Hit {
      float t;
      vec3 hitPoint;
      Material material;
      vec3 normal;
};

// uniforms
uniform Sphere spheres[3];
uniform Material sphereMaterials[3];

uniform CornellBox cornellBox;
uniform Material cornellBoxMaterial;

uniform vec3 eyePosition;
uniform float secondsSinceStart;

// varyings
varying vec3 rayDirection;

// lokale Variablen
Plane cornellBoxPlanes[6];

/**
 * Schneidet ray mit sphere und liefert t (ein Skalar). Falls zwei Schnittpunkte existieren wird das kleinste t
 * zurückgeliefert; falls ray sphere nicht schneidet T_MAX.
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
 * Schneidet ray mit sphere und liefert ein "Hit-structure" mit Hit.material = material und Hit.t = T_MAX falls kein 
 * Schnittpunkt existiert.
 */
Hit hitSphere(Sphere sphere, Ray ray, Material material) {
      Hit hit;
      hit.t = intersectSphere(sphere, ray);

      if (hit.t == T_MAX) { // kein Schnittpunkt
            return hit; // hit repräsentiert den Schnitt in der Unendlichkeit
      } // else

      hit.hitPoint = ray.start + hit.t * ray.direction;
      hit.material = material;
      hit.normal = normalize(hit.hitPoint - sphere.center);
      return hit;
}

/**
 * Schneidet ray mit der CornellBox und liefert ein "Hit-structure".
 */
Hit hitCornellBox(Ray ray) {
      Hit hit;
      hit.t = T_MAX; // hit repräsentiert zunächst den Schnitt in der Unendlichkeit

      for (int i = 0; i < 6; i ++) {
            float denominator = dot(cornellBoxPlanes[i].n, ray.direction); // z. dt. Nenner

            if (abs(denominator) < EPSILON) continue; // keine Division durch "0"

            float tmpT = (cornellBoxPlanes[i].d - dot(cornellBoxPlanes[i].n, ray.start)) / denominator;

            // Intervallgrenzen checken und kleinstes t suchen (siehe CornellBox)
            if (tmpT <= T_MIN || T_MAX <= tmpT || hit.t < tmpT) continue;

            hit = Hit(tmpT, ray.start + tmpT * ray.direction, cornellBoxMaterial, cornellBoxPlanes[i].n);
      }
      return hit;
}

/**
 * Liefert den perfekten Ausfallvektor. Achtung: i ist der "incident vector" --> Richtung beachten!
 */
float perfectMirrorNextDirection(out vec3 L, vec3 i, vec3 n) {
      L = reflect(i, n);
      return 1.0;
}

/**
 * Liefert, je nach scale und seed, einen (Pseudo-) Zufallswert.
 * @author vgl. Evan Wallace
 */
float random(vec3 scale, float seed) {
      return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

/**
 * Liefert einen (pseudo-) zufälligen Ausfallvektor aus der Halbkugel (out-Parameter L) und seine Wahrscheinlichkeit als
 * "return value" der Funktion.
 * @author vgl. Szirmay-Kalos, S. 104
 */
float diffuseNextDirection(out vec3 L, vec3 N, vec3 V, float seed) {
      float u = random(vec3(12.9898, 78.233, 151.7182), seed);
      float v = random(vec3(63.7264, 10.873, 623.6736), seed);

      float theta = asin(sqrt(u));
      float phi = M_PI * 2.0 * v;
      vec3 O = cross(N, vec3(0, 0, 1));

      if (length(O) < EPSILON) {
            O = cross(N, vec3(0, 1, 0));
      }

      vec3 P = cross(N, O);

      L = N * cos(theta) + O * sin(theta) * cos(phi) + P * sin(theta) * sin(phi);

      float prob = cos(theta) / M_PI;
      return prob;
}

/**
 * Liefert den neuen Strahl und die akkumulierte brdf als inout Parameter und ob der "path" weitergeführt werden soll 
 * als "return value" der Funktion.
 */
bool sceneFirstHit(inout Ray ray, inout vec3 brdf, int bounce) {
      Hit hit;
      hit.t = T_MAX; // hit repräsentiert zunächst den Schnitt in der Unendlichkeit

      // Kugeln
      for (int i = 0; i < 3; i++) {
            Hit tmpHit = hitSphere(spheres[i], ray, sphereMaterials[i]);
            if (tmpHit.t < hit.t) {
                  hit = tmpHit;
            }
      }

      // "CornellBox"
      Hit cornellBoxHit = hitCornellBox(ray);
      if (cornellBoxHit.t < hit.t) hit = cornellBoxHit;

      // kein Schnittpunkt? Oder "path" zu Ende?
      if (hit.t == T_MAX || bounce == DEPTH) {
            brdf = vec3(0.0, 0.0, 0.0); // Hintergrundfarbe
            return false;
      }

      // Licht?
      if (hit.material.isLight) {
            return false;
      }

      // neue Richtung
      vec3 nextDirection;
      float prob;

      if (hit.material.isPerfectMirror) {
            prob = perfectMirrorNextDirection(nextDirection, normalize(ray.direction), hit.normal);
      } else {
            prob = diffuseNextDirection(nextDirection, hit.normal, normalize(-ray.direction), secondsSinceStart + float(bounce));
      }

      Ray newRay = Ray(hit.hitPoint, nextDirection);

      ray = newRay;
      brdf *= vec3(0.5, 0.5, 0.5); // brdf akkumulieren

      // TODO Was mache ich mit der Wahrscheinlichkeit des Strahls (prob)?
      // TODO Wie bringe ich Farbe der Objekte mit ins Spiel? Ist vec3(0.5, 0.5, 0.5) schon eine feste Farbe (grau) für
      // alle Objekte?

      return true;
}

/**
 * Startpunkt und Hauptschleife
 */
vec3 pathTrace() {
      Ray ray = Ray(eyePosition, rayDirection);
      vec3 brdf = vec3(1.0, 1.0, 1.0);

      for (int i = 1; i <= DEPTH; i++) {
            bool continueWalk = sceneFirstHit(ray, brdf, i);
            if (!continueWalk) break;
      }

      return brdf;
}

void main() {
      // initialisiere CornellBox-Ebenen
      cornellBoxPlanes[0] = Plane(vec3( 1.0,  0.0,  0.0),  cornellBox.minCorner.x); // left
      cornellBoxPlanes[1] = Plane(vec3(-1.0,  0.0,  0.0), -cornellBox.maxCorner.x); // right
      cornellBoxPlanes[2] = Plane(vec3( 0.0,  1.0,  0.0),  cornellBox.minCorner.y); // bottom
      cornellBoxPlanes[3] = Plane(vec3( 0.0, -1.0,  0.0), -cornellBox.maxCorner.y); // top
      cornellBoxPlanes[4] = Plane(vec3( 0.0,  0.0,  1.0),  cornellBox.minCorner.z); // far
      cornellBoxPlanes[5] = Plane(vec3( 0.0,  0.0, -1.0), -cornellBox.maxCorner.z); // near

      // kickoff
      gl_FragColor = vec4(pathTrace(), 1);
}
