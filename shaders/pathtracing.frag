/**
 * Pathtracing
 *
 * @author Niels Garve, niels.garve.yahoo.de
 */
#version 100
precision mediump float;

// Intervallgrenzen für Werte von t (des Skalars) bei der Schnittpunktberechnung (Rundungsfehler abfangen)
#define T_MIN 0.001
#define T_MAX 1000000.0

// Anzahl "bounces"
#define DEPTH 3

#define M_PI 3.14159265359
#define EPSILON 0.001

#define NUMBER_OF_SPHERES {{numberOfSpheres}}
#define NUMBER_OF_SPHERICAL_LIGHTS {{numberOfSphericalLights}}
#define MESH_SAMPLER_WIDTH {{meshSamplerWidth}}

// "struct"-Orientiertes programmieren
struct Ray {
	vec3 start;
	vec3 direction;
};
struct Material {
	// zwei Boolesche Variablen zur Auswahl der BRDF
	bool isPerfectMirror;
	bool isDiffuse;
	vec3 Le; // L_emit
	vec3 Kd; // Farbe 
};
struct Hit {
	// eigentlich sind t und hitPoint redundant, aber t ist eine schnelle Metrik für die Abstandsmessung und hitPoint
	// ist hier einfach gut aufgehoben
	float t;
	vec3 hitPoint;
	Material material;
	vec3 normal;
};

// uniforms
uniform vec3 La; // Hintergrundfarbe

// Benötigt für Zufallsvariable
uniform float secondsSinceStart;

uniform sampler2D texture0;
uniform float textureWeight;
uniform vec3 eyePosition;

// varyings
varying vec3 rayDirection;
varying vec2 texCoords;

//{{#hasSpheres}}
struct Sphere {
	vec3 center;
	float radius;
};

uniform Sphere spheres[NUMBER_OF_SPHERES];
uniform Material sphereMaterials[NUMBER_OF_SPHERES];

/**
 * Schneidet ray mit sphere und liefert inout-firstHit, falls "out"-firstHit.t in (tMin, ..., "in"-firstHit.t) liegt.
 * Sonst: nichts. material gehört zu sphere.
 */
void hitSphere(Ray ray, Sphere sphere, float tMin, inout Hit firstHit, Material material) {
	vec3 toSphere = ray.start - sphere.center;

	// Terme der Mitternachtsformel
	float a = dot(ray.direction, ray.direction);
	float b = 2.0 * dot(toSphere, ray.direction);
	float c = dot(toSphere, toSphere) - sphere.radius * sphere.radius;
	float discriminant = b * b - 4.0 * a * c; // Wurzel

	if (discriminant < 0.0) return; // keine Lösung

	if (discriminant == 0.0) { // eine Lösung
		float t = -b / (2.0 * a);

		if (tMin < t && t < firstHit.t) {
			vec3 hitPoint = ray.start + t * ray.direction;
			firstHit = Hit(t, hitPoint, material, normalize(hitPoint - sphere.center));
		}
	} else { // zwei Lösungen
		float t0 = (-b + sqrt(discriminant)) / (2.0 * a);
		float t1 = (-b - sqrt(discriminant)) / (2.0 * a);
		float t = min(t0, t1);

		if (tMin < t && t < firstHit.t) {
			vec3 hitPoint = ray.start + t * ray.direction;
			firstHit = Hit(t, hitPoint, material, normalize(hitPoint - sphere.center));			
		}
	}
}
//{{/hasSpheres}}

//{{#hasCornellBox}}
struct Plane { // Hessesche Normalform
	vec3 n;
	float d;
};

struct CornellBox {
	Plane planes[6];
	Material materials[6];
	// eigentlich redundant, aber benötigt für Mittelpunktberechnung (siehe Li-Berechnung)
	vec3 minCorner;
	vec3 maxCorner;
};

uniform CornellBox cornellBox;

/**
 * Schneidet ray mit plane und liefert inout-firstHit, falls "out"-firstHit.t in (tMin, ..., "in"-firstHit.t) liegt.
 * Sonst: nichts. material gehört zu plane.
 */
void hitPlane(Ray ray, Plane plane, float tMin, inout Hit firstHit, Material material) {
	float denominator = dot(plane.n, ray.direction); // z. dt. Nenner

	if (denominator == 0.0) return;

	float t = (plane.d - dot(plane.n, ray.start)) / denominator;

	if (tMin < t && t < firstHit.t) {
		vec3 hitPoint = ray.start + t * ray.direction;
		firstHit = Hit(t, hitPoint, material, plane.n); // bereits Normalisiert
	}
}
//{{/hasCornellBox}}

//{{#hasMesh}}
struct Triangle {
	vec3 v0;
	vec3 v1;
	vec3 v2;
	vec3 n; // erst mal reicht nur eine Normale
};

