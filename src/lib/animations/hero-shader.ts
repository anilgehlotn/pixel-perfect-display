/**
 * Homepage hero renderer (WebGL 1, one full-screen quad, two photos).
 *
 * Draws the black and white serum photo and the colour tea photo, and "steeps" the colour into
 * the black and white like tea spreading through water:
 * - a ripple ring that refracts the photo where the drop lands,
 * - an organic, slowly shifting edge (fractal noise) instead of a hard circle,
 * - a warm glowing rim with a slight colour split along it (light through a glass of tea),
 * - a warm stain just ahead of the edge, before the colour arrives,
 * - film grain and the same top/bottom shading as the DOM fallback.
 *
 * It renders only when something changes (scroll progress, pointer, or the living edge while
 * the transition is in between), so a still hero costs nothing. Device pixel ratio is capped.
 * If WebGL is missing or the context is lost, `createHeroRenderer` returns null / calls
 * `onLost`, and the hero falls back to a plain DOM crossfade.
 */

export type HeroUniforms = {
  /** Colour spread, 0 (black and white) to 1 (all colour). */
  bloom: number;
  /** Ripple ring, 0 (at the impact point) to 1 (gone). */
  ripple: number;
  /** Extra darkening of the black and white photo, 0 to 1. */
  dim: number;
  /** Zoom of the black and white photo (1 = cover). */
  zoomA: number;
  /** Zoom of the colour photo (1 = cover). */
  zoomB: number;
  /** Impact point in 0-1 coordinates from the top left of the canvas. */
  impactX: number;
  impactY: number;
  /** Pointer depth offset, -1 to 1 on each axis (desktop). */
  tiltX: number;
  tiltY: number;
};

type Photo = { img: HTMLImageElement; focusX: number; focusY: number };

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uA;
uniform sampler2D uB;
uniform vec2 uRes;
uniform vec2 uSizeA;
uniform vec2 uSizeB;
uniform vec2 uFocusA;
uniform vec2 uFocusB;
uniform float uPad;
uniform float uBloom;
uniform float uRipple;
uniform float uDim;
uniform float uZoomA;
uniform float uZoomB;
uniform vec2 uImpact;
uniform vec2 uTilt;
uniform float uTime;

const vec3 INK = vec3(0.1216);
const vec3 LUM = vec3(0.299, 0.587, 0.114);

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

// object-fit: cover with object-position (focus) and an extra zoom, on a box uPad px larger
// than the canvas on every side (matches the DOM photo, which has room for pointer depth).
vec2 cover(vec2 uv, vec2 size, vec2 focus, float zoom, vec2 shift) {
  vec2 box = uRes + 2.0 * uPad;
  vec2 b = (uv * uRes + uPad + shift) / box;
  float rb = box.x / box.y;
  float ri = size.x / size.y;
  vec2 s = rb > ri ? vec2(1.0, ri / rb) : vec2(rb / ri, 1.0);
  s /= zoom;
  return (b - 0.5) * s + 0.5 + (focus - 0.5) * (1.0 - s);
}

