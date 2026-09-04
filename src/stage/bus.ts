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
   WHICH TWO CARDS ARE MID-MOVE
   `activeFace` above answers "which one owns the frame", and answers
   -1 while a move is in flight. That was enough while the thing on
   stage was a deck of four card faces, all of them in the DOM at
   once: the engine could paint the outgoing and the incoming itself.

   The device is React's, and only the chapter on stage is mounted —
   so for the incoming screen to slide in OVER the outgoing one, React
   has to know both indices for the length of the move. That is all
   this publishes. The MOTION is not here: `fr` changes every frame and
   travels as a custom property (see `--sw-*` in engine.ts), because
   routing sixty re-renders a second through React to move one
   translate would be the wrong tool twice.
   ------------------------------------------------------------------ */

export type CardMove = { from: number; to: number };

let cardMove: CardMove | null = null;
const moveSubs = new Set<(m: CardMove | null) => void>();

export function setCardMove(m: CardMove | null) {
  /* the engine calls this every frame; only a CHANGE is worth a render */
  const same =
    m === cardMove || (!!m && !!cardMove && m.from === cardMove.from && m.to === cardMove.to);
  if (same) return;
  cardMove = m;
  moveSubs.forEach((fn) => fn(m));
}

export function subscribeCardMove(fn: (m: CardMove | null) => void) {
  moveSubs.add(fn);
  fn(cardMove);
  return () => {
    moveSubs.delete(fn);
  };
}
