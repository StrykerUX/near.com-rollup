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
   WHICH SCREEN THE DEVICE SHOULD HAVE MOUNTED, RIGHT NOW

   `activeFace` above answers "which card owns the frame", and answers -1
   while a move is in flight. The device needs a different question
   answered: it holds ONE screen and swaps it in the blind — the screen
   fades to the floor, the chapter changes while nothing is visible, and
   it fades back up. So what it needs is not the pair, it is the index
   that is correct at this instant, which during a move flips at the
   midpoint rather than at the landing.

   THE MOTION IS NOT HERE. The fade is `--sw-o`, a custom property the
   engine writes every frame (see engine.ts). Routing sixty re-renders a
   second through React to move one opacity would be the wrong tool; this
   changes twice per move, which is what React is for.
   ------------------------------------------------------------------ */

let shownFace = -1;
const shownSubs = new Set<(i: number) => void>();

export function setShownFace(i: number) {
  if (i === shownFace) return;
  shownFace = i;
  shownSubs.forEach((fn) => fn(i));
}

export function subscribeShownFace(fn: (i: number) => void) {
  shownSubs.add(fn);
  fn(shownFace);
  return () => {
    shownSubs.delete(fn);
  };
}
