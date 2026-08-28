import { VERT } from './gradient.vert';
import { FRAG } from './gradient.frag';
import { clamp } from '@/lib/math';

/**
 * THE GRADIENT FIELD
 * ------------------------------------------------------------------
 * A fullscreen triangle running fbm -> domain warping -> an OKLab palette.
 *
 * The field's ONLY motion source is uTime, paced by pointer activity. Scroll
 * must never offset it or it stops feeling locked to the page.
 */

/**
 * v04 CTA RIPPLE STATE. A hover launches ONE burst and that burst runs to
 * completion on its own clock; leaving the button does not cut it short and
 * staying on the button does not repeat it. Re-entering fires a fresh one.
 *
 * Module-level because the ripple is fired by buttons that live on a different
 * canvas from the one that draws it — the falloff is what erases an off-canvas
 * source, not a coordinate clamp.
 */
export const RIP = { x: -9999, y: -9999, w: 0, h: 0, a: 0, t: 0, prev: 0 };
/** decay 4.4 leaves nothing by here */
const RIP_LIFE = 1.0;

export function stepRipple(now: number) {
  const dt = Math.min((now - (RIP.prev || now)) / 1000, 0.05);
  RIP.prev = now;
  if (RIP.a <= 0) return;
  RIP.t += dt;
  if (RIP.t > RIP_LIFE) {
    RIP.a = 0;
    RIP.t = 0;
  }
}

export function fireRipple(el: Element) {
  const b = el.getBoundingClientRect();
  RIP.x = b.left + b.width / 2;
  RIP.y = b.top + b.height / 2;
  RIP.w = b.width;
  RIP.h = b.height;
  /* Only restart the clock if the previous burst has essentially finished.
     Re-entering mid-flight used to snap the live rings back to the button. */
  if (RIP.a <= 0 || RIP.t > 0.55) RIP.t = 0;
  RIP.a = 1;
}

/**
 * v03 dark-mode line: substantially brighter and more saturated than the
 * splash-matched sage — the zero-red emeralds are back in the mids and the top
 * light is The Rollup copper. The type holds against it because the DARKENING
 * moved into local scrims (.herotype and .side), not because the field stays
 * dim. The floor is a green-gray, never black.
 */
const STOPS = ['#081511', '#0E3A26', '#00875A', '#10D492', '#A9DEC4', '#E8A470'];

/** sRGB -> OKLab on the CPU, so the shader interpolates perceptually rather
 *  than muddying through sRGB. */
function srgbToOklab(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const c = [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255].map((v) =>
    v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4),
  );
  const l = 0.4122214708 * c[0] + 0.5363325363 * c[1] + 0.0514459929 * c[2];
  const m = 0.2119034982 * c[0] + 0.6806995451 * c[1] + 0.1073969566 * c[2];
  const s = 0.0883024619 * c[0] + 0.2817188376 * c[1] + 0.6299787005 * c[2];
  const l_ = Math.cbrt(l),
    m_ = Math.cbrt(m),
    s_ = Math.cbrt(s);
  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
}

export type GradientField = {
  el: HTMLCanvasElement;
  resize: () => void;
  draw: (
    time: number,
    surge: number,
    px: number,
    py: number,
    inx: number,
    iny: number,
    lift?: number,
  ) => void;
};