struct Mesh {
	sampler2D data;
	vec2 onePixel; // Größe eines Pixel zur Adressierung
};

uniform Mesh mesh;
uniform Material meshMaterial;

/**
 * Schneidet ray mit triangle und liefert inout-firstHit, falls "out"-firstHit.t in (tMin, ..., "in"-firstHit.t)
 * liegt. Sonst: nichts. material gehört zu triangle.
 * @author vgl. Moeller, S. 581
 */
void hitTriangle(Ray ray, Triangle triangle, float tMin, inout Hit firstHit, Material material) {
	vec3 e1 = triangle.v1 - triangle.v0;
	vec3 e2 = triangle.v2 - triangle.v0;
	vec3 p = cross(ray.direction, e2);
	float a = dot(e1, p);
	if (a > -EPSILON && a < EPSILON) return; // "REJECT"
	float f = 1.0 / a;
	vec3 s = ray.start - triangle.v0;
	float u = f * dot(s, p);
	if (u < 0.0 || u > 1.0) return; // "REJECT"
	vec3 q = cross(s, e1);
	float v = f * dot(ray.direction, q);
	if (v < 0.0 || (u + v) > 1.0) return; // "REJECT"
	float t = f * dot(e2, q);

	if (tMin < t && t < firstHit.t) {
		vec3 hitPoint = ray.start + t * ray.direction;
		firstHit = Hit(t, hitPoint, material, triangle.n); // bereits Normalisiert
	}
}

/**
 * Liefert den RGB-Vektor von Pixel [x, y] der mesh.data Textur. Der Wertebereich pro Kanal "ist Element von"
 * [-128.0, ..., 127.0], also der eines Bytes in Zweierkomplement-Darstellung. Es handelt sich tatsächlich um nur 255
 * Werte, obwohl es "floats" sind. Das Weiterrechnen mit floats ist einfach einfacher. Mit r lassen sich die Werte
 * konstant erhöhen oder verringern. Das ist eine Trick, um die Richtung --- auf- oder abrunden --- bei einem Cast auf 
 * int einzustellen. ceil() oder floor() müssen dann nicht noch extra angewendet werden.
 * 
 */
vec3 meshSamplerLookup(int x, int y, float r) {
	vec3 res = texture2D(mesh.data, vec2(x, y) * mesh.onePixel).xyz * 255.0 + r;

	// Zweierkomplement
	bvec3 b = greaterThan(res, vec3(127.0, 127.0, 127.0));
	res -= vec3(256.0, 256.0, 256.0) * vec3(b);

	return res;
}
//{{/hasMesh}}

/**
 * Schneidet alle Szeneobjekte mit ray und liefert den nächstliegendsten Hit.
 */
Hit sceneFirstHit(Ray ray) {
	Hit firstHit; firstHit.t = T_MAX; // firstHit repräsentiert zunächst den "Schnitt in der Unendlichkeit"

	// Li-Berechnung benötigt Le!
	Material firstHitMaterial;
	firstHitMaterial.Le = vec3(0.0, 0.0, 0.0);
	firstHit.material = firstHitMaterial;

	//{{#hasSpheres}}
	for (int i = 0; i < NUMBER_OF_SPHERES; i++) {
		hitSphere(ray, spheres[i], T_MIN, firstHit, sphereMaterials[i]);
	}
	//{{/hasSpheres}}

	//{{#hasCornellBox}}
	for (int i = 0; i < 6; i++) { // immer 6 "Wände"
		hitPlane(ray, cornellBox.planes[i], T_MIN, firstHit, cornellBox.materials[i]);
	}
	//{{/hasCornellBox}}

	//{{#hasMesh}}
	for (int i = 0; i < MESH_SAMPLER_WIDTH; i++) {
		ivec3 indices = ivec3(meshSamplerLookup(i, 3, 0.1)); // Der Textur-Ursprung ist links-unten

		// "0-terminierend"
		if (indices.x == 0 && indices.y == 0 && indices.z == 0) break;

		Triangle triangle = Triangle(meshSamplerLookup(indices.x, 2, 0.0),
			                         meshSamplerLookup(indices.y, 2, 0.0),
			                         meshSamplerLookup(indices.z, 2, 0.0),
			                         normalize(meshSamplerLookup(i, 1, 0.0)));

		hitTriangle(ray, triangle, T_MIN, firstHit, meshMaterial);
	}
	//{{/hasMesh}}

	return firstHit;
}

/**
 * Berechnet die lokale Beleuchtung in x durch die Lichtquelle in Richtung s mit n ist die Normale in x. Das Resultat
 * der Berechnung wird zu res addiert.
 */
