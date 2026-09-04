import {
  CH_TAB, CH_TITLES, DISC_FACE, HW_RANGE, N, PW_RANGE, SCRUB_TAU,
  SHRINK_TRIG, SNAP_IDLE, SNAP_MS, SNAP_REACH, SNAP_VMAX, TEXT_TAIL, T_COVER,
  entryEnd, scrubT, yForT,
} from '@/lib/schedule';
import { NARROW_MQ } from '@/lib/breakpoints';
import { clamp, easeShrink, lin, qblur, sm, sstep } from '@/lib/math';
import { makeGradientField, fireRipple, stepRipple, RIP } from '@/gl/gradientField';
import { makeVarWriter, sty } from './domCache';
import { callCtaRearm, setActiveFace, setCardMove } from './bus';

/**
 * THE STAGE ENGINE
 * ==================================================================
 * A pure-imperative port of the original scroll-scrub sequence. It is
 * deliberately NOT expressed in React state or as GSAP timelines:
 *
 *   - The composition is a PURE FUNCTION of scroll position. There is no
 *     queue, no per-move timer and no scroll hold. Reverse is the same
 *     composition run backwards, not a second animation with its own
 *     direction. React re-renders would be pure overhead on a function that
 *     runs every frame and touches ~40 elements.
 *   - Every window, exponent and stagger below was tuned by eye against the
 *     real composition. Re-expressing them as ScrollTrigger scrubs changes
 *     what they mean, because a tween's ease warps the windows nested inside
 *     it — the exact bug the "windows on tp, not on the eased value" note
 *     below is about.
 *
 * React owns the markup and the demo-app state; this owns the motion. The two
 * meet at the class names and `data-face` attributes only.
 */

type FaceGroups = { card: HTMLElement[]; left: HTMLElement[]; right: HTMLElement[] };
type Cacheable = HTMLElement & { __kids?: HTMLElement[]; __idle?: number; __surface?: boolean };

