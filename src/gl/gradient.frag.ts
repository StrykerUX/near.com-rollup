/**
 * Gradient field: fbm -> domain warping -> OKLab palette.
 *
 * Ported verbatim from the original single-file build. Kept as a template
 * string rather than a .glsl import so the shader needs no bundler loader and
 * travels with the module that compiles it.
 */
export const FRAG = /* glsl */ `
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform float uSurge;
uniform vec2  uPtr;   /* smoothed pointer in THIS canvas's uv space, y up.
                         May sit outside 0..1 when the cursor is off the canvas. */
uniform float uScY;   /* scroll parallax, in fractions of canvas height. The
                         field slides UP by this much as the page scrolls down
                         (and back down in reverse). POSITION-mapped, never
                         velocity — see the note above sp. */
uniform vec3  uRip;   /* xy = ripple centre in THIS canvas's uv (y up),
                         z  = amplitude 0..1, eased by JS on hover in/out. */
uniform float uRipT;  /* seconds since the hover began. Drives the wave phase,
                         so the first ring actually starts at the button
                         instead of the field already being mid-ripple. */
uniform vec2  uRipS;  /* the CTA's half-extent in the same metric as the
                         distance below, so the rings are offsets of the
                         BUTTON rather than circles centred on it. */
uniform float uLift;  /* per-canvas floor lift, 0..1. The CTA canvas passes 1
                         so its permanently-boxed gradient sits at the same
                         brightness as the SHRUNK plate — same knob as shr,
                         supplied directly because gl2 is never clipped and
                         must not trigger the uvV remap. */
uniform vec2  uIn;    /* fraction of each axis clipped away PER SIDE by the
                         plate contraction. The edge/vignette frame is computed
                         in the VISIBLE box's own space, so the shrunk plate
                         carries the same bright frame + protected middle as
                         the full-bleed state — not a crop of the dark centre. */
uniform vec3  uPal[6];

/* ---- Ashima 2D simplex noise ---- */
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                     -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0))
                          + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

/* ---- fbm, rotating between octaves to decorrelate the lattice ---- */
float fbm(vec2 p){
  const mat2 R = mat2(0.80, 0.60, -0.60, 0.80);
  float v = 0.0, a = 0.5;
  for(int i = 0; i < 3; i++){
    v += a * snoise(p);
    p = R * p * 2.02;
    a *= 0.5;
  }
  return v;
}

/* ---- OKLab → sRGB ---- */
vec3 oklabToLinear(vec3 c){
  float l_ = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
  float m_ = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
  float s_ = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
  vec3 lms = vec3(l_*l_*l_, m_*m_*m_, s_*s_*s_);
  return vec3(
     4.0767416621*lms.x - 3.3077115913*lms.y + 0.2309699292*lms.z,
    -1.2684380046*lms.x + 2.6097574011*lms.y - 0.3413193965*lms.z,
    -0.0041960863*lms.x - 0.7034186147*lms.y + 1.7076147010*lms.z);
}
vec3 linearToSrgb(vec3 c){
  c = max(c, 0.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(0.0031308, c));
}
/* six-stop ramp interpolated in OKLab, so midpoints stay saturated */
vec3 palette(float t){
  float s = clamp(t, 0.0, 1.0) * 5.0;
  vec3 c = uPal[0];
  c = mix(c, uPal[1], smoothstep(0.0, 1.0, s));
  c = mix(c, uPal[2], smoothstep(1.0, 2.0, s));
  c = mix(c, uPal[3], smoothstep(2.0, 3.0, s));
  c = mix(c, uPal[4], smoothstep(3.0, 4.0, s));
  c = mix(c, uPal[5], smoothstep(4.0, 5.0, s));
  return c;
}

/* One expanding ring. age<0 means "not launched yet", which is how the
   second pulse is delayed without a second clock. reach caps how far it
   travels so the ripple stays a local event near the button. */
float ripPulse(float rd, float age, float speed, float reach){
  float live = step(0.0, age);
  float R    = age * speed;
  float ring = exp(-((rd - R) * (rd - R)) / 0.0012);
  /* ATTACK. This is what the flicker behind the button was. At age 0 the ring
     peaks at rd = 0 — exactly the button's outline — with fade at 1.0, so a
     full-strength bright collar appeared hugging the pill on the first frame
     and then rushed outward. Reading it as "a flash behind the button" was
     correct; it was the ripple's own first frame, not a compositing artefact.
     The pulse now rises from nothing over 130ms, by which point R has carried
     it ~55px clear of the edge, so the wave is already leaving when it becomes
     visible. Fade eased 4.4 -> 3.8 to hold the same peak brightness once the
     attack is taking its cut. */
  float atk  = smoothstep(0.0, 0.13, age);
  float fade = exp(-age * 3.8);
  float lim  = 1.0 - smoothstep(reach * 0.72, reach, R);
  return live * atk * ring * fade * lim;
}

void main(){
  vec2 uv  = gl_FragCoord.xy / uRes;
  float ar = uRes.x / uRes.y;
  vec2 p   = vec2(uv.x * ar, uv.y);

  float t    = uTime * 0.05;
  float zoom = 1.0 - uSurge * 0.22;
  /* very low base frequency + a single shallow warp: broad glassy masses,
     not marbling. Depth of warp is what made the old version read liquid. */
  /* Scroll parallax: uScY is a pure function of scroll POSITION, so the slide
     is deterministic and reverses exactly on the way back up. Feeding scroll
     VELOCITY here (tried once) shifts the field every tick and springs back,
     which reads as the gradient coming unstuck from the page — never do that.
     The offset lands on sp only: the noise masses and sheen slide; the ramp,
     pointer mass and vignettes stay anchored to the frame. */
  vec2  sp   = p * (0.30 * zoom);
  sp.y      -= uScY * 0.30;

  vec2  q = vec2(fbm(sp + vec2(0.0, t)),
                 fbm(sp + vec2(4.7, 1.9) - t * 0.55));
  float f = fbm(sp + 0.95 * q + vec2(0.0, t * 0.30));

  /* edge factor — 0 at the centre, 1 at the frame edge.
     Every bright term is multiplied by this, so the middle of the canvas
     (where all the type lives) stays a dark mid-green. */
  /* portrait widens the protected centre horizontally: at 390px the headline
     spans nearly the full frame, so the same 1.10 weighting that is safe on
     desktop lets glyph edges reach into the bright zone. Desktop (ar>1.35)
     is untouched. */
  float pxw  = mix(0.66, 1.10, smoothstep(0.75, 1.35, ar));
  float protP = 1.0 - smoothstep(0.75, 1.35, ar);   /* 1 on portrait, 0 desktop */
  /* uvV: uv remapped into the visible (clipped) box, 0..1 across what the
     viewer can actually see. Identical to uv while the plate is full bleed. */
  vec2  uvV  = (uv - uIn) / max(vec2(1.0) - uIn * 2.0, vec2(1e-3));
  /* how far into the plate contraction we are: 0 full-bleed, 1 fully shrunk.
     The small box reads darker than the same composition at full bleed (less
     bright area in absolute terms, and it sits on a LIGHT page), so the
     centre floors get a lift that only exists while shrunk. */
  float shr  = max(clamp((uIn.x - 0.07) * 6.0, 0.0, 1.0), uLift);
  vec2  c    = vec2((uvV.x - 0.5) * pxw, (uvV.y - 0.5) * 1.30);
  float edge = smoothstep(0.26, 0.92, length(c) * 1.45);

  /* A SECOND, much broader and slower field. Everything above works at the
     detail scale; the large dark and light masses came only from the static
     ramp and vignettes, so the composition itself never moved — the surface
     shimmered on top of a fixed picture. This is what makes the big shapes
     drift. Very low frequency (0.34x) and its own slow drift. */
  float slow = fbm(sp * 0.34 + vec2(t * 0.21, -t * 0.15) + (uPtr - vec2(0.5)) * 0.55);

  /* composition ramp: dark mass on one side, light on the other — and the
     LIGHT SIDE IS WHEREVER THE POINTER IS. uPtr arrives already smoothed
     (~1.8s settle, JS side), so the composition swings like liquid, it never
     tracks. The autonomous drift \`dr\` stays on top, so the frame keeps
     breathing while the cursor is parked.
     The divisor is the subtle part: near the centre |ld| shrinks below 0.20,
     ldir shortens, and the whole ramp flattens toward its midpoint — carry
     the cursor to the middle and the composition DIFFUSES instead of
     dragging a bright pole through the type. */
  vec2  dr   = vec2(sin(t * 0.47) * 0.07, cos(t * 0.39) * 0.06);
  vec2  ld   = (uPtr - vec2(0.5)) + dr;
  vec2  ldir = ld / max(length(ld), 0.20);
  vec2  d    = uv - vec2(0.5);
  /* ORGANIC WARP (v03): the light boundary used to be dot(d, ldir) — a dead
     straight half-plane, so a cursor riding the frame dragged a linear edge
     along it. The boundary coordinate is now displaced by a slow evolving
     noise pair (q, already computed, plus one fresh octave pair on its own
     clock), so the bright mass is a lobed shape that keeps changing even
     while the pointer is still. Same warp feeds the pointer mass below. */
  vec2  warp = (q + vec2(fbm(sp * 1.7 + vec2(0.0, 3.3) - t * 0.42),
                         fbm(sp * 1.7 + vec2(5.1, 1.2) + t * 0.36))) * 0.5;
  /* SWIRL. Angle is strongest at the pointer and decays outward, so the same
     warp vectors are rotated by different amounts at different radii — that
     shear is the curl. The slow sine keeps it turning while the cursor rests
     rather than freezing into a fixed twist. */
  vec2  sv   = vec2((uv.x - uPtr.x) * ar, (uv.y - uPtr.y) * 1.15);
  float swA  = exp(-length(sv) * 2.0) * (1.25 + sin(t * 0.61) * 0.45);
  float swC  = cos(swA), swS = sin(swA);
  vec2  warpR = vec2(warp.x * swC - warp.y * swS, warp.x * swS + warp.y * swC);

  float ramp = clamp(dot(d + warpR * 0.26, ldir) * 1.02 + 0.48, 0.0, 1.0);
  ramp = pow(ramp, 1.58);

  /* a broad, soft mass parked under the pointer itself — wide enough to read
     as weather, not a spotlight. Added into g BEFORE the centre dim, so the
     legibility floor below still applies to it in full. The warp lobes it —
     an amoeba of light, never a circle. */
  vec2  ppr  = vec2(sv.x * swC - sv.y * swS, sv.x * swS + sv.y * swC);
  vec2  pp   = ppr + warpR * 0.34;
  float prox = exp(-dot(pp, pp) * 3.2);

  /* The slow field is NOT weighted by edge — the big masses are free to drift
     across the middle, which is the whole point of them moving. Legibility is
     protected by DIMMING whatever arrives there, below, not by keeping it out. */
  /* CTA RIPPLE. Two discrete pulses per hover, not a standing wave: one
     full-strength ring, then a smaller one a beat behind it, each expanding a
     short way and dying. A continuously emanating field read as an animation
     playing AT you; a burst reads as the pointer having struck the surface.
     Each pulse is a gaussian ring whose radius is age*speed, faded by age and
     stopped by \`lim\` so it cannot run across the whole canvas. The 1.15 on y
     matches the aspect correction prox uses, so the rings stay circular.
     Modulating g rather than displacing uv means the ripple rides the palette
     the field already uses, so it can never introduce an off-brand colour.
     Ring width was tightened from 0.0032 to 0.0012: at the wider setting the
     gaussian was ~80px across against a 430px reach, so it read as a soft
     bloom rather than a ripple.
     Tuning: pulses 110ms apart (was 200), travelling at 0.30/0.26 (was
     0.45/0.40), amplitude 0.57 (was 0.95, so 40% less), decay 4.4 (was 3.6).
     With the slower travel the reach cap barely engages any more — the decay
     is what ends the ripple, which is the right way round for a wave. */
  /* Distance to the BUTTON, not to its centre: a rounded-box field, so every
     ring is an offset of the CTA's own outline and the ripple leaves the pill
     as a pill instead of a circle that happens to start there. rd is 0 on the
     button edge and grows outward. */
  vec2  dv = vec2((uv.x - uRip.x) * ar, (uv.y - uRip.y) * 1.15);
  vec2  qd = abs(dv) - uRipS;
  float rd = length(max(qd, 0.0)) + min(max(qd.x, qd.y), 0.0);
  float w  = ripPulse(rd, uRipT,        0.30, 0.26)
           + ripPulse(rd, uRipT - 0.11, 0.26, 0.20) * 0.5;
  float rip = w * uRip.z * exp(-rd * 1.6);

  float g = ramp * 0.74 + f * 0.042 + (slow - 0.5) * 0.19 + prox * 0.13 + uSurge * 0.10
          + rip * 0.57;
  g *= mix(0.76 + shr * 0.09, 1.0, edge);                 /* hold the centre down */
  g *= 0.945;                                /* whole field down a step */
  /* and the top of the curve down further. A ceiling clamp did nothing here:
     the peak g in a normal frame sits well under it, so the cap never engaged
     and a flat multiply moved the midtones while the highlight held. Shaping
     the upper range is what actually reaches the bright zone. */
  g *= 1.0 - 0.115 * smoothstep(0.24, 0.62, g);

  g  = clamp(g, 0.0, 0.66 + edge * 0.26);   /* safety cap, rarely reached */

  vec3 col = linearToSrgb(oklabToLinear(palette(g)));

  /* SHEEN — narrow glossy bands following the field, the way light rolls
     across a polished surface. This is the "graphic and shiny" read. */
  /* DIFFUSE. These used to be pow(band, 7) and pow(band, 10) at high frequency,
     which is a narrow, hard-edged highlight — it read as a bright object sliding
     across the surface rather than as light in it. Low exponents and roughly
     half the frequency widen each band enormously; the amplitude comes down to
     match, because a wide band carries far more total light than a narrow one at
     the same peak. Raise the exponents back and the highlight returns. */
  float band  = 0.5 + 0.5 * sin(f * 4.4 + 1.3);
  float sheen = pow(band, 2.0);
  col += vec3(0.12, 0.26, 0.23) * 0.40 * sheen * (0.26 + edge * 0.69);

  float band2  = 0.5 + 0.5 * sin(f * 2.6 - 0.6);
  col += vec3(0.07, 0.17, 0.15) * 0.42 * pow(band2, 3.2) * (0.20 + edge * 0.58);

  /* LEGIBILITY FLOOR. Light is allowed to travel into the middle — it just
     arrives dimmer. This is a final multiply on the composed colour rather than
     a limit on the field, so the shape and the motion are untouched and only
     the luminance under the type comes down. Every headline on this page sits
     in that zone; raise this toward 1.0 and white type starts to disappear
     into the bright passes. */
  col *= mix(0.89 - protP * 0.07 + shr * 0.07, 1.0, edge);

  /* a touch lighter across the board — applied to the composed colour so the
     palette's relationships hold; pull this back down before raising any
     individual term. */
  col *= 1.13;
  /* dark/mid lift: pow < 1 raises the low end and barely touches the top —
     "lighter shadows" without washing the highlights */
  col = pow(max(col, vec3(0.0)), vec3(0.90));
  /* mid-band lift: peaks at +15% around mid grey, fades to nothing at the
     ends — brighter mids without moving the floor or the highlights */
  col *= (vec3(1.0) + 0.60 * col * (vec3(1.0) - col));

  /* weight the lower corners to black */
  float corner = 1.0 - smoothstep(0.0, 1.15, length(vec2(uvV.x * ar, uvV.y) - vec2(-0.08, -0.06)));
  /* the vignette relaxes when the light mass travels into it — otherwise the
     lower-left weighting would swallow the follow the moment the cursor went
     there and the interaction would read as broken in one quadrant. */
  col *= 1.0 - corner * (0.74 - prox * 0.36);
  float br = 1.0 - smoothstep(0.0, 0.86, length(vec2(uv.x * ar, uv.y) - vec2(ar + 0.06, -0.10)));
  col *= 1.0 - br * 0.55;

  gl_FragColor = vec4(col, 1.0);
}
`;
