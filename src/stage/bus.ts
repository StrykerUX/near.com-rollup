/**
 * The places the imperative engine has to reach into React-owned state.
 *
 * Module slots rather than DOM CustomEvents on purpose: React runs a parent's
 * effect AFTER its children's, so an event-based handshake would be a race
 * between whichever of the engine and its listeners mounted first. A slot has
 * no ordering to get wrong — whoever arrives second simply finds the other
 * already there.
 */

let ctaRearm: (() => void) | null = null;
/** Registered by the final CTA; returns its own unregister. */
export function setCtaRearm(fn: (() => void) | null) {
  ctaRearm = fn;
  return () => {
    if (ctaRearm === fn) ctaRearm = null;
  };
}
export const callCtaRearm = () => ctaRearm?.();

/* ------------------------------------------------------------------
   WHICH CARD IS ON STAGE
   The demo screens autoplay, and a screen that plays while it is off
   frame is a battery cost nobody sees. The engine already knows which
   face is current and whether the stage is live; this publishes it so
   the flows can start and stop themselves.

   -1 means "no card owns the frame" — mid-transition, or the closing
   plate has taken over.
   ------------------------------------------------------------------ */

let activeFace = -1;
const faceSubs = new Set<(i: number) => void>();

export function setActiveFace(i: number) {
  if (i === activeFace) return;
  activeFace = i;
  faceSubs.forEach((fn) => fn(i));
}

export function subscribeActiveFace(fn: (i: number) => void) {
  faceSubs.add(fn);
  fn(activeFace);
  return () => {
    faceSubs.delete(fn);
  };
}

/* ------------------------------------------------------------------
   STAGE PROGRESS
   The demo screens are a function of scroll, exactly as the cards above
   them are. This publishes the SMOOTHED position the composition is
   drawn from — not the raw scroll — so the phone and the card it sits
   in move on the same clock and can never disagree.
   ------------------------------------------------------------------ */

let stageProgress = 0;
const progressSubs = new Set<(p: number) => void>();

export function setStageProgress(p: number) {
  /* a scrub that has settled writes the same number every frame; the flows
     have nothing to do with those and should not be woken for them */
  if (Math.abs(p - stageProgress) < 0.0004) return;
  stageProgress = p;
  progressSubs.forEach((fn) => fn(p));
}

export function subscribeStageProgress(fn: (p: number) => void) {
  progressSubs.add(fn);
  fn(stageProgress);
  return () => {
    progressSubs.delete(fn);
  };
}