void Li(vec3 x, vec3 s, vec3 n, inout vec3 res) {
	Hit hit = sceneFirstHit(Ray(x, s));
	float theCos = dot(n, s);
	if (theCos > 0.0) res += hit.material.Le * theCos; // Trick: Schatten-Test ohne if
}

/**
 * Berechnet die lokale Beleuchtung in hit durch alle Lichtquellen der Szene.
 */
vec3 prepareLiCalculation(Hit hit) {
	vec3 res = vec3(0.0, 0.0, 0.0);

	//{{#hasSpheres}}
	for (int i = 0; i < NUMBER_OF_SPHERICAL_LIGHTS; i++) {
		// die Lichter befinden sich am Anfang der Reihungen
		vec3 toSource = normalize(spheres[i].center - hit.hitPoint); // TODO Sampling!
		Li(hit.hitPoint, toSource, hit.normal, res);
	}
	//{{/hasSpheres}}

	//{{#hasCornellBox}}
	vec2 centerXY = vec2((cornellBox.minCorner.x + cornellBox.maxCorner.x) / 2.0,
				   (cornellBox.minCorner.y + cornellBox.maxCorner.y) / 2.0); // TODO Sampling

	// TODO noch "hard coded"! Und zwar leuchtet die "top plane"
	vec3 toCornellBoxNearSource = normalize(vec3(centerXY, cornellBox.maxCorner.z) - hit.hitPoint);
	Li(hit.hitPoint, toCornellBoxNearSource, hit.normal, res);
	//{{/hasCornellBox}}

	return res;
}

/**
 * konstant
 */
vec3 perfectMirrorBRDF() {
	return vec3(1.0, 1.0, 1.0);
}

/**
 * Liefert den "perfekten" Ausfallvektor out-L. Achtung: i ist der "incident vector" --> Richtung beachten! n ist die 
 * Normale.
 */
float perfectMirrorNextDirection(out vec3 L, vec3 i, vec3 n) {
	L = normalize(reflect(i, n)); // TODO already normalized?
	return 1.0;
}

/**
 * konstant
 */
vec3 diffuseBRDF(Material material) {
	return material.Kd;
}

/**
 * Liefert, je nach scale und seed, ein Zufallszahl.
 * @author vgl. Evan Wallace
 */
float random(vec3 scale, float seed) {
	return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

/**
 * Liefert den zufälligen Ausfallvektor out-L aus der Halbkugel und seine Wahrscheinlichkeit als "return value". N ist
 * die Normale und V ist der "view"-Vektor. Achtung: V "zeigt" entgegengesetzt zur Strahl-Richtung! seed wird für die
 * Zufallszahl-Berechnung benötigt.
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

	L = normalize(N * cos(theta) + O * sin(theta) * cos(phi) + P * sin(theta) * sin(phi)); // TODO already normalized?

	float prob = cos(theta) / M_PI;
	return prob;
}

/**
 * Path tracing (vgl. Szirmay-Kalos, S. 112; Kevin Suffern S. 547 - 549)
 */
vec3 pathTrace() {
	Ray ray = Ray(eyePosition, normalize(rayDirection)); // Primärstrahl
	vec3 resColor = vec3(1, 1, 1);

	for (int j = 0; j < DEPTH; j++) { // entspricht dem Produkt von i = 0 bis n
		Hit hit = sceneFirstHit(ray);

		// Fall: kein Schnittpunkt
		if (hit.t == T_MAX) return La;

		// Fall: Licht geschnitten
		if (length(hit.material.Le) > 0.0) {
			return resColor * hit.material.Le;
		}

		// L_i (leider zu langsam)
		// resColor += prepareLiCalculation(hit);

		// BRDF und Co.
		vec3 brdf; vec3 nextDirection;
		float prob;

		if (hit.material.isPerfectMirror) {
			brdf = perfectMirrorBRDF();
			prob = perfectMirrorNextDirection(nextDirection, ray.direction, hit.normal);
		} else if (hit.material.isDiffuse) {
			brdf = diffuseBRDF(hit.material);
			prob = diffuseNextDirection(nextDirection, hit.normal, -ray.direction, secondsSinceStart + float(j));
		}

		if (prob < EPSILON) return La; // Russian Roulette

		float cost = dot(nextDirection, hit.normal);
		if (cost < 0.0) cost = -cost;
		if (cost < EPSILON) return La;

		// resColor akkumulieren
		resColor *= brdf * cost / prob;

		// Iteration
		ray = Ray(hit.hitPoint, nextDirection); // neuer Strahl
	}
	return La; // Fall: maximale "depth" erreicht
}

void main() {
	// "blending" vgl. Evan Wallace
	gl_FragColor = mix(vec4(pathTrace(), 1.0), texture2D(texture0, texCoords), textureWeight);
}