// The DOM fallback's gradient shade: top, middle and bottom strengths.
vec3 shade(vec3 c, float y, vec3 k) {
  float a = y > 0.5 ? mix(k.y, k.x, (y - 0.5) * 2.0) : mix(k.z, k.y, y * 2.0);
  return mix(c, INK, a);
}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 sc = vec2(aspect, 1.0);
  vec2 p = uv * sc;
  vec2 c = uImpact * sc;
  vec2 toP = p - c;
  float d = length(toP);
  vec2 dir = toP / max(d, 1e-4);

  // Farthest corner from the impact point: the colour must reach it.
  float maxR = max(max(length(c), length(c - vec2(aspect, 0.0))),
                   max(length(c - vec2(0.0, 1.0)), length(c - sc)));

  // Ripple ring: a travelling wave that bends the photo, fading as it spreads.
  float ringR = uRipple * maxR * 0.9;
  float ringFade = (1.0 - uRipple) * step(0.0001, uRipple);
  float ring = exp(-pow((d - ringR) * 9.0, 2.0)) * ringFade;
  float wave = sin((d - ringR) * 70.0) * ring;

  // The colour edge: a circle roughed up by slow fractal noise, so it spreads like tea
  // steeping in water. The roughness is largest mid-way and settles as it fills.
  float grow = smoothstep(0.0, 0.08, uBloom);
  float R = uBloom * (maxR + 0.45) - 0.03;
  float n1 = fbm(p * 2.4 + vec2(uTime * 0.05, -uTime * 0.04));
  float n2 = fbm(p * 7.0 - vec2(uTime * 0.09, uTime * 0.07));
  float rough = (n1 - 0.5) * 0.42 * grow * (1.0 - uBloom * 0.55) + (n2 - 0.5) * 0.07 * grow;
  float edge = d - R + rough;
  float mask = (1.0 - smoothstep(-0.012, 0.012, edge)) * step(0.0005, uBloom);
  // The rim grows in gently (no hot spot while the colour is still small) and fades at the end.
  float rimIn = smoothstep(0.03, 0.3, uBloom);
  float band = exp(-pow(edge * 16.0, 2.0)) * rimIn * (1.0 - smoothstep(0.88, 1.0, uBloom));

  // Liquid lens: the ripple and the edge both refract the photo outward.
  vec2 disp = dir * (wave * 0.010 + band * 0.018) / sc;
  vec2 uvD = uv + disp;
  vec2 tilt = uTilt * uPad;

  // Black and white world: grayscale, brightness 0.8, contrast 1.08, then dimmed and shaded.
  vec3 a = texture2D(uA, cover(uvD, uSizeA, uFocusA, uZoomA, tilt * 0.6)).rgb;
  float g = dot(a, LUM);
  g = ((g - 0.5) * 1.08 + 0.5) * 0.8;
  vec3 A = vec3(g);
  A = shade(A, uv.y, vec3(0.6, 0.35, 0.7));
  A = mix(A, INK, uDim);

  // Tea stain creeping just ahead of the edge.
  float ahead = exp(-max(edge, 0.0) * 7.0) * (1.0 - mask) * grow * (1.0 - uBloom);
  A = mix(A, A * vec3(1.18, 0.98, 0.78) + vec3(0.04, 0.02, 0.0), ahead * 0.85);

  // Colour world, with a slight colour split along the rim.
  vec2 uvB = cover(uvD, uSizeB, uFocusB, uZoomB, tilt);
  vec2 split = dir * band * 0.007 / sc;
  vec3 B = vec3(texture2D(uB, uvB + split).r, texture2D(uB, uvB).g, texture2D(uB, uvB - split).b);
  B = mix(vec3(dot(B, LUM)), B, 1.15);
  B = shade(B, uv.y, vec3(0.4, 0.1, 0.7));

  vec3 col = mix(A, B, mask);
  // Warm glowing rim.
  col += vec3(1.0, 0.76, 0.55) * band * 0.38;
  // Ripple highlight.
  col += vec3(0.9) * max(wave, 0.0) * 0.12;
  // Film grain.
  col += (hash(uv * uRes + fract(uTime * 7.0) * 311.0) - 0.5) * 0.045;

  gl_FragColor = vec4(col, 1.0);
}`;

export type HeroRenderer = {
  set: (u: Partial<HeroUniforms>) => void;
  /** Draw now (call from requestAnimationFrame). `time` in seconds. */
  draw: (time: number) => void;
  resize: () => void;
  destroy: () => void;
};

export function createHeroRenderer(
  canvas: HTMLCanvasElement,
  photos: { a: Photo; b: Photo },
  opts: { maxDpr: number; pad: number; onLost: () => void },
): HeroRenderer | null {
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.warn("[hero] shader:", gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };
  // Phones without highp in fragment shaders fall back to mediump.
  const hp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  const frag = hp && hp.precision > 0 ? FRAG : FRAG.replace("precision highp", "precision mediump");
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, frag);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const loc = (n: string) => gl.getUniformLocation(prog, n);
  const L = {
    res: loc("uRes"),
    sizeA: loc("uSizeA"),
    sizeB: loc("uSizeB"),
    focusA: loc("uFocusA"),
    focusB: loc("uFocusB"),
    pad: loc("uPad"),
    bloom: loc("uBloom"),
    ripple: loc("uRipple"),
    dim: loc("uDim"),
    zoomA: loc("uZoomA"),
    zoomB: loc("uZoomB"),
    impact: loc("uImpact"),
    tilt: loc("uTilt"),
    time: loc("uTime"),
  };

  const texture = (unit: number, img: HTMLImageElement, name: string) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(loc(name), unit);
    return t;
  };
  const texA = texture(0, photos.a.img, "uA");
  const texB = texture(1, photos.b.img, "uB");
  gl.uniform2f(L.sizeA, photos.a.img.naturalWidth, photos.a.img.naturalHeight);
  gl.uniform2f(L.sizeB, photos.b.img.naturalWidth, photos.b.img.naturalHeight);
  // Textures are flipped (y up), so object-position's y is measured from the bottom.
  gl.uniform2f(L.focusA, photos.a.focusX, 1 - photos.a.focusY);
  gl.uniform2f(L.focusB, photos.b.focusX, 1 - photos.b.focusY);

  const u: HeroUniforms = {
    bloom: 0,
    ripple: 0,
    dim: 0,
    zoomA: 1,
    zoomB: 1.15,
    impactX: 0.5,
    impactY: 0.6,
    tiltX: 0,
    tiltY: 0,
  };
  let dpr = 1;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, opts.maxDpr);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
    gl.uniform2f(L.res, w, h);
    gl.uniform1f(L.pad, opts.pad * dpr);
  };

  const onLost = (e: Event) => {
    e.preventDefault();
    opts.onLost();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  resize();
  return {
    set: (next) => Object.assign(u, next),
    draw: (time) => {
      if (gl.isContextLost()) return;
      gl.uniform1f(L.bloom, u.bloom);
      gl.uniform1f(L.ripple, u.ripple);
      gl.uniform1f(L.dim, u.dim);
      gl.uniform1f(L.zoomA, u.zoomA);
      gl.uniform1f(L.zoomB, u.zoomB);
      gl.uniform2f(L.impact, u.impactX, 1 - u.impactY);
      gl.uniform2f(L.tilt, u.tiltX, -u.tiltY);
      gl.uniform1f(L.time, time);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    resize,
    destroy: () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteTexture(texA);
      gl.deleteTexture(texB);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}