export function startStageEngine(): () => void {
  /* THE NARROW COMPOSITION DOES NOT HAVE ONE OF THESE, and this guard is the
     belt to `useStageEngine(!narrow)`'s braces. The hook cannot know the
     viewport until after the first client render — there is no viewport during
     server render, so the first pass has to agree with the markup that arrived
     — which means on a phone it would otherwise start the engine and tear it
     down one commit later. Started for one commit is enough to compile a
     shader, take a WebGL context and leave `#gl.on` behind on a canvas nothing
     is going to draw to again. */
  if (matchMedia(NARROW_MQ).matches) return () => {};

  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const qsa = <T extends Element = HTMLElement>(s: string) =>
    Array.prototype.slice.call(document.querySelectorAll(s)) as T[];

  const stage = document.getElementById('stage');
  const heroEl = document.getElementById('herotype');
  const lockEl = document.getElementById('lockup');
  const morphEl = document.getElementById('morph');
  const nav = document.getElementById('nav');
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (!stage || !heroEl || !lockEl || !morphEl || !nav) return () => {};

  const setVar = makeVarWriter(root);
  const discEl = document.querySelector<HTMLElement>('.perpsdisc');
  const HW = qsa('.hw');
  const PW = qsa('.pw');

  /* The deck is authored in DISPLAY order (Perps, Account, Swap, Earn) — the
     original reordered these nodes at boot because moving ~200 lines of markup
     was riskier than a DOM shuffle. `data-face` still carries the ORIGINAL
     index, because the demo-app wiring selects on it. */
  const faces: FaceGroups = {
    card: qsa('.cswap > .face'),
    left: qsa('.side.l .face'),
    right: qsa('.side.r .face'),
  };

  const chromeTitleEl = document.querySelector<HTMLElement>('.morph > .hhead .atitle');
  const chromeTabEls = qsa('.morph > .tabbar .tab');
  let chromeIdx = -9;
  const showFaceIdx = (i: number) => (i === -1 ? 0 : i);
  function syncChrome(i: number) {
    if (i === chromeIdx || !chromeTitleEl) return;
    chromeIdx = i;
    chromeTitleEl.textContent = CH_TITLES[i];
    for (let t = 0; t < chromeTabEls.length; t++) {
      if (t === CH_TAB[i]) chromeTabEls[t].setAttribute('aria-current', 'page');
      else chromeTabEls[t].removeAttribute('aria-current');
    }
  }

  /* ---- shared stage state --------------------------------------------- */
  let surge = 0, ticking = false;
  let curIdx = -1;
  let cardsBase = 0, boxW = 900, padXMax = 0, padYMax = 0;
  let pastStage = false, stageP = 0, stagePS = -1, scrubPrev = 0;
  let stageLive = 0, heroOut = 0, heroLast = -1;
  let animOn = false, animFrom = 0, animTo = 0, animDir = 1, animPos = 1;
  let booting = true;

  /* the shrink's live clip fractions, read by the GL loop */
  const glInset = (1 - 1 / 1.16) / 2;
  let shrinkT = 0, plateT = 0;
  let shrinkInX = glInset, shrinkInY = glInset;

  /* ---- the shell's two heights ---------------------------------------- */
  /* Cached, because reading computed custom properties every frame is not
     free — and re-read on resize, because they are per breakpoint. The
     viewport cap is applied HERE rather than in CSS so the value stays a plain
     number the height animation can interpolate. */
  let MH0 = 578, MH1 = 452, PEEKY = 0, PEEKS = 1.33;
  function measureShell() {
    const cs = getComputedStyle(root);
    MH1 = parseFloat(cs.getPropertyValue('--m-h')) || 620;
    const x = parseFloat(cs.getPropertyValue('--m-h0-x')) || 0;
    const cap = parseFloat(cs.getPropertyValue('--m-h0-cap')) || 0;
    /* the cap applies to EVERY shell, not just card 0 — they are all the same
       phone-aspect box, and none may outgrow the viewport column */
    if (cap > 0) MH1 = Math.max(340, Math.min(MH1, innerHeight - cap));
    MH0 = MH1 + x;
    if (cap > 0) MH0 = Math.max(MH1, Math.min(MH0, innerHeight - cap));
    root.style.setProperty('--m-h0', MH0.toFixed(1) + 'px');
    /* offsetTop is transform-agnostic, so this is the shell's LAYOUT top; the
       height must be set first or the grid centres the old box. */
    morphEl!.style.height = MH0.toFixed(1) + 'px';
    /* the parked shell renders 33% larger — but never wider than the viewport,
       or narrow screens crop it into an accidental bottom sheet. Measured
       BEFORE the slice, because the slice is derived from it. */
    PEEKS = Math.min(1.33, Math.max(1, (innerWidth * 0.94) / Math.max(morphEl!.offsetWidth, 1)));
    /* THE PEEK SLICE. A flat 300px meant the parked card showed a different
       amount of interface at every breakpoint. It is now derived from where the
       Receive/Send row actually sits, so the SAME thing breaks the bottom edge
       everywhere — the top ~26px of the two buttons. offsetTop is walked rather
       than measured with a rect because the shell already carries the peek
       transform and a rect would fold the scale in twice. */
    const segEl = morphEl!.querySelector<HTMLElement>('.seg');
    let segY = 0;
    for (let n: HTMLElement | null = segEl; n && n !== morphEl; n = n.offsetParent as HTMLElement | null)
      segY += n.offsetTop;
    if (!segEl) segY = 170;
    const slice = Math.min(innerHeight * 0.42, segY * PEEKS + 26);
    /* .herotype reserves exactly this much at its foot, so the copy centres in
       the real band between the nav and the card instead of a guessed one. */
    root.style.setProperty('--peek', slice.toFixed(1) + 'px');
    PEEKY = Math.max(0, innerHeight - slice - morphEl!.offsetTop);

    /* ---- WHERE THE SCROLL CUE GOES --------------------------------------
       Under the device, which is a position no stylesheet can name: the shell
       sits in the lockup's right-hand grid column, so its centre depends on
       the column widths, the gap, the gutter and the 1220 cap all at once.
       Two numbers, measured where they are already being measured.

       LAYOUT OFFSETS, NOT A RECT. `offsetLeft` / `offsetTop` ignore transforms,
       and `.morph` is carrying one every frame — the peek alone would put the
       cue several hundred pixels down the page on the first paint.

       The device is centred on the shell and taller than it (766 * k against
       the deck height the engine writes), so its foot is the shell's centre
       plus half the device — not the shell's own bottom edge. */
    const devEl = morphEl!.querySelector<HTMLElement>('.appdev');
    if (devEl) {
      /* WALK THE OFFSET CHAIN, do not read one link of it. `.scrollcue` is
         positioned against the sticky and `.morph` is positioned against
         `.lockup`, which is `max-width:1220px; margin-inline:auto` — so its own
         left edge is a different number at every window width. Reading
         `morph.offsetLeft` alone put the cue up to 190px off the device's
         centre, and the error moved as the window did, which is exactly what a
         missing link in an offset chain looks like. Same walk the peek slice
         does for `.seg` a few lines up. */
      let cx = morphEl!.offsetWidth / 2;
      let cy = morphEl!.offsetHeight / 2 + devEl.offsetHeight / 2;
      for (let n: HTMLElement | null = morphEl; n; n = n.offsetParent as HTMLElement | null) {
        cx += n.offsetLeft;
        cy += n.offsetTop;
        if (n.classList.contains('stage-sticky')) break;
      }
      root.style.setProperty('--cue-x', cx.toFixed(1) + 'px');
      root.style.setProperty('--cue-y', cy.toFixed(1) + 'px');
      /* AND WHETHER IT FITS AT ALL. On a 900px window the device runs to 840
         and the cue is 61 tall — word, gap, 34px bar — so there is no honest
         room under it. Riding up over the device was the first answer and it
         is worse than nothing: the cue is drawn in ink and the device is
         black, so it does not ride over the phone, it disappears into it. A
         cue for a gesture the reader can make anyway is the right thing to
         drop when the frame is short. 79 = the cue's own height plus the air
         under it. */
      root.style.setProperty('--cue-fit', cy + 79 <= innerHeight ? '1' : '0');
    }
  }

  /* ---- surfaces -------------------------------------------------------- */
  /* A "surface" child carries a background, a border and a shadow — today just
     the quote plate. It cannot use the type crossfade windows; see the leaving
     branch in paintCards. */
  function surface(el: Cacheable) {
    if (el.__surface === undefined) el.__surface = !!el.classList?.contains('rollquote');
    return el.__surface;
  }

  /* ==================================================================
     THE PAINT
     ================================================================== */
  function paintCards() {
    const moving = animOn;
    /* at rest the incoming card is simply "finished": progress 1 puts it at 0%,
       kills its temporary surface and lands every side child at full opacity. */
    const pos = moving ? animPos : 1;
    const fr = clamp(pos * TEXT_TAIL, 0, 1);
    const trF = pos;
    /* tp is the LINEAR side-type position. Stagger windows are expressed
       against it so they land where the numbers say. */
    const tp = clamp(pos, 0, 1);
    const a = moving ? animFrom : -1;
    const b = moving ? animTo : curIdx;
    const onStage = stageLive > 0.9;
    /* the OUTGOING card clears in the first half of the move — holding it to
       the end read muddy once the surfaces became honest about translucency */
    const outFr = lin(0.05, 0.55, fr);

    /* The shell follows the FIRST card in and out. Every other transition has
       an outgoing card holding it open, so this only does work at the ends. */
    cardsBase =
      moving && animFrom === -1 ? trF : moving && animTo === -1 ? 1 - trF : curIdx >= 0 ? 1 : 0;
    /* THE PEEK. The shell is on the page from the first paint, translated down
       so a slice of it shows above the bottom edge; the entry move carries it
       up to centre on the same curve as everything else. */
    setVar('--card-y', (PEEKY * (1 - cardsBase)).toFixed(1));
    setVar('--card-pk', (1 + (PEEKS - 1) * (1 - cardsBase)).toFixed(4));

    paintHeroAuto();

    /* The shell rides the SAME curve as the slide, so card 0 visibly shrinks
       into the Swap card instead of snapping between two sizes. fr, not trF —
       the side type finishing late must not hold the box open after the card
       has landed. -1 counts as card 0's height so nothing grows during entry. */
    const hFrom = (moving ? animFrom : curIdx) <= 0 ? MH0 : MH1;
    const hTo = (moving ? animTo : curIdx) <= 0 ? MH0 : MH1;
    sty(morphEl!, 'height', (moving ? hFrom + (hTo - hFrom) * fr : hTo).toFixed(1) + 'px');
    morphEl!.classList.toggle('moving', moving);

    /* ONE header title and ONE tab row serve all four screens, swapped at the
       midpoint of a transition while both content faces are in motion — so the
       change hides inside the move. */
    syncChrome(moving ? (fr >= 0.5 ? showFaceIdx(b) : showFaceIdx(a)) : showFaceIdx(b));

    /* -1 (hero) means face 0 rests in the shell so the peek shows a real
       interface, and on hero moves the SHELL travels — the face must not also
       slide inside it. */
    const heroMove = a === -1 || b === -1;
    const showFace = b === -1 ? 0 : b;
    for (let k = 0; k < N; k++) {
      const cf = faces.card[k];
      if (!cf) continue;
      if (k === showFace) {
        sty(cf, 'opacity', heroMove ? '1' : moving ? lin(0, 0.06, fr).toFixed(3) : '1');
        sty(cf, 'transform',
          heroMove
            ? 'translate3d(0,0,0)'
            : 'translate3d(0,' + (animDir * (1 - fr) * 100).toFixed(2) + '%,0)');
        sty(cf, 'zIndex', '2');
        /* NEVER opaque. The surface starts at 0.55 over the shell's own tint —
           darker, so the outgoing card doesn't read through — and fades
           linearly to exactly 0 at landing. */
        const bgA = (a >= 0 && !heroMove ? 1 - fr : 0) * 0.55;
        sty(cf, 'background',
          bgA > 0.01
            ? `linear-gradient(180deg,rgba(7,12,10,${bgA.toFixed(3)}),rgba(5,9,8,${bgA.toFixed(3)}))`
            : '');
        sty(cf, 'pointerEvents', onStage && (!moving || fr >= 1) ? 'auto' : 'none');
      } else if (k === a) {
        sty(cf, 'opacity', (1 - outFr).toFixed(3));
        sty(cf, 'transform', 'translate3d(0,' + (-animDir * outFr * 7).toFixed(2) + '%,0)');
        sty(cf, 'zIndex', '1');
        sty(cf, 'background', '');
        sty(cf, 'pointerEvents', 'none');
      } else {
        sty(cf, 'opacity', '0');
        sty(cf, 'zIndex', '0');
        sty(cf, 'background', '');
        sty(cf, 'pointerEvents', 'none');
      }
    }

    /* ---- THE SCREEN CHANGE, FOR THE DEVICE ------------------------------
       The loop above is the original card transition and it still reads
       correctly, but on this route it paints NOTHING: `faces.card` is
       `qsa('.cswap > .face')` and those nodes went away when the four-card
       deck became one real device. The screen inside that device is React's,
       so the change reaches it as a custom property instead of as inline
       styles on nodes this file owns.

       ONE NUMBER, AND IT IS A CROSSFADE. The card composition above also
       SLIDES the incoming face a full screen height and lays a dark veil over
       it; this route is opacity only, by decision. So the slide, the veil and
       the outgoing face's 7% drift are deliberately NOT published — see the
       note in 25-home-app.css for what the veil was for and why a fade has no
       use for it. Do not add them back thinking the device drifted from the
       deck: it was asked to.

       AND IT STAYS SCRUBBED, which is the part worth protecting. `fr` comes
       from `animPos`, which is `clamp(t - f, 0, 1)` off the scroll position, so
       the fade tracks the reader's own scroll: back up and it runs backwards,
       stop mid-way and it holds there. A CSS animation could do neither — see
       the note on `animDir` further down for why the original refused to play
       its reverse as a second animation.

       `fr` RATHER THAN A CURVE, because the reader is the curve. Easing a
       scrubbed value shapes the fade against scroll DISTANCE, which is not
       what anybody is feeling; linear against `fr` means the fade is exactly
       as fast as the wheel is.

       At rest it is the resting frame: the incoming screen fully opaque. The
       CSS carries the same value as its fallback, so a frame painted before
       the engine's first pass is already correct. */
    const swMoving = moving && !heroMove;
    setVar('--sw-in-o', swMoving ? fr.toFixed(3) : '1');
    /* React mounts the outgoing screen only while there is one. `a` is -1 on a
       hero move, which is not a screen change and must not put two decks on
       the page. */
    setCardMove(swMoving && a >= 0 && b >= 0 ? { from: a, to: b } : null);

    (['left', 'right'] as const).forEach((gname) => {
      const grp = faces[gname];
      for (let j = 0; j < N; j++) {
        const fEl = grp[j] as Cacheable;
        if (!fEl) continue;
        const kids = fEl.__kids || (fEl.__kids = Array.prototype.slice.call(fEl.children));
        if (j === a) {
          /* LEAVING — windows are on tp, the LINEAR position, not on the eased
             value. Windows on an eased input get squeezed into the front of the
             move, so a "0.40 -> 0.80" fade actually ran from 16% to 41% of real
             time and the outgoing line was gone before the incoming one
             started. On tp they mean what they say. */
          sty(fEl, 'opacity', '1');
          sty(fEl, 'pointerEvents', 'none');
          fEl.__idle = 0;
          for (let i = 0; i < kids.length; i++) {
            const kid = kids[i] as Cacheable;
            if (surface(kid)) {
              /* A FILLED CARD CANNOT SHARE THE TYPE CROSSFADE. On the old
                 shared window the plate was still at 0.19 while the incoming
                 paragraph was at 0.62. For thin glyphs that overlap is
                 invisible; for a bordered, filled, shadowed plate it is a ghost
                 box sitting on top of the next frame. So the surface LEADS the
                 exit: gone by tp 0.24, well before the incoming type starts to
                 read at 0.30. */
              sty(kid, 'opacity', (1 - lin(0, 0.24, tp)).toFixed(3));
              sty(kid, 'transform',
                'translate3d(0,' + (-animDir * 200 * lin(0, 0.3, tp)).toFixed(1) + 'px,0)');
              sty(kid, 'filter', 'none');
              continue;
            }
            /* travel spans the same window the outgoing CARD does, so the line
               and the screen it belongs to leave together. Blur starts last —
               it is masking the crossfade, and a blur that starts with the move
               just reads as the type being out of focus. */
            const ot = lin(0, 0.55 + i * 0.03, tp);
            const ob = lin(0.22 + i * 0.03, 0.5 + i * 0.03, tp);
            /* TWO-STAGE FADE, both stages linear: sheds most of its presence in
               the first 18%, then trails the rest out to the same 0.50. */
            const f1 = lin(0, 0.18 + i * 0.03, tp);
            const f2 = lin(0.18 + i * 0.03, 0.5 + i * 0.03, tp);
            sty(kid, 'opacity', ((1 - f1) * 0.65 + (1 - f2) * 0.35).toFixed(3));
            sty(kid, 'filter', qblur(ob * 9));
            sty(kid, 'transform',
              'translate3d(0,' + (-animDir * (172 + i * 50) * ot).toFixed(1) + 'px,0)');
          }
        } else if (j === b) {
          /* ARRIVING. Starts once the outgoing line has committed to leaving.
             The travel runs to the very end of the clock and is eased, so the
             last of it is that curve's flat tail — the line settles into
             position instead of stopping at it. */
          sty(fEl, 'opacity', '1');
          sty(fEl, 'pointerEvents', onStage && tp >= 1 ? 'auto' : 'none');
          fEl.__idle = 0;
          for (let m = 0; m < kids.length; m++) {
            const kd = kids[m] as Cacheable;
            if (surface(kd)) {
              /* and it arrives LAST, for the same reason it leaves first: the
                 plate must never be the thing reading over someone else's
                 type. By the time it fades up, the copy has landed. */
              sty(kd, 'opacity', lin(0.44, 0.86, tp).toFixed(3));
              sty(kd, 'transform',
                'translate3d(0,' + (animDir * (1 - lin(0.4, 1.0, tp)) * 176).toFixed(1) + 'px,0)');
              sty(kd, 'filter', 'none');
              continue;
            }
            /* 0.12 puts the copy under the finger with the card; the stagger
               between lines is 0.035 so the block reads as one thing arriving
               rather than three. */
            const pi = lin(0.12 + m * 0.035, 1.0, tp);
            sty(kd, 'opacity', lin(0.12 + m * 0.035, 0.45 + m * 0.035, tp).toFixed(3));
            sty(kd, 'filter', 'none');
            sty(kd, 'transform',
              'translate3d(0,' + (animDir * (1 - pi) * (152 + m * 46)).toFixed(1) + 'px,0)');
          }
        } else {
          sty(fEl, 'opacity', '0');
          sty(fEl, 'pointerEvents', 'none');
          /* PARK THE CHILDREN TOO. Zeroing only the FACE left every face that
             had ever left carrying blur(9px) and translate3d(0,-172px) on its
             children for the life of the page: composited layers re-rasterised
             behind an invisible parent. __idle makes this one pass, not one a
             frame. */
          if (!fEl.__idle) {
            fEl.__idle = 1;
            for (let z = 0; z < kids.length; z++) {
              sty(kids[z], 'opacity', '1');
              sty(kids[z], 'filter', 'none');
              sty(kids[z], 'transform', 'translate3d(0,0,0)');
            }
          }
        }
      }
    });

    /* THE JURISDICTION NOTE. It is pinned to the bottom of the frame, so it is
       not a child of either text column and the face loop never sees it. Same
       clock, same direction, shorter travel: legal type that flies 172px reads
       as a design element, which is the last thing it should read as. */
    if (discEl) {
      let dOn: number;
      if (!moving) dOn = curIdx === DISC_FACE ? 1 : 0;
      else if (a === DISC_FACE) dOn = 1 - lin(0, 0.3, tp);
      else if (b === DISC_FACE) dOn = lin(0.34, 0.74, tp);
      else dOn = 0;
      sty(discEl, 'opacity', dOn.toFixed(3));
      sty(discEl, 'transform',
        'translate3d(0,' + (-animDir * 46 * (1 - dOn)).toFixed(1) + 'px,0)');
    }

    syncInert();

    /* Publish the landed card to the demo flows. Only a LANDED card counts:
       mid-move both faces are in motion and neither owns the frame, and an
       autoplay that restarts on every scroll wobble reads as a glitch. */
    setActiveFace(!moving && onStage && curIdx >= 0 ? curIdx : -1);
  }

  /* ==================================================================
     THE HERO RECEDE
     ================================================================== */
  function paintHeroAuto() {
    /* ONE state. There is no held page, no separate move clock and no seam to
       bridge in a scrub, so the three-state version this replaces could not
       exist without reintroducing the "hero pops back to 100%" bug. No second
       filter either: heroOut already comes from stagePS, which is smoothed at
       SCRUB_TAU, and filtering a filtered value only adds lag the eye reads as
       the hero trailing the rest of the stage. */
    if (Math.abs(heroOut - heroLast) < 0.0005) return;
    heroLast = heroOut;
    paintHero(heroOut);
  }

  /* v04 KEYBOARD FIX. All four card faces live in the same sticky viewport, so
     without this every control on all four screens sat in the tab order at
     once — about thirty invisible buttons between the nav and the first real
     link. pointerEvents is already maintained per face; inert just follows it.

     FIXED IN THE PORT: this used to be called from paintHero, which stops
     running the moment the hero recede settles — and with no entry band the
     recede is settled from the first frame. So it ran ONCE, against whatever
     pointerEvents happened to be at that instant, and then never again: every
     face was left inert, including the one on stage, and the whole demo phone
     was unclickable. It belongs at the end of paintCards, next to the
     pointerEvents writes it mirrors. The `el.inert !== !live` guard means the
     per-frame cost is a read and a comparison. */
  function syncInert() {
    (['card', 'left', 'right'] as const).forEach((g) => {
      const grp = faces[g];
      for (let j = 0; j < grp.length; j++) {
        const el = grp[j];
        if (!el) continue;
        const live = el.style.pointerEvents === 'auto';
        if (el.inert !== !live) el.inert = !live;
      }
    });
  }

  let heroGone = false;
  function paintHero(out: number) {
    for (let w = 0; w < HW.length; w++) {
      const R = HW_RANGE[w];
      const span = R[1] - R[0];
      /* travel is smoothstep raised to a power: the first part of the move is
         almost imperceptible, then it accelerates away. Linear reads
         mechanical. */
      const mv = Math.pow(sstep(R[0], R[1], out), 2.4);
      /* blur runs on the SAME soft curve, offset to start a beat after the
         move — the type begins to drift, then softens, rather than both at
         once */
      const bl = Math.pow(sstep(R[0] + span * 0.18, R[0] + span * 0.86, out), 2.4);
      /* the last unit holds its opacity later than the others, so it is still
         visibly fading while the first card is arriving over it */
      const op = 1 - sstep(R[0] + span * (w === HW.length - 1 ? 0.5 : 0.3), R[1], out);
      HW[w].style.opacity = op.toFixed(3);
      HW[w].style.filter = qblur(bl * 15);
      /* no `scaleX(--it-x)` tail on an EM any more: the squeeze was Kepler's
         and the token is gone. It had to come out rather than be left to
         resolve to nothing — an unresolved var() invalidates the WHOLE
         declaration, which would have taken the translate and the scale with
         it and stopped the hero receding at all. */
      HW[w].style.transform =
        'translate3d(0,' + (mv * 34).toFixed(1) + 'px,0) scale(' + (1 - mv * 0.16).toFixed(4) + ')';
    }
    heroEl!.classList.toggle('live', out < 0.5);
    /* v04 mobile CTA gate. An IntersectionObserver on the hero never fires: the
       hero is absolutely positioned inside the STICKY stage, so it stays in the
       viewport for the whole stage. The recede value is the honest signal for
       "the hero is gone", and it is already computed here every frame. */
    const gone = out > 0.6;
    if (heroGone !== gone) {
      heroGone = gone;
      root.classList.toggle('hero-gone', gone);
      const mb = document.getElementById('mobcta');
      if (mb) {
        mb.setAttribute('aria-hidden', gone ? 'false' : 'true');
        const ml = mb.querySelector('a');
        if (ml) ml.tabIndex = gone ? 0 : -1;
      }
    }
    root.style.setProperty('--cue-out', sstep(0, 0.3, out).toFixed(3));
  }

  /* ==================================================================
     THE CLOSING SHRINK
     ================================================================== */
  function stepShrink() {
    /* Scrubbed off the same scroll as the cards, across the tail of the stage.
       This is what replaces the old scroll lock: you cannot scroll past the
       shrink without scrolling THROUGH it, so the thing the lock existed to
       guarantee is now structural instead of enforced. */
    shrinkT = reduce
      ? stageP > SHRINK_TRIG ? 1 : 0
      : clamp((stagePS - SHRINK_TRIG) / Math.max(1 - SHRINK_TRIG, 1e-6), 0, 1);
    /* The plate copy takes ~19% longer than the box, so it settles a beat
       after it closes. Same relationship, expressed in scroll: the copy starts
       16% later and both land together at the stage end. */
    plateT = clamp((shrinkT - 0.16) / 0.84, 0, 1);
    const e = easeShrink(shrinkT);
    setVar('--shr', e.toFixed(3));
    setVar('--ci-t', (padYMax * e).toFixed(1) + 'px');
    setVar('--ci-b', (padYMax * e).toFixed(1) + 'px');
    setVar('--ci-l', (padXMax * e).toFixed(1) + 'px');
    setVar('--ci-r', (padXMax * e).toFixed(1) + 'px');
    /* Mirror the clip into the shader (fraction per side), so the gradient's
       edge frame contracts WITH the box instead of the box cropping into the
       dimmed centre of the full-bleed composition. #gl carries scale(1.16),
       which clips 1 - 1/1.16 of the canvas before the inset even starts — fold
       that in or the frame sits outside the visible box. */
    shrinkInX = glInset + (padXMax * e) / Math.max(innerWidth, 1) / 1.16;
    shrinkInY = glInset + (padYMax * e) / Math.max(innerHeight, 1) / 1.16;
    setVar('--ci-rad', (34 * e).toFixed(1) + 'px');
    /* the backdrop is invisible behind the full-bleed gradient, so it can flip
       to light immediately — otherwise the clip first reveals black */
    setVar('--fade-light', sstep(0, 0.05, shrinkT).toFixed(3));

    /* The plate copy is the hero recede run backwards — literally the same
       curves, evaluated at (1 - progress). Because the hero's soft part sits at
       the START of its move, reversing puts it at the END here: a long, gentle
       settle into place. Headline, then italic, then the supporting line. */
    for (let w = 0; w < PW.length; w++) {
      const W = PW_RANGE[w];
      const back = 1 - sstep(W[0], W[1], plateT); /* runs 1 -> 0 */
      const mv = Math.pow(sm(back), 3.1);
      const bl = Math.pow(sstep(0.18, 0.86, sm(back)), 2.8);
      const op = 1 - sstep(0.3, 1.0, sm(back));
      PW[w].style.opacity = op.toFixed(3);
      /* Only the HEADLINE resolves out of blur. The supporting line just rises
         and fades in — blurring a paragraph reads as a rendering fault, not as
         depth, and it competes with the headline for the same moment of focus.
         PW[2] is that line; if you add another unit, decide which side of this
         it sits on. */
      PW[w].style.filter = w < 2 ? qblur(bl * 15) : 'none';
      PW[w].style.transform =
        'translate3d(0,' + (mv * 34).toFixed(1) + 'px,0) scale(' + (1 - mv * 0.16).toFixed(4) + ')';
    }

    /* nav theme follows the shrink clock, not the scroll event — otherwise it
       is still dark when the shrink finishes after the last scroll */
    const isLight = shrinkT > 0.3 || pastStage;
    nav!.classList.toggle('on-light', isLight);
    themeMeta?.setAttribute('content', isLight ? '#F3F2EF' : '#000000');

    /* the card stage clears as the plate closes in. The shell is visible from
       the first paint (the peek), so its opacity is gated ONLY by the plate
       closing in — cardsBase drives its TRAVEL, written in paintCards. */
    const live = 1 - sstep(0, 0.3, shrinkT);
    stageLive = live;
    setVar('--lock-o', live.toFixed(3));
    setVar('--card-o', live.toFixed(3));
    setVar('--card-s', (0.94 + live * 0.06).toFixed(4));
    lockEl!.classList.toggle('live', live > 0.6);
  }

  /* ==================================================================
     THE SCRUB
     ================================================================== */
  function stepCards(now: number) {
    if (booting) {
      paintCards();
      return;
    }
    /* --- SMOOTHING ----------------------------------------------------
       A scrub tracks scroll EXACTLY, and a mouse wheel is not a continuous
       input. One notch is ~110px; a card transition spans ~635px. So raw
       scrubbing gives about five hard steps per card, which is what read as
       jumpy — correctly, because the input really is stepped.
       Fix: low-pass the position the composition is drawn from. The target is
       always the live scroll, so this NEVER queues and never trails an input it
       has not seen — it is a retargeting glide, not an animation.
       Frame-rate independent on purpose: the same TAU behaves identically at
       60Hz and 120Hz, which a fixed per-frame lerp does not.

       MEASURED BUG: this used to clamp dt to 50ms, copied from the timed clocks
       where a clamp is right — there it stops one long frame from teleporting a
       TIMED move. An exponential filter chasing a LIVE TARGET is the opposite
       case: a long frame means more catching up is owed, not less. The clamp
       stays only as a backstop for a backgrounded tab, at a value no real frame
       rate can reach. */
    const sdtS = Math.min(now - (scrubPrev || now), 200);
    scrubPrev = now;

    /* THE SCRUB OWNS ITS OWN INPUT. Reading a stageP written by the scroll-gated
       frame() meant the composition ran ONE SCROLL EVENT BEHIND the scroll.
       cardLoop runs every frame regardless, so it recomputes stageP here and
       publishes it for everything else. */
    const span = Math.max(stage!.offsetHeight - innerHeight, 1);
    /* stageP stays RAW. Booleans, the snap's decisions and the hero windows all
       want the true scroll position; only the drawn composition is smoothed. */
    stageP = clamp((window.scrollY - stage!.offsetTop) / span, 0, 1);
    if (stagePS < 0 || reduce) stagePS = stageP;
    else {
      stagePS += (stageP - stagePS) * (1 - Math.exp(-sdtS / SCRUB_TAU));
      /* park it when the remaining error is under half a pixel, so a settled
         page stops repainting micro-deltas forever */
      if (Math.abs(stageP - stagePS) * span < 0.5) stagePS = stageP;
    }

    /* Reduced motion gets the cards, not the travel between them: t snaps to
       whole numbers so every frame is a landed state. */
    let t = scrubT(stagePS);
    if (reduce) t = Math.round(t);

    let f = Math.floor(t + 1e-6);
    if (f > N - 2) f = N - 2; /* keep `to` inside the deck at the end */
    animFrom = f;
    animTo = f + 1;
    animPos = clamp(t - f, 0, 1);
    /* ALWAYS +1. A reverse played with animDir -1 made scrolling back a
       DIFFERENT animation from scrolling forward. Fixed at +1, the same
       composition simply runs backwards as pos falls — which is what spatial
       consistency means, and what makes the sequence feel scrubbed rather than
       replayed. */
    animDir = 1;
    /* the epsilon is what stops a landed card from being repainted as a move
       that is 0.0001 in — paintCards takes a different path when moving */
    animOn = animPos > 0.0015 && animPos < 0.9985;
    curIdx = clamp(Math.round(t), -1, N - 1);

    /* The recede is one continuous ramp from the top of the page to the moment
       card 0 lands, off the same smoothed scroll as everything else. */
    heroOut = clamp(stagePS / Math.max(entryEnd(), 1e-6), 0, 1);
    paintCards();
  }

  /* ==================================================================
     THE SNAP — free scrub while the wheel is moving; settle to the nearest
     card once it goes quiet. Proximity in spirit, not mandatory: we only act
     after the user has actually stopped, so we are finishing their thought
     rather than steering them.
     ================================================================== */
  let snapTimer = 0, snapUntil = 0, snapPrevY = 0, snapPrevT = 0;
  let snapVel = 0, snapArmY = 0, snapDir = 1;
  let snapRAF = 0, snapFrom = 0, snapTo = 0, snapT0 = 0, snapSetY = -1;

  function snapTick() {
    const y = window.scrollY;
    /* Our own snap generates scroll events too. If the page is within a couple
       of pixels of where snapRun last put it, this is us; anything else while a
       snap is running is the user, and the user wins immediately. */
    if (snapRAF) {
      if (Math.abs(y - snapSetY) < 3) return;
      snapAbort();
    }
    const t = performance.now();
    const dt = t - snapPrevT;
    if (dt > 0 && snapPrevT) snapVel = Math.abs(y - snapPrevY) / dt;
    if (y !== snapPrevY) snapDir = y > snapPrevY ? 1 : -1;
    snapPrevY = y;
    snapPrevT = t;
    if (snapTimer) clearTimeout(snapTimer);
    snapArmY = y; /* where we were when the clock was armed */
    snapTimer = window.setTimeout(snapSettle, SNAP_IDLE);
  }

  function snapSettle() {
    if (reduce) return;
    const t = performance.now();
    if (t < snapUntil) return; /* our own smooth scroll is running */
    if (snapVel > SNAP_VMAX) { snapTick(); return; } /* still travelling */
    /* Belt and braces on the timer: if the page moved between arming the clock
       and it firing, the user is still going. A dropped frame can stretch the
       gaps between wheel events past SNAP_IDLE mid-flick, and snapping there
       would yank the page out from under a scroll in progress. */
    if (Math.abs(window.scrollY - snapArmY) > 2) { snapTick(); return; }
    const tv = scrubT(stageP);
    /* the hero and the shrink own their own ends */
    if (tv <= -1 + 0.02 || tv >= N - 1 - 0.02) return;
    /* SETTLE TO THE BOUNDARY AHEAD OF THEM, not to the nearest one. Rounding to
       nearest pulls someone who nudged down from card 1 to t=1.13 back UP to
       card 1, undoing their own input; the direction of travel is the reader's
       stated intent and it gets honoured. A scroll that clearly meant to reach
       the next card is finished for them. */
    let near = snapDir > 0 ? Math.ceil(tv) : Math.floor(tv);
    if (Math.abs(near - tv) > SNAP_REACH) {
      /* AND IF THEY BARELY ENTERED THE MOVE, PUT THEM BACK — which is the case
         this used to give up on, and the reason a reader could be left standing
         inside a transition.

         `SNAP_REACH` is 0.75, so this branch is the first quarter of a move:
         they travelled less than 25% of a step and then stopped. There is
         nothing to finish there — a quarter of the way in, the crossfade is at
         `--sw-in-o` 0.25 and the frame is two screens blended — so the honest
         resolution is the boundary they just left. It is the SHORTER of the two
         moves by construction, and it is the only place this file moves against
         the direction of travel: at most a quarter of a step, to undo a nudge
         that resolved to nothing.

         IT GOES TO THE NEAR EDGE OF THE REST BAND, NOT TO ITS START, and that
         distinction is the whole difference between a correction and a lurch.
         `yForT` of an integer resolves to where a card's rest band BEGINS —
         its own note says it "hands the reader the whole dwell rather than the
         tail of it", which is exactly right for the forward snap below and
         exactly wrong here. The rest band is ~395px; sending someone who
         travelled 3% into a move back to the start of it is a 400px reversal
         to undo a nudge worth twenty. Measured on the first card, where the
         band starts at the top of the stage, it threw the reader from 420 back
         to 0.

         So the target is the LAST scroll position that still reads as this
         card: one pixel before its move begins. `yForT(near + ε)` is the first
         pixel of the move — the -1 steps back inside the band, where `scrubT`
         returns the integer and only one screen is mounted. */
      near = snapDir > 0 ? Math.floor(tv) : Math.ceil(tv);
      near = clamp(near, 0, N - 1);
      const yBack = yForT(near + 1e-4, stage!) - 1;
      if (Math.abs(yBack - window.scrollY) < 2) return;
      snapUntil = t + 900;
      snapGo(yBack);
      return;
    }
    const gap = Math.abs(near - tv);
    if (gap < 0.02) return;         /* already settled */
    near = clamp(near, 0, N - 1);
    const y = yForT(near, stage!);
    if (Math.abs(y - window.scrollY) < 2) return;
    snapUntil = t + 900;
    snapGo(y);
  }

  function snapGo(y: number) {
    if (snapRAF) cancelAnimationFrame(snapRAF);
    snapFrom = window.scrollY;
    snapTo = y;
    snapT0 = performance.now();
    snapRAF = requestAnimationFrame(snapRun);
  }
  function snapRun(now: number) {
    const k = clamp((now - snapT0) / SNAP_MS, 0, 1);
    const e = 1 - Math.pow(1 - k, 3);
    snapSetY = Math.round(snapFrom + (snapTo - snapFrom) * e);
    window.scrollTo(0, snapSetY);
    snapRAF = k < 1 ? requestAnimationFrame(snapRun) : 0;
  }
  function snapAbort() {
    if (snapRAF) { cancelAnimationFrame(snapRAF); snapRAF = 0; snapUntil = 0; }
  }

  /* ==================================================================
     THE STEP RAIL
     ================================================================== */
  const dotsEl = document.getElementById('stepdots');
  const dotBtns = dotsEl ? Array.prototype.slice.call(dotsEl.querySelectorAll('button')) as HTMLElement[] : [];
  let dotsShown = -1, dotsIdx = -1;
  function paintDots() {
    if (!dotsEl) return;
    /* The rail follows the CARD, not the scroll: a rail reading EARN while the
       Swap screen is up is just wrong, however faithfully it reports the scroll
       offset. Visibility follows the sequence too — gated on scroll position it
       vanished mid-Swap on a fast flick, because the scroll had already run
       past the shrink trigger while the cards were still behind. */
    const on = (curIdx >= 0 || animOn) && stageLive > 0.5 && !pastStage ? 1 : 0;
    if (on !== dotsShown) { dotsShown = on; dotsEl.classList.toggle('on', !!on); }
    const i = clamp(curIdx < 0 ? 0 : curIdx, 0, N - 1);
    if (i === dotsIdx) return;
    dotsIdx = i;
    for (let k = 0; k < dotBtns.length; k++) {
      const st = k < i ? 'done' : k === i ? 'now' : 'next';
      dotBtns[k].className = st;
      if (st === 'now') dotBtns[k].setAttribute('aria-current', 'step');
      else dotBtns[k].removeAttribute('aria-current');
    }
  }
  const dotHandlers = dotBtns.map((btn, i) => {
    const h = () => {
      /* one source of truth for where a card lives */
      window.scrollTo({ top: Math.round(yForT(i, stage!)), behavior: reduce ? 'auto' : 'smooth' });
    };
    btn.addEventListener('click', h);
    return h;
  });

  /* ==================================================================
     THE SCROLL-GATED FRAME — measurement only; nothing here paints motion
     ================================================================== */
  function frameRest(p: number, rect: DOMRect) {
    surge = sstep(T_COVER[0], T_COVER[1], p) * (1 - sstep(0.3, 0.467, p) * 0.55);
    root.style.setProperty('--surge', surge.toFixed(4));
    /* the plate is measured here so the copy is sized to the FINAL box and
       never to the animating clip — nothing re-wraps mid-shrink */
    const availW = innerWidth * 0.94;
    const availH = innerHeight * 0.74;
    boxW = Math.min(availW, (availH * 4) / 3);
    let boxH = (boxW * 3) / 4;
    if (boxH > availH) { boxH = availH; boxW = (boxH * 4) / 3; }
    padXMax = (innerWidth - boxW) / 2;
    padYMax = (innerHeight - boxH) / 2;
    root.style.setProperty('--box-w', boxW.toFixed(0) + 'px');
    pastStage = rect.bottom <= innerHeight * 0.6;
    stageP = p;
    paintDots();
  }

  function frame() {
    ticking = false;
    const rect = stage!.getBoundingClientRect();
    const p = clamp(-rect.top / (stage!.offsetHeight - innerHeight), 0, 1);
    /* back inside the pinned stage = the CTA contract re-arms, so the next trip
       to the bottom plays the shrink again */
    if (p < 0.995) callCtaRearm();
    paintHeroAuto();
    frameRest(p, rect);
  }

  function onScroll() {
    snapTick();
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }
  function onResize() { measureShell(); onScroll(); }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onResize);
  measureShell();
  frame();

  /* The peek slice is derived from where the Receive/Send row actually sits,
     which moves when the display face finishes loading and a line stops
     wrapping. Measured once at boot it is ~19px stale for the life of the page.
     Re-measure when the fonts land; `load` catches a cold cache where they land
     after that promise has already resolved. */
  const remeasure = () => { measureShell(); onScroll(); };
  document.fonts?.ready.then(remeasure);
  addEventListener('load', remeasure);

  /* ---- boot: adopt the restored scroll position instead of replaying ----
     Browsers restore scroll on reload. Seeding sets the state the scroll
     position implies with no animation, so nothing is pending and nothing
     holds. Deferred one frame so it runs after layout has settled — the
     stage's pixel height is what p is measured against. */
  requestAnimationFrame(() => {
    measureShell();
    frame();
    heroLast = -1;   /* force a repaint at the seeded level */
    snapPrevY = window.scrollY;
    booting = false;
    /* One scrub paint at the restored position and every value is correct.
       There is no sequence to replay, so the refresh-mid-stage freeze that the
       queued version had cannot happen. */
  });

  /* ---- the CTA ripple ------------------------------------------------- */
  const rippleEls = qsa('.ripple-cta');
  const rippleHandlers = rippleEls.map((el) => {
    const h = () => { if (!reduce) fireRipple(el); };
    el.addEventListener('pointerenter', h);
    el.addEventListener('focus', h);
    return h;
  });

  /* ==================================================================
     THE LOOPS
     The card loop is registered BEFORE the GL loop ON PURPOSE. rAF callbacks
     run in registration order, and the shader reads shrinkInX/Y that
     stepShrink writes: registered the other way round, every shrink frame drew
     the gradient's internal frame one frame BEHIND the CSS clip — at the
     shrink's fastest stretch that was a 30-100px misalignment crawling along
     the box edge.
     ================================================================== */
  let cardRAF = 0;
  cardRAF = requestAnimationFrame(function cardLoop(ms) {
    stepCards(ms);
    stepShrink();
    stepRipple(ms);
    paintDots();
    cardRAF = requestAnimationFrame(cardLoop);
  });

  /* ---- pointer activity ----------------------------------------------- */
  /* Smoothed light position in viewport px. Starts at the home orbit's
     neighbourhood so the first paint matches the no-pointer composition. */
  let activity = 0, lastPX = 0, lastPY = 0, havePointer = false;
  let ptrSX = innerWidth * 0.84, ptrSY = innerHeight * 0.16;
  function onPointerMove(e: PointerEvent) {
    if (havePointer) {
      const dx = e.clientX - lastPX, dy = e.clientY - lastPY;
      /* a fast flick should WARM the field, not whip it — activity is capped at
         1 and the tempo gain is deliberately small */
      activity = clamp(activity + Math.sqrt(dx * dx + dy * dy) / 800, 0, 1);
    }
    lastPX = e.clientX;
    lastPY = e.clientY;
    havePointer = true;
  }
  addEventListener('pointermove', onPointerMove, { passive: true });

  const GL = makeGradientField(document.getElementById('gl') as HTMLCanvasElement | null);
  let glRAF = 0, glRO: ResizeObserver | null = null, glIO: IntersectionObserver | null = null;
  const onGLResize = () => GL?.resize();
  /* the canvas box only moves when the page scrolls out of the sticky range;
     re-measuring it there is what lets `draw()` stop measuring it at all */
  const onGLScroll = () => GL?.measure();
  if (GL) {
    GL.resize();
    addEventListener('resize', onGLResize);
    let prev = 0;
    /* ---- THE FIELD MOVES AGAIN, ON A BUDGET -------------------------------
       `simTime` was pinned at 0 in v06.1, which is what froze the composition:
       the shader's own drift terms (`dr`, the slow field, the swirl's sine) are
       all functions of uTime, so a constant clock is a still image. It moves
       again — under four gates, because the reason it was stopped was real.

       WHY IT WAS STOPPED. A redraw is not free even when the pixels match, and
       `draw()` opened with a getBoundingClientRect(): sixty forced layouts a
       second on the one main thread that also carries a 588vh scroll, the card
       sequence, React, and the phone's own rAF writers. It measured 3.805s of
       main-thread task time in a 4s window. What the viewer got for that was
       scroll judder and the demo's numbers arriving in steps.

       WHAT PAYS FOR IT NOW, in the order the frame budget notices:

         · the forced layout is gone — see `measure()` in gradientField.ts
         · TIME-DRIVEN redraws are capped at 30fps. The field is low-frequency,
           blurred by 12–30px of CSS and upscaled from a 0.375x buffer; there is
           no detail in it that 30 can show and 60 cannot. Half the draws.
         · INPUT-driven redraws are NOT capped. Scroll parallax, the shrink and
           the CTA ripple still land on the frame they happen, because those are
           the ones a viewer can actually catch lagging.
         · nothing is drawn while the canvas is off screen or the tab is hidden.
           The stage is 588vh; past it the sticky child is gone and the old loop
           kept painting it anyway.

       Reduced motion keeps the still, which is the whole point of the setting. */
    const FRAME = 1000 / 30;
    let simTime = 0, lastDraw = -1e9;
    /* `visible` starts true so the first paint happens even where there is no
       IntersectionObserver to say otherwise. */
    let visible = true;
    let sgS = 0, glSig = '', glDirty = 1;
    const markDirty = () => { glDirty = 1; };
    addEventListener('resize', markDirty);
    addEventListener('scroll', onGLScroll, { passive: true });
    /* A ResizeObserver is the right primitive here: the canvas box can change
       without a window resize, and it fires exactly when the box changes and
       never reads layout on a frame where it did not. */
    if (window.ResizeObserver) {
      glRO = new ResizeObserver(() => { GL.resize(); glDirty = 1; });
      glRO.observe(GL.el);
    }
    /* OFF SCREEN IS OFF. A 588vh scroller means the stage spends most of the
       page's height behind the viewport, and a field nobody can see costs
       exactly as much to draw as one they can. */
    if (window.IntersectionObserver) {
      glIO = new IntersectionObserver(
        (es) => { visible = es[0].isIntersecting; if (visible) glDirty = 1; },
        { rootMargin: '10%' },
      );
      glIO.observe(GL.el);
    }
    glRAF = requestAnimationFrame(function loop(ms) {
      const dt = prev ? Math.min((ms - prev) / 1000, 0.05) : 0;
      if (!prev) GL.el.classList.add('on');
      prev = ms;
      activity *= 0.962;
      ptrSX += (innerWidth * 0.82 - ptrSX) * (1 - Math.exp(-dt / 0.65));
      ptrSY += (innerHeight * 0.14 - ptrSY) * (1 - Math.exp(-dt / 0.65));
      /* surge is scroll-mapped and steps with raw wheel deltas — a fast flick
         used to zoom the composition in visible jumps. 120ms low-pass: the
         cover move reads identically, the steps disappear. */
      sgS += (surge - sgS) * (1 - Math.exp(-dt / 0.12));
      if (Math.abs(surge - sgS) < 0.001) sgS = surge;

      /* THE CLOCK IS NOT WALL TIME. It advances only on frames the field is
         actually being drawn on, so a tab that comes back from the background
         resumes the composition where it left it instead of jumping forward by
         however long nobody was looking. Pointer activity warms the tempo a
         little — the same `activity` the surge already uses. */
      const live = visible && !document.hidden && !reduce;
      if (live) simTime += dt * (1 + activity * 0.5);

      /* ---- WHAT IS WORTH A DRAW --------------------------------------
         Every live input is in the signature; scrollY is one of them, because
         the shader has a scroll parallax term. glDirty covers resize, where the
         drawing buffer is reallocated. A signature change is a redraw NOW; the
         clock alone is a redraw at 30fps. */
      const sig =
        sgS.toFixed(4) + '|' + ptrSX.toFixed(1) + '|' + ptrSY.toFixed(1) + '|' +
        shrinkInX.toFixed(4) + '|' + shrinkInY.toFixed(4) + '|' + (window.scrollY || 0) + '|' +
        RIP.a + '|' + RIP.t.toFixed(3);
      const moved = glDirty || sig !== glSig;
      if ((moved && (visible || glDirty)) || (live && ms - lastDraw >= FRAME)) {
        glSig = sig;
        glDirty = 0;
        lastDraw = ms;
        GL.draw(simTime, sgS, ptrSX, ptrSY, shrinkInX, shrinkInY);
      }
      glRAF = requestAnimationFrame(loop);
    });
  }

  /* ---- teardown -------------------------------------------------------- */
  return () => {
    removeEventListener('scroll', onScroll);
    removeEventListener('resize', onResize);
    removeEventListener('load', remeasure);
    removeEventListener('pointermove', onPointerMove);
    removeEventListener('resize', onGLResize);
    removeEventListener('scroll', onGLScroll);
    dotBtns.forEach((b, i) => b.removeEventListener('click', dotHandlers[i]));
    rippleEls.forEach((el, i) => {
      el.removeEventListener('pointerenter', rippleHandlers[i]);
      el.removeEventListener('focus', rippleHandlers[i]);
    });
    cancelAnimationFrame(cardRAF);
    cancelAnimationFrame(glRAF);
    snapAbort();
    if (snapTimer) clearTimeout(snapTimer);
    glRO?.disconnect();
    glIO?.disconnect();
  };
}
