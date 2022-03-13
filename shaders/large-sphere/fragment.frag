uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;

float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

float noise(vec3 p){
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

float lines(vec2 baseUV, float offset) {
  return smoothstep(
    0.,
    .5 + offset * .5,
    abs(.5 * (sin(baseUV.x * 30.) + offset * 2.))
  );
}

void main() {
  float noise = noise(vPosition + uTime * 0.5);

  vec3 basePrimary = vec3(120./255., 158./255., 113./255.);
  vec3 accent = vec3(0., 0., 0.);
  vec3 baseSecondary = vec3(224./255., 148./255., 66./255.);

  vec2 baseUV = rotate(vPosition.xy * .1, noise);
  float basePattern = lines(baseUV, .6);
  float secondPattern = lines(baseUV, .1);

  vec3 baseColor = mix(baseSecondary, basePrimary, basePattern);
  vec3 secondColor = mix(baseColor, accent, secondPattern);

  gl_FragColor = vec4(secondColor, 1.);
}
