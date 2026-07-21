import * as THREE from "three";

// Ashima Arts / Stefan Gustavson simplex noise (public domain) — the same
// implementation used by the interviewer orb this blob look is ported from.
const SIMPLEX_NOISE_GLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const VERTEX = `
${SIMPLEX_NOISE_GLSL}
uniform float u_time;
uniform float u_amp;
uniform float u_seed;
varying vec3 v_normal;
varying float v_noise;

void main() {
  // Three octaves of life: slow lobes wander the silhouette, breathe is the
  // resting shimmer, swell firms up with activity (selection / conducting).
  float lobes = snoise(position * 0.7 + u_time * 0.07 + u_seed) * 0.09;
  float breathe = snoise(position * 1.4 + u_time * 0.15 + u_seed * 2.0) * 0.05;
  float swell = snoise(position * 2.2 + u_time * 0.6 + u_seed) * u_amp * 0.18;
  float displacement = lobes + breathe + swell;
  v_noise = displacement;
  vec3 displaced = position + normal * displacement;
  v_normal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
`;

const FRAGMENT = `
uniform vec3 u_colorPrimary;
uniform vec3 u_colorSecondary;
uniform vec3 u_colorAccent;
uniform vec3 u_colorMuted;
uniform float u_mute;
uniform float u_time;
uniform float u_amp;
varying vec3 v_normal;
varying float v_noise;

void main() {
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  float ndv = max(dot(normalize(v_normal), viewDir), 0.0);
  float fresnel = pow(1.0 - ndv, 2.0);

  // Slow living drift between primary and secondary, pushed by the surface
  // noise so color moves with the lobes, not on a clock.
  float drift = 0.5 + 0.5 * sin(u_time * 0.18 + v_noise * 5.0);
  vec3 base = mix(u_colorPrimary, u_colorSecondary, drift);
  vec3 color = mix(base, u_colorAccent, fresnel);
  color += v_noise * 0.5;
  color += fresnel * 0.18;

  // Mute blends the whole body toward dormant slate and flattens the rim.
  color = mix(color, u_colorMuted, u_mute * 0.85);

  // Translucent core, luminous rim — soap-bubble, not solid ball.
  float alpha = mix(0.35, 0.9, fresnel) + u_amp * 0.2;
  alpha = mix(alpha, alpha * 0.55, u_mute);
  gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
}
`;

export type SpineBlobUniforms = {
  u_time: { value: number };
  u_amp: { value: number };
  u_mute: { value: number };
  u_seed: { value: number };
  u_colorPrimary: { value: THREE.Color };
  u_colorSecondary: { value: THREE.Color };
  u_colorAccent: { value: THREE.Color };
  u_colorMuted: { value: THREE.Color };
};

export function createSpineBlobMaterial(opts: {
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  seed: number;
}): THREE.ShaderMaterial & { uniforms: SpineBlobUniforms } {
  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    transparent: true,
    depthWrite: false,
    uniforms: {
      u_time: { value: 0 },
      u_amp: { value: 0 },
      u_mute: { value: 1 },
      u_seed: { value: opts.seed },
      u_colorPrimary: { value: new THREE.Color(opts.primary) },
      u_colorSecondary: { value: new THREE.Color(opts.secondary) },
      u_colorAccent: { value: new THREE.Color(opts.accent) },
      u_colorMuted: { value: new THREE.Color(opts.muted) },
    },
  });
  return material as THREE.ShaderMaterial & { uniforms: SpineBlobUniforms };
}
