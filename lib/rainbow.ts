/**
 * Shader overlay for the balloon letters (rainbow).
 *
 * A second, transparent WebGL canvas sits on top of the letters. The letters' shape is
 * uploaded as a mask texture every frame, and the fragment shader paints a slowly moving
 * iridescent rainbow inside it, with a soft bump-lit sheen and a fine grain.
 *
 * Ingredients (both are popular, well-known techniques by Inigo Quilez):
 *  - cosine palettes:  color(t) = a + b·cos(2π(c·t + d))   https://iquilezles.org/articles/palettes/
 *  - domain warping:   fbm(p + fbm(p + fbm(p)))             https://iquilezles.org/articles/warp/
 */

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const RAINBOW_FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v_uv;
uniform sampler2D u_mask;
uniform float u_time;
uniform float u_mix;
uniform float u_aspect;
uniform float u_scale;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(17.0, 9.0);
    a *= 0.5;
  }
  return v;
}

// Inigo Quilez cosine palette (the classic rainbow: d = 0, 0.33, 0.67)
vec3 pal(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}

void main() {
  float a = texture2D(u_mask, v_uv).a;
  if (a < 0.004) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec2 p = vec2(v_uv.x * u_aspect, v_uv.y) * u_scale;
  float t = u_time * 0.06;

  // domain warping
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.7),
                fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.6));
  float h = fbm(p + 3.0 * r);

  // colour: warped rainbow, nudged toward cool blues / violets / teals
  float hue = h * 1.1 + q.x * 0.5 + v_uv.x * 0.35 + u_time * 0.02;
  vec3 col = pal(hue);
  col = mix(col, pal(hue + 0.25 + v_uv.y * 0.4), 0.35);   // second gradient layer
  col *= vec3(0.80, 0.92, 1.12);                            // cool tint
  col = mix(vec3(dot(col, vec3(0.299, 0.587, 0.114))), col, 1.15); // a touch more saturation

  // texture: bump-lit from the noise height, plus a soft specular sheen
  vec2 e = vec2(0.012, 0.0);
  float hx = fbm(p + 3.0 * r + e.xy) - h;
  float hy = fbm(p + 3.0 * r + e.yx) - h;
  vec3 n = normalize(vec3(-hx * 16.0, -hy * 16.0, 1.0));
  vec3 L = normalize(vec3(-0.4, 0.6, 0.7));
  float diff = dot(n, L) * 0.5 + 0.5;
  float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 24.0);
  col *= 0.80 + 0.40 * diff;
  col += spec * 0.30;

  // fine grain + paper-fibre texture
  col += (hash(gl_FragCoord.xy) - 0.5) * 0.09;
  col *= 0.96 + 0.08 * noise(gl_FragCoord.xy * 0.35);

  float m = u_mix * a;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0) * m, m);
}`;


export type ShaderVariant = "rainbow";

/** There is a single shader now: the rainbow. */
export function getShaderVariant(): ShaderVariant {
  return "rainbow";
}

export type Rainbow = {
  variant: ShaderVariant;
  canvas: HTMLCanvasElement;
  resize: (cssW: number, cssH: number, dpr: number) => void;
  /** `scale` = rainbow pattern frequency (higher = finer detail). `bevel` = bubble puffiness in CSS px. */
  render: (mask: HTMLCanvasElement, mix: number, time: number, scale?: number, bevel?: number) => void;
  clear: () => void;
  destroy: () => void;
};

export function createRainbow(): Rainbow | null {
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;display:block;";
  const gl = canvas.getContext("webgl", {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
  });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn("rainbow shader:", gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const variant = getShaderVariant();
  const fs = compile(gl.FRAGMENT_SHADER, RAINBOW_FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const uTime = gl.getUniformLocation(prog, "u_time");
  const uMix = gl.getUniformLocation(prog, "u_mix");
  const uAspect = gl.getUniformLocation(prog, "u_aspect");
  const uScale = gl.getUniformLocation(prog, "u_scale");
  const uTexel = gl.getUniformLocation(prog, "u_texel");
  const uBevel = gl.getUniformLocation(prog, "u_bevel");
  let glDpr = 1;
  gl.uniform1i(gl.getUniformLocation(prog, "u_mask"), 0);
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  return {
    variant,
    canvas,
    resize(cssW, cssH, dpr) {
      glDpr = dpr;
      canvas.width = Math.max(1, Math.round(cssW * dpr));
      canvas.height = Math.max(1, Math.round(cssH * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    render(mask, mix, time, scale = 1.5, bevel = 20) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
      gl.uniform1f(uTime, time);
      gl.uniform1f(uMix, mix);
      gl.uniform1f(uScale, scale);
      gl.uniform2f(uTexel, 1 / canvas.width, 1 / canvas.height);
      gl.uniform1f(uBevel, bevel * glDpr);
      gl.uniform1f(uAspect, canvas.width / canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    clear() {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    },
    destroy() {
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
