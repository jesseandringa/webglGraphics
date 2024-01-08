var raytraceFS = `
#line 3
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;
bool IntersectRay( inout HitInfo hit, Ray ray );



// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	
	vec3 color = vec3(0,0,0);
	bool isHit; 
	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		// TO-DO: Check for shadows
		// TO-DO: If not shadowed, perform shading using the Blinn model

		HitInfo shadowHit; 
		vec3 direction =  normalize(lights[i].position - position);
		Ray shadowRay;
		shadowRay.pos = position + 0.01 *normalize(direction);
		shadowRay.dir = normalize(direction);

		bool isHit = IntersectRay(shadowHit, shadowRay);
		
		if(isHit == true){
			continue; 
		}
		else{
			
			//Blinn shading
			vec3 lightDir = normalize(lights[i].position - position);

			//diffuse
			float diffuse = max(dot(normal, lightDir),0.0);

			//specular
			vec3 halfDir = normalize(lightDir + view);
			float specular = pow(max(dot(normal, halfDir), 0.0), mtl.n);
			color = (mtl.k_d * diffuse* lights[i].intensity)+(mtl.k_s * specular* lights[i].intensity); 
		}
		isHit = false; 
	}
	return color;
}




// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30;
	bool foundHit = false;
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		
		// TO-DO: Test for ray-sphere intersection
		// TO-DO: If intersection is found, update the given HitInfo

		float r2 = spheres[i].radius * spheres[i].radius;
		float a = dot(ray.dir , ray.dir);
		float b = 2.0* dot(ray.dir , (ray.pos - spheres[i].center)); 
		float c = dot((ray.pos - spheres[i].center) ,(ray.pos - spheres[i].center)) - r2; 
		
		float d = b*b - (4.0*a*c);
		float error = 0.0;
		//hit
		if(d >= 0.0){
			float t;
			
			if(a != 0.0){
				t = (-b - sqrt(d)) / (2.0*a);

			}
			else{
				t = (-b - sqrt(d)) / (2.0*.0001);
			}
			if (t< hit.t && t>error){
				hit.t = t; 
				hit.mtl = spheres[i].mtl;
				hit.position = ray.pos + t* ray.dir;
				hit.normal = normalize(hit.position - spheres[i].center);
				foundHit = true;
			}
		}
	}
	return foundHit;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			
			// TO-DO: Initialize the reflection ray
			r.pos = hit.position +.001 * hit.normal; // 
			r.dir = normalize(reflect(ray.dir,hit.normal));

			if ( IntersectRay( h, r ) ) {
				// TO-DO: Hit found, so shade the hit point
				// TO-DO: Update the loop variables for tracing the next reflection ray
				clr += k_s *Shade(h.mtl, h.position, h.normal, view); 
				view = normalize(-r.dir);
				hit = h;
				k_s = k_s * h.mtl.k_s;
				ray = r;
			} else {
				// The refleciton ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 1.0 );	// return the environment color
	}
}
`;