export function makeGradientField(cv: HTMLCanvasElement | null): GradientField | null {
  if (!cv) return null;
  let gl: WebGLRenderingContext | null = null;
  try {
    gl = (cv.getContext('webgl', {
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    }) || cv.getContext('experimental-webgl')) as WebGLRenderingContext | null;
  } catch {
    return null;
  }
  if (!gl) return null;
  const g = gl;

  const sh = (type: number, src: string) => {
    const s = g.createShader(type)!;
    g.shaderSource(s, src);
    g.compileShader(s);
    if (!g.getShaderParameter(s, g.COMPILE_STATUS)) {
      console.warn(g.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const vs = sh(g.VERTEX_SHADER, VERT);
  const fs = sh(g.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const pr = g.createProgram()!;
  g.attachShader(pr, vs);
  g.attachShader(pr, fs);
  g.linkProgram(pr);
  if (!g.getProgramParameter(pr, g.LINK_STATUS)) {
    console.warn(g.getProgramInfoLog(pr));
    return null;
  }
  g.useProgram(pr);

  const buf = g.createBuffer();
  g.bindBuffer(g.ARRAY_BUFFER, buf);
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
  const loc = g.getAttribLocation(pr, 'a');
  g.enableVertexAttribArray(loc);
  g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);

  const U = {
    res: g.getUniformLocation(pr, 'uRes'),
    time: g.getUniformLocation(pr, 'uTime'),
    surge: g.getUniformLocation(pr, 'uSurge'),
    ptr: g.getUniformLocation(pr, 'uPtr'),
    inset: g.getUniformLocation(pr, 'uIn'),
    lift: g.getUniformLocation(pr, 'uLift'),
    rip: g.getUniformLocation(pr, 'uRip'),
    ript: g.getUniformLocation(pr, 'uRipT'),
    rips: g.getUniformLocation(pr, 'uRipS'),
    scy: g.getUniformLocation(pr, 'uScY'),
    pal: g.getUniformLocation(pr, 'uPal'),
  };

  const flat: number[] = [];
  STOPS.forEach((h) => flat.push(...srgbToOklab(h)));
  g.uniform3fv(U.pal, new Float32Array(flat));

  let w = 0,
    h = 0;
  function resize() {
    /* Render small and let the upscale do most of the softening. A CSS blur has
       to be recomputed over the whole surface every frame the canvas repaints,
       and Safari is far slower at large radii than Chrome — this was the main
       source of the stutter there. At this scale each canvas pixel covers ~3
       CSS px, so bilinear upscaling is worth several px of blur for free and
       the CSS radius can drop by more than half. The field is low-frequency;
       you cannot see the resolution, only the cost. */
    const s = Math.min(window.devicePixelRatio || 1, 1.5) * 0.25;
    const nw = Math.max(2, Math.round(cv!.clientWidth * s));
    const nh = Math.max(2, Math.round(cv!.clientHeight * s));
    if (nw === w && nh === h) return;
    w = cv!.width = nw;
    h = cv!.height = nh;
    g.viewport(0, 0, w, h);
    g.uniform2f(U.res, w, h);
  }

  return {
    el: cv,
    resize,
    draw(time, surge, px, py, inx, iny, lift) {
      g.uniform1f(U.time, time);
      g.uniform1f(U.surge, surge);
      g.uniform2f(U.inset, inx || 0, iny || 0);
      g.uniform1f(U.lift, lift || 0);
      /* scroll parallax — 0.05 canvas-heights per viewport scrolled. Position-
         mapped so it mirrors perfectly on reverse scroll. */
      g.uniform1f(U.scy, (window.scrollY || 0) / Math.max(window.innerHeight, 1) * 0.05);
      const r = cv!.getBoundingClientRect();
      /* smoothed pointer, mapped into THIS canvas's own uv space (y up).
         Clamped a little beyond 0..1 so the mass can lean off-frame without the
         coordinate running away when the cursor is far from the canvas. */
      g.uniform2f(
        U.ptr,
        clamp((px - r.left) / Math.max(r.width, 1), -0.35, 1.35),
        clamp(1 - (py - r.top) / Math.max(r.height, 1), -0.35, 1.35),
      );
      /* the ripple centre goes through the same mapping but is NOT clamped: a
         button on another canvas has to be allowed to land far outside this one
         so the falloff can erase it rather than pinning it to an edge. */
      g.uniform3f(
        U.rip,
        (RIP.x - r.left) / Math.max(r.width, 1),
        1 - (RIP.y - r.top) / Math.max(r.height, 1),
        RIP.a,
      );
      g.uniform1f(U.ript, RIP.t);
      /* Half-extent in the metric used above. uv.x is divided by r.width then
         multiplied by the aspect ratio, so both axes end up denominated by
         r.height — which is why the x term uses r.height too. */
      g.uniform2f(
        U.rips,
        (RIP.w * 0.5) / Math.max(r.height, 1),
        ((RIP.h * 0.5) / Math.max(r.height, 1)) * 1.15,
      );
      g.drawArrays(g.TRIANGLES, 0, 3);
    },
  };
}
