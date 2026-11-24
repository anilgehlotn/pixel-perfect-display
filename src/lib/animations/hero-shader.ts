/**
 * Homepage hero renderer (WebGL 1, one full-screen quad, two photos).
 *
 * Draws the black and white serum photo and the colour tea photo. After the drop lands, two
 * fine ripples gently bend the photo and the colour spreads out from the impact point in one
 * clean, round wave with a soft feathered edge (grey rising to full colour inside the edge),
 * with film grain and the same top/bottom shading as the DOM fallback.
 *
 * It renders only when something changes (scroll progress, pointer, or the ripples while they
 * spread), so a still hero costs nothing. Device pixel ratio is capped.
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

  // Ripples: two fine rings travelling out from the impact (the second slower and softer),
  // fading quickly. They only bend the photo slightly, like a real water surface.
  float ringFade = pow(1.0 - uRipple, 1.6) * step(0.0001, uRipple);
  float r1 = uRipple * maxR * 0.85;
  float r2 = uRipple * maxR * 0.5;
  float ring1 = exp(-pow((d - r1) * 14.0, 2.0));
  float ring2 = exp(-pow((d - r2) * 18.0, 2.0)) * 0.55;
  float wave = (sin((d - r1) * 110.0) * ring1 + sin((d - r2) * 130.0) * ring2) * ringFade;

  // The colour: one clean, perfectly round wave from the impact point with a soft feathered
  // edge (smootherstep), no glow or distortion. It starts just under the drop and reaches
  // the farthest corner at 1.
  float F = 0.11;
  float R = uBloom * (maxR + 2.0 * F) - F;
  float t = clamp((R + F - d) / (2.0 * F), 0.0, 1.0);
  float mask = t * t * t * (t * (t * 6.0 - 15.0) + 10.0) * step(0.0005, uBloom);

  // Only the ripples bend the photo, very slightly.
  vec2 uvD = uv + dir * wave * 0.0045 / sc;
  vec2 tilt = uTilt * uPad;

  // Black and white world: grayscale, brightness 0.8, contrast 1.08, then dimmed and shaded.
  vec3 a = texture2D(uA, cover(uvD, uSizeA, uFocusA, uZoomA, tilt * 0.6)).rgb;
  float g = dot(a, LUM);
  g = ((g - 0.5) * 1.08 + 0.5) * 0.8;
  vec3 A = vec3(g);
  A = shade(A, uv.y, vec3(0.6, 0.35, 0.7));
  A = mix(A, INK, uDim);

  // Colour world. Inside the soft edge the colour comes up gradually (from grey to full
  // colour), so the two photos never look like a double exposure.
  vec3 B = texture2D(uB, cover(uvD, uSizeB, uFocusB, uZoomB, tilt)).rgb;
  B = mix(vec3(dot(B, LUM)), B, 1.15 * mask);
  B = shade(B, uv.y, vec3(0.4, 0.1, 0.7));

  vec3 col = mix(A, B, mask);
  // Ripple highlight (faint).
  col += vec3(1.0, 0.95, 0.88) * max(wave, 0.0) * 0.03;
  // Film grain (still).
  col += (hash(uv * uRes) - 0.5) * 0.04;

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